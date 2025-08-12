import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

// Form values type
type ProfileFormValues = {
  fullName: string;
  neighborhood: string;
  email: string;
  userType: "Vecino" | "Productor" | "Comuna";
};

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Local avatar preview state (no backend yet)
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: "Ana García",
      neighborhood: "Barrio Centro",
      email: "ana@email.com",
      userType: "Vecino",
    },
  });

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

  const onSubmit = (values: ProfileFormValues) => {
    // Simulación de guardado
    console.log("Perfil guardado", { ...values, avatarUrl });
    toast({
      title: "Perfil actualizado",
      description: "Tus cambios se guardaron correctamente.",
    });
    navigate("/app");
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

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl">Mi perfil</CardTitle>
          <CardDescription>
            Actualizá tu información para conectar mejor con tu comunidad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-[200px_1fr]">
            {/* Avatar + acciones */}
            <section aria-labelledby="avatar-title" className="flex flex-col items-center gap-3 md:items-start">
              <h2 id="avatar-title" className="sr-only">Foto de perfil</h2>

              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl} alt="Foto de perfil" />
                <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={handleAvatarPick}>
                  Cambiar foto
                </Button>
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      URL.revokeObjectURL(avatarUrl);
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
            </section>

            {/* Formulario */}
            <section aria-labelledby="profile-form-title">
              <h2 id="profile-form-title" className="sr-only">Editar información personal</h2>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger aria-label="Seleccionar tipo de usuario">
                              <SelectValue placeholder="Elegí una opción" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Vecino">Vecino</SelectItem>
                            <SelectItem value="Productor">Productor</SelectItem>
                            <SelectItem value="Comuna">Comuna</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Elegí el rol que mejor te representa.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Guardar cambios</Button>
                  </div>
                </form>
              </Form>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
