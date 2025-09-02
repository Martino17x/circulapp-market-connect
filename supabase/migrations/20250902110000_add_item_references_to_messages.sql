-- Add item reference to messages table
ALTER TABLE public.messages 
ADD COLUMN item_id UUID REFERENCES public.items(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_messages_item_id ON public.messages(item_id);

-- Update RLS policies to allow viewing messages with item references
-- (The existing policies already cover this case, no changes needed)

-- Function to create conversation and send initial message with item reference
CREATE OR REPLACE FUNCTION public.start_conversation_about_item(
  other_user_id UUID,
  item_id UUID,
  initial_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
  message_content TEXT;
BEGIN
  -- Get or create conversation
  SELECT public.get_or_create_conversation(auth.uid(), other_user_id) INTO conversation_id;
  
  -- Set default message if none provided
  IF initial_message IS NULL THEN
    SELECT CONCAT('Hola, me interesa tu publicación: "', title, '"') 
    INTO message_content
    FROM public.items 
    WHERE id = item_id;
  ELSE
    message_content := initial_message;
  END IF;
  
  -- Send initial message with item reference
  INSERT INTO public.messages (conversation_id, sender_id, content, item_id)
  VALUES (conversation_id, auth.uid(), message_content, item_id);
  
  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
