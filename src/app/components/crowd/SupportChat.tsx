import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Send, MessageCircle, User, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { useLanguage } from '../../context/LanguageContext';

interface Message {
  id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  admin_id: string | null;
  read: boolean;
  created_at: string;
}

interface SupportChatProps {
  userId: string;
}

export function SupportChat({ userId }: SupportChatProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();

    // Subscribe to real-time messages
    const channel = supabase
      .channel('user_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages(data || []);

      // Mark messages as read
      if (data && data.length > 0) {
        const unreadAdminMessages = data.filter(m => m.is_admin && !m.read);
        if (unreadAdminMessages.length > 0) {
          await supabase
            .from('messages')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('is_admin', true)
            .eq('read', false);
        }
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          user_id: userId,
          message: newMessage.trim(),
          is_admin: false,
          admin_id: null,
          read: false
        });

      if (error) {
        toast.error('ไม่สามารถส่งข้อความได้');
        return;
      }

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'วันนี้';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'เมื่อวาน';
    } else {
      return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900" style={{ backgroundColor: '#FAF9F5' }}>
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shrink-0" style={{ borderColor: '#D3D1C7' }}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl dark:bg-gray-700" style={{ backgroundColor: '#F1EFE8' }}>
                <MessageCircle className="w-5 h-5 dark:text-gray-300" style={{ color: '#6B4F3A' }} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black dark:text-white">{t('chat.title')}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('chat.subtitle')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col max-w-4xl w-full mx-auto">
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500 dark:text-gray-400">{t('loading')}</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">{t('chat.empty')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-500">{t('chat.empty.desc')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const showDate = index === 0 || formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="text-center my-4">
                        <span className="px-3 py-1 rounded-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-end gap-2 ${message.is_admin ? 'justify-start' : 'justify-end'}`}
                    >
                      {message.is_admin && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 dark:bg-gray-700" style={{ backgroundColor: '#6B4F3A' }}>
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <div className={`max-w-[70%] ${message.is_admin ? '' : 'order-1'}`}>
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            message.is_admin
                              ? 'bg-white dark:bg-gray-800 border dark:border-gray-700'
                              : 'text-white dark:text-gray-100'
                          }`}
                          style={{
                            backgroundColor: message.is_admin ? undefined : '#6B4F3A',
                            borderColor: message.is_admin ? '#D3D1C7' : undefined
                          }}
                        >
                          <p className={`text-sm whitespace-pre-wrap break-words ${message.is_admin ? 'text-black dark:text-white' : ''}`}>
                            {message.message}
                          </p>
                        </div>
                        <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 px-2 ${message.is_admin ? 'text-left' : 'text-right'}`}>
                          {formatTime(message.created_at)}
                        </div>
                      </div>

                      {!message.is_admin && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 dark:bg-gray-700" style={{ backgroundColor: '#F1EFE8' }}>
                          <User className="w-4 h-4 dark:text-gray-300" style={{ color: '#6B4F3A' }} />
                        </div>
                      )}
                    </motion.div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0" style={{ borderColor: '#D3D1C7' }}>
          <div className="px-6 py-4">
            <div className="flex items-end gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('chat.placeholder')}
                className="flex-1 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                disabled={sending}
              />
              <Button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="shrink-0"
                style={{
                  backgroundColor: '#6B4F3A',
                  color: '#FAF0E6',
                  opacity: !newMessage.trim() || sending ? 0.5 : 1
                }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
