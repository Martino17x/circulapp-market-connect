import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
  other_user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  unread_count: number;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get conversations where user is participant - using correct column names
      const { data: conversationsData1, error: error1 } = await (supabase as any)
        .from('conversations')
        .select('id, created_at, participant_1, participant_2')
        .eq('participant_1', user.id)
        .order('created_at', { ascending: false });

      const { data: conversationsData2, error: error2 } = await (supabase as any)
        .from('conversations')
        .select('id, created_at, participant_1, participant_2')
        .eq('participant_2', user.id)
        .order('created_at', { ascending: false });

      if (error1 || error2) throw error1 || error2;

      // Combine and deduplicate conversations
      const allConversations = [...(conversationsData1 || []), ...(conversationsData2 || [])];
      const uniqueConversations = allConversations.filter((conv, index, self) => 
        index === self.findIndex(c => c.id === conv.id)
      );
      const conversationsData = uniqueConversations.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // For each conversation, get the other user's profile and last message
      const conversationsWithDetails = await Promise.all(
        (conversationsData || []).map(async (conv: any) => {
          const otherUserId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
          
          // Get other user's profile - using user_id instead of id
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('user_id', otherUserId)
            .single();

          console.log('Profile query for user:', otherUserId, 'Result:', profileData, 'Error:', profileError);

          // Get last message
          const { data: lastMessageData } = await (supabase as any)
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await (supabase as any)
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          return {
            ...conv,
            other_user: profileData || {
              id: otherUserId,
              username: 'Usuario',
              full_name: 'Usuario',
              avatar_url: null
            },
            last_message: lastMessageData,
            unread_count: unreadCount || 0
          } as any;
        })
      );

      setConversations(conversationsWithDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar conversaciones');
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (otherUserId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        user1_id: user.id,
        user2_id: otherUserId
      });

      if (error) throw error;

      // Refresh conversations
      await fetchConversations();
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear conversación');
      return null;
    }
  };

  useEffect(() => {
    fetchConversations();

    // Subscribe to conversation changes
    const conversationSubscription = supabase
      .channel('conversations')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversations',
          filter: `participant_1=eq.${user?.id},participant_2=eq.${user?.id}`
        }, 
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    // Subscribe to message changes to update last message
    const messageSubscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages'
        }, 
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      conversationSubscription.unsubscribe();
      messageSubscription.unsubscribe();
    };
  }, [user?.id]);

  return {
    conversations,
    loading,
    error,
    createConversation,
    refetch: fetchConversations
  };
}
