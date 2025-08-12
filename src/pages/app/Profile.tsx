import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Calendar, Check, Edit3, Globe, Mail, MapPin, Shield, User, X } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Utility to set or update a meta tag
const setMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

// User types with icons and colors
const USER_TYPES = {
  Vecino: { 
    icon: User, 
    label: "Vecino", 
    color: "bg-secondary text-secondary-foreground",
    description: "Miembro de la comunidad"
  },
  Productor: { 
    icon: Shield, 
    label: "Productor", 
    color: "bg-accent text-accent-foreground",
    description: "Generador de materiales"
  },
  Comuna: { 
    icon: Globe, 
    label: "Comuna", 
    color: "bg-primary text-primary-foreground",
    description: "Organización oficial"
  },
} as const;

// Form values type
type ProfileFormValues = {
  fullName: string;
  neighborhood: string;
  email: string;
  userType: keyof typeof USER_TYPES;
  bio?: string;
  phone?: string;
};

// Profile data type
type ProfileData = {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // State
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: "",
      neighborhood: "",
      email: "",
      userType: "Vecino",
      bio: "",
      phone: "",
    },
  });

  // Load profile data
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        form.reset({
          fullName: data.full_name || "",
          neighborhood: data.username || "", // Using username as neighborhood for now
          email: user.email || "",
          userType: "Vecino", // Default as this field doesn't exist in DB yet
          bio: data.bio || "",
          phone: data.phone || "",
        });
        setAvatarUrl(data.avatar_url || undefined);
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || "",
            username: user.user_metadata?.username || user.email?.split('@')[0] || "",
          })
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
        form.reset({
          fullName: newProfile.full_name || "",
          neighborhood: newProfile.username || "",
          email: user.email || "",
          userType: "Vecino",
          bio: "",
          phone: "",
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Mi perfil | Circulapp";
    setMeta(
      "description",
      "Edita tu perfil en Circulapp: nombre, zona, tipo de usuario y foto de perfil."
    );
  }, []);

  const initials = useMemo(() => {
    const n = form.getValues("fullName");
    if (!n) return "US";
    const parts = n.trim().split(/\s+/);
    return (parts[0]?.[0] || "U") + (parts[1]?.[0] || "S");
  }, [form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.fullName,
          username: values.neighborhood,
          bio: values.bio,
          phone: values.phone,
          avatar_url: avatarUrl,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        full_name: values.fullName,
        username: values.neighborhood,
        bio: values.bio || null,
        phone: values.phone || null,
        avatar_url: avatarUrl || null,
      } : null);

      toast({
        title: "Perfil actualizado",
        description: "Tus cambios se guardaron correctamente.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    }
  };

  const handleAvatarPick = () => fileInputRef.current?.click();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };

  // Get user type info
  const userTypeInfo = USER_TYPES[form.watch("userType")];
  const UserTypeIcon = userTypeInfo.icon;

  // Get auth provider info
  const getAuthProvider = () => {
    if (!user?.app_metadata?.provider) return null;
    const provider = user.app_metadata.provider;
    if (provider === 'google') return { name: 'Google', icon: '🔍' };
    if (provider === 'facebook') return { name: 'Facebook', icon: '📘' };
    return null;
  };

  const authProvider = getAuthProvider();

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <Card className="animate-pulse">
          <CardContent className="p-8">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-muted h-20 w-20"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-48"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No se pudo cargar el perfil</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Profile View */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Mi Perfil</CardTitle>
              <CardDescription>
                Tu información en la comunidad Circulapp
              </CardDescription>
            </div>
            <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
              <Edit3 className="h-4 w-4" />
              Editar perfil
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-[200px_1fr]">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={avatarUrl || profile.avatar_url || undefined} alt="Foto de perfil" />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <Badge className={userTypeInfo.color}>
                <UserTypeIcon className="h-3 w-3 mr-1" />
                {userTypeInfo.label}
              </Badge>
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{profile.full_name || "Sin nombre"}</h3>
                  <p className="text-sm text-muted-foreground">{userTypeInfo.description}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.email}</span>
                  </div>
                  
                  {profile.username && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.username}</span>
                    </div>
                  )}
                  
                  {profile.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-4 w-4 text-center text-muted-foreground">📞</span>
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Desde {new Date(profile.created_at).toLocaleDateString('es-AR')}</span>
                  </div>
                </div>

                {profile.bio && (
                  <div>
                    <h4 className="font-medium mb-2">Acerca de mí</h4>
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  </div>
                )}

                {authProvider && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{authProvider.icon}</span>
                      <span>Sesión iniciada con {authProvider.name}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
            <DialogDescription>
              Actualizá tu información para conectar mejor con tu comunidad.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || profile.avatar_url || undefined} alt="Foto de perfil" />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={handleAvatarPick}>
                  Cambiar foto
                </Button>
                {(avatarUrl || profile.avatar_url) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
                      setAvatarUrl(undefined);
                    }}
                  >
                    Quitar
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-label="Seleccionar nueva foto de perfil"
                onChange={handleFileChange}
              />
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Ana García" {...field} />
                      </FormControl>
                      <FormDescription>Así te verán otros usuarios.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección aproximada</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Barrio Centro, Zona Norte" {...field} />
                      </FormControl>
                      <FormDescription>Usá solo barrio o zona, sin dirección exacta.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly disabled aria-readonly value={field.value} />
                      </FormControl>
                      <FormDescription>Tu email no se puede modificar desde aquí.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de usuario</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Elegí una opción" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(USER_TYPES).map(([key, type]) => {
                            const Icon = type.icon;
                            return (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{type.label}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormDescription>Elegí el rol que mejor te representa.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acerca de mí (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Contanos un poco sobre vos..." {...field} />
                      </FormControl>
                      <FormDescription>Una breve descripción para la comunidad.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: +54 9 11 1234-5678" {...field} />
                      </FormControl>
                      <FormDescription>Para contacto directo (opcional).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <Check className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
