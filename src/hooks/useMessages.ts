import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  item_id: string | null;
  item?: {
    id: string;
    title: string;
    material_type: string;
    image_url: string | null;
  } | null;
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchMessages = async () => {
    if (!conversationId || !user) return;

    try {
      setLoading(true);
      
      const { data, error: messagesError } = await (supabase as any)
        .from('messages')
        .select(`
          *,
          item:items(id, title, material_type, image_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      setMessages((data || []) as any);

      // Mark messages as read
      await (supabase as any)
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, itemId?: string) => {
    if (!conversationId || !user || !content.trim()) return null;

    try {
      const { data, error } = await (supabase as any)
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          item_id: itemId || null
        })
        .select(`
          *,
          item:items(id, title, material_type, image_url)
        `)
        .single();

      if (error) throw error;

      // Add message to local state immediately for better UX
      if (data) {
        setMessages(prev => [...prev, data as any]);
      }

      return data as any;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar mensaje');
      return null;
    }
  };

  const startConversationAboutItem = async (otherUserId: string, itemId: string, initialMessage?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await (supabase as any).rpc('start_conversation_about_item', {
        other_user_id: otherUserId,
        item_id: itemId,
        initial_message: initialMessage || `Hola, estoy interesado en tu publicación: ${itemId}`
      }); 
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar conversación');
      return null;
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages();

      // Subscribe to new messages in this conversation
      const messageSubscription = supabase
        .channel(`messages:${conversationId}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          }, 
          async (payload) => {
            const newMessage = payload.new as Message;
            
            // Fetch complete message with item data if needed
            if (newMessage.item_id) {
              const { data: completeMessage } = await (supabase as any)
                .from('messages')
                .select(`
                  *,
                  item:items(id, title, material_type, image_url)
                `)
                .eq('id', newMessage.id)
                .single();
              
              if (completeMessage) {
                setMessages(prev => [...prev, completeMessage]);
              } else {
                setMessages(prev => [...prev, newMessage]);
              }
            } else {
              setMessages(prev => [...prev, newMessage]);
            }
            
            // Mark as read if not sent by current user
            if (newMessage.sender_id !== user?.id) {
              (supabase as any)
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', newMessage.id)
                .then();
            }
          }
        )
        .subscribe();

      // Also subscribe to message updates for real-time sync
      const messageUpdateSubscription = supabase
        .channel(`message-updates:${conversationId}`)
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          () => {
            // Refresh messages when any message is updated
            fetchMessages();
          }
        )
        .subscribe();

      return () => {
        messageSubscription.unsubscribe();
        messageUpdateSubscription.unsubscribe();
      };
    } else {
      setMessages([]);
    }
  }, [conversationId, user?.id]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    startConversationAboutItem,
    refetch: fetchMessages
  };
}
