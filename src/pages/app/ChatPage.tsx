import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Menu, MoreVertical, Send, Paperclip, Smile, ArrowLeft, Phone, Video, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import MessageItemReference from "@/components/circulapp/MessageItemReference";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactList, setShowContactList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Use real hooks for conversations and messages
  const { conversations, loading: conversationsLoading, error: conversationsError, refetch: refetchConversations } = useConversations();
  const { messages, loading: messagesLoading, error: messagesError, sendMessage } = useMessages(selectedChat);

  // Check for conversation parameter in URL and refresh conversations
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId) {
      setSelectedChat(conversationId);
      if (isMobile) {
        setShowContactList(false);
      }
      // Refresh conversations when coming from marketplace
      refetchConversations();
    }
  }, [searchParams, isMobile, refetchConversations]);

  // Debug: Log conversations to see what we're getting
  useEffect(() => {
    console.log('Conversations loaded:', conversations);
    console.log('Conversations error:', conversationsError);
  }, [conversations, conversationsError]);

  // Filtrar contactos según la búsqueda
  const filteredConversations = conversations.filter(conversation => {
    if (!conversation.other_user) return false;
    const fullName = conversation.other_user.full_name || '';
    const username = conversation.other_user.username || '';
    return fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Efecto para desplazarse al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Manejar envío de mensajes
  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;
    
    await sendMessage(newMessage);
    setNewMessage("");
  };

  // Manejar selección de chat
  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId);
    if (isMobile) {
      setShowContactList(false);
    }
  };

  // Volver a la lista de contactos (móvil)
  const handleBackToList = () => {
    setShowContactList(true);
  };

  // Obtener el contacto seleccionado
  const selectedConversation = conversations.find(conv => conv.id === selectedChat);

  // Format time helper
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-background">
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Lista de contactos */}
        {(showContactList || !isMobile) && (
          <div className={`flex flex-col min-h-0 border-r ${isMobile ? 'w-full' : 'w-1/3'} overflow-hidden`}>
            {/* Cabecera de contactos */}
            <div className="p-3 bg-card flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-semibold">Chats</h2>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Buscador */}
            <div className="p-3 border-b flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar o iniciar un nuevo chat" 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Lista de chats */}
            <div className="flex-1 overflow-y-auto">
              {conversationsLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Cargando conversaciones...
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <div 
                    key={conversation.id}
                    className={`flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors ${selectedChat === conversation.id ? 'bg-accent' : ''}`}
                    onClick={() => handleSelectChat(conversation.id)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.other_user.avatar_url} />
                        <AvatarFallback>{conversation.other_user.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium truncate">{conversation.other_user.full_name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {conversation.last_message ? formatTime(conversation.last_message.created_at) : ''}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message ? conversation.last_message.content : 'Sin mensajes'}
                      </p>
                    </div>
                    {conversation.unread_count > 0 && (
                      <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No tienes conversaciones aún
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Área de chat */}
        {(!showContactList || !isMobile) && (
          <div className={`flex flex-col min-h-0 ${isMobile ? 'w-full' : 'w-2/3'} overflow-hidden`}>
            {selectedChat ? (
              <>
                {/* Cabecera del chat */}
                <div className="p-3 bg-card flex items-center justify-between border-b flex-shrink-0">
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <Button variant="ghost" size="icon" onClick={handleBackToList}>
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    )}
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation?.other_user.avatar_url} />
                      <AvatarFallback>{selectedConversation?.other_user.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{selectedConversation?.other_user.full_name}</h3>
                      <p className="text-xs text-muted-foreground">
                        En línea
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-4 bg-accent/20 space-y-3 min-h-0">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">Cargando mensajes...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No hay mensajes aún. ¡Envía el primero!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.sender_id === user?.id 
                              ? 'bg-primary text-primary-foreground rounded-br-none' 
                              : 'bg-card rounded-bl-none'
                          }`}
                        >
                          <p>{message.content}</p>
                          {message.item && (
                            <MessageItemReference item={message.item} />
                          )}
                          <p className={`text-xs mt-1 text-right ${
                            message.sender_id === user?.id 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Entrada de mensaje */}
                <div className="p-3 bg-card flex items-center gap-2 flex-shrink-0">
                  <Button variant="ghost" size="icon">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input 
                    placeholder="Escribe un mensaje" 
                    className="flex-1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={newMessage.trim() === ""}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircleIcon className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Tus conversaciones</h2>
                <p className="text-muted-foreground max-w-md">
                  Selecciona un chat para ver los mensajes o inicia una nueva conversación
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de icono de mensaje
function MessageCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}