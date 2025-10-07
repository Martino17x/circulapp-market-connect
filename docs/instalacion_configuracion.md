# Instalación y Configuración

Guía para levantar el proyecto localmente y configurar variables sensibles.

## Requisitos
- Node 18+
- PNPM o NPM
- Cuenta de Supabase (o Supabase local con `supabase start`)

## Variables de entorno
Crear un archivo `.env.local` en la raíz con:

```bash
VITE_SUPABASE_URL=TU_URL
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
```

Notas:
- En `src/integrations/supabase/client.ts` se usan estas variables.
- No subir `.env.local` al repositorio.

## Instalación
```bash
npm install
# o pnpm install
```

## Desarrollo
```bash
npm run dev
```
La app se sirve (por defecto) en `http://localhost:5173`.

## Build
```bash
npm run build
npm run preview
```

## Supabase local (opcional)
Si usas Supabase local, configura las variables con la URL y ANON KEY locales y aplica las migraciones de `supabase/migrations/` usando la CLI de Supabase.

## PWA
`PWAInstallPrompt` está montado en `src/App.tsx`. Para pruebas de PWA, construir y servir en `https` o usar `npm run preview`.
