# Chat y Comunicación en Tiempo Real

Este documento detalla la arquitectura del chat implementado en Circulapp, cubriendo componentes de frontend, hooks, dependencias de Supabase y flujos de interacción relevantes.

## Vista general

- El chat vive en `src/pages/app/ChatPage.tsx` y ofrece lista de conversaciones, búsqueda de contactos, lectura y envío de mensajes con soporte mobile/desktop.
- Las conversaciones y mensajes se persisten en las tablas `conversations` y `messages` creadas en la migración `20250902100000_create_chat_system.sql` y extendidas en `20250902110000_add_item_references_to_messages.sql`.
- El sistema funciona 100% sobre Supabase: consultas, mutaciones y suscripciones en tiempo real.

## Frontend

- `ChatPage.tsx` gestiona selección de conversación, vista responsive, contadores no leídos y panel de mensajes. Usa componentes de UI (`Avatar`, `Badge`, `Button`, etc.) para mantener consistencia visual.
- `MessageItemReference.tsx` muestra un resumen del ítem referenciado cuando un mensaje incluye `item_id`.
- `ItemCard.tsx` y `ItemDetail.tsx` disparan conversaciones mediante la RPC `start_conversation_about_item`, navegando luego a `/app/chat?conversation=:id`.

## Hooks reutilizables

- `useConversations.ts`
  - Obtiene conversaciones donde participa el usuario autenticado (consultas separadas por `participant_1`/`participant_2`).
  - Enriquecimiento: carga perfil del otro participante desde `profiles`, trae último mensaje y conteo de no leídos.
  - Suscripciones: `supabase.channel('conversations')` y `supabase.channel('messages')` refrescan la lista ante inserciones/actualizaciones.
  - Expone `createConversation()` (RPC `get_or_create_conversation`) y `refetch()`.

- `useMessages.ts`
  - Consulta mensajes de una conversación (`messages`) junto con la relación `item:items(...)`.
  - Marca mensajes como leídos (`read_at`) al cargarlos y en tiempo real.
  - `sendMessage()` inserta nuevos mensajes y devuelve la versión con datos de ítem.
  - `startConversationAboutItem()` invoca la RPC `start_conversation_about_item` para iniciar rápidamente un chat desde un ítem.
  - Suscripciones dedicadas (`messages:${conversationId}` y `message-updates:${conversationId}`) mantienen la UI sincronizada.

## Dependencias de Supabase

- RPCs disponibles en las migraciones:
  - `get_or_create_conversation(user1_id uuid, user2_id uuid)` → crea o devuelve conversación existente.
  - `start_conversation_about_item(other_user_id uuid, item_id uuid, initial_message text)` → inicia conversación y envía mensaje inicial con vínculo a ítem.
- Tablas: `conversations`, `messages` con RLS que restringe SELECT e INSERT a participantes.
- Índices y triggers (ver migraciones) aseguran orden cronológico y actualización de `updated_at`.

## Flujos clave

1. **Iniciar chat desde ítem**
   - Usuario pulsa "Contactar" (`ItemCard` o `ItemDetail`).
   - Se ejecuta RPC `start_conversation_about_item` con `item_id`.
   - El frontend navega a `ChatPage` con el parámetro `conversation` para abrir la conversación.

2. **Actualización en tiempo real**
   - Inserciones en `messages` disparan la suscripción en `useMessages`, que añade el mensaje y lo marca como leído si corresponde.
   - `useConversations` escucha los mismos eventos para refrescar contador de no leídos y último mensaje.

3. **Lectura de mensajes**
   - Al cargar una conversación, `useMessages` ejecuta `UPDATE messages SET read_at = NOW()` sobre mensajes ajenos, manteniendo consistencia entre dispositivos.

## Consideraciones y próximos pasos

- Mantener el cliente de Supabase autenticado para que las suscripciones funcionen; `AuthProvider` limpia tokens en sign-in/out para evitar estados inconsistentes.
- Al añadir nuevas funcionalidades (adjuntos, eliminación de mensajes), revisar y ampliar las políticas RLS y triggers.
- Para métricas o historial administrativo, ver documento `docs/sistema_administracion.md` (ideas de auditoría y advertencias).
- Pendiente implementar notificaciones push y estados "escribiendo"; revisar el anexo técnico para roadmap.
