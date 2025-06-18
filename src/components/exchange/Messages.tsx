
import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  recipe_id: string | null;
  is_read: boolean;
  created_at: string;
  sender_profile: { username: string; first_name: string; last_name: string } | null;
  recipient_profile: { username: string; first_name: string; last_name: string } | null;
  recipe: { title: string } | null;
}

interface MessagesProps {
  session: Session | null;
}

const Messages: React.FC<MessagesProps> = ({ session }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient_email: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user?.id) {
      fetchMessages();
    }
  }, [session]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('private_messages')
        .select(`
          *,
          sender_profile:profiles!private_messages_sender_id_fkey(username, first_name, last_name),
          recipient_profile:profiles!private_messages_recipient_id_fkey(username, first_name, last_name),
          recipe:recipes(title)
        `)
        .or(`sender_id.eq.${session?.user?.id},recipient_id.eq.${session?.user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('private_messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .eq('recipient_id', session?.user?.id);
      
      fetchMessages();
    } catch (error: any) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!session?.user?.id || !newMessage.recipient_email.trim() || !newMessage.message.trim()) {
      return;
    }

    setSending(true);
    try {
      // First, find the recipient by email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', newMessage.recipient_email.trim())
        .limit(1);

      if (profileError) throw profileError;
      
      if (!profiles || profiles.length === 0) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('private_messages')
        .insert({
          sender_id: session.user.id,
          recipient_id: profiles[0].id,
          message: newMessage.message.trim(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message sent successfully!",
      });

      setNewMessage({ recipient_email: '', message: '' });
      setIsNewMessageOpen(false);
      fetchMessages();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const getDisplayName = (profile: any) => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile?.username || 'Unknown User';
  };

  if (loading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-emerald-800">Private Messages</h2>
        <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send New Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Recipient Email/Username</label>
                <Input
                  value={newMessage.recipient_email}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, recipient_email: e.target.value }))}
                  placeholder="Enter user's email or username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  value={newMessage.message}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Type your message..."
                  rows={4}
                />
              </div>
              <Button 
                onClick={sendMessage} 
                disabled={sending || !newMessage.recipient_email.trim() || !newMessage.message.trim()}
                className="w-full flex items-center gap-2"
              >
                <Send size={16} />
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {messages.map((message) => {
          const isReceived = message.recipient_id === session?.user?.id;
          const otherUser = isReceived ? message.sender_profile : message.recipient_profile;
          
          return (
            <Card 
              key={message.id} 
              className={`cursor-pointer transition-all ${isReceived && !message.is_read ? 'border-emerald-300 bg-emerald-50' : ''}`}
              onClick={() => {
                if (isReceived && !message.is_read) {
                  markAsRead(message.id);
                }
              }}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle size={20} />
                    {isReceived ? 'From' : 'To'}: {getDisplayName(otherUser)}
                  </CardTitle>
                  <div className="flex gap-2">
                    {isReceived && !message.is_read && (
                      <Badge variant="default">New</Badge>
                    )}
                    <Badge variant="outline">
                      {isReceived ? 'Received' : 'Sent'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-800">{message.message}</p>
                
                {message.recipe && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Related Recipe:</p>
                    <p className="font-medium">{message.recipe.title}</p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  {new Date(message.created_at).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {messages.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600 mb-4">No messages yet</h3>
          <p className="text-gray-500 mb-6">Start a conversation with other cooking enthusiasts</p>
          <Button onClick={() => setIsNewMessageOpen(true)} className="flex items-center gap-2 mx-auto">
            <Plus size={20} />
            Send Your First Message
          </Button>
        </div>
      )}
    </div>
  );
};

export default Messages;
