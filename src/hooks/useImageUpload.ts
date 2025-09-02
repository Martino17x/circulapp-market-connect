import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UploadResult {
  url: string;
  path: string;
}

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();

  const uploadImage = async (file: File, itemId?: string): Promise<UploadResult | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para subir imágenes",
        variant: "destructive"
      });
      return null;
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se permiten archivos JPG, PNG, WebP y GIF",
        variant: "destructive"
      });
      return null;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El archivo debe ser menor a 5MB",
        variant: "destructive"
      });
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${itemId || 'temp'}/${fileName}`;

      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from('item-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(filePath);

      setUploadProgress(100);
      
      return {
        url: publicUrl,
        path: filePath
      };

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error al subir imagen",
        description: error.message || "No se pudo subir la imagen",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadMultipleImages = async (files: File[], itemId?: string): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const result = await uploadImage(files[i], itemId);
      if (result) {
        results.push(result);
      }
      setUploadProgress(((i + 1) / files.length) * 100);
    }
    
    return results;
  };

  const deleteImage = async (path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('item-images')
        .remove([path]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error al eliminar imagen",
        description: error.message || "No se pudo eliminar la imagen",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    isUploading,
    uploadProgress
  };
};
