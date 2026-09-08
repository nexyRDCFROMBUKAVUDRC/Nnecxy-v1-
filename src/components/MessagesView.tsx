/**
 * NNECXY - Messagerie Privée Réelle (Section 24)
 * Conversations, messages, membres, historique réel.
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, MessageCircle, Loader2 } from 'lucide-react';
import { ConversationRecord, MessageRecord, UserProfile, SupportedLanguage } from '../types';
import { api } from '../services/api';
import { getTranslation } from '../i18n';

interface MessagesViewProps {
  currentUser: UserProfile;
  activeConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
  onBack: () => void;
  lang: SupportedLanguage;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUser,
  activeConversationId,
  onSelectConversation,
  onBack,
  lang,
}) => {
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getConversations();
      setConversations(res.conversations);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des conversations.');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    setLoading(true);
    try {
      const res = await api.getMessages(convId);
      setMessages(res.messages);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await api.sendMessage(activeConversationId, newMessage.trim());
      setMessages((prev) => [...prev, res.message]);
      setNewMessage('');
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi du message.");
    } finally {
      setSending(false);
    }
  };

  // If viewing a single conversation thread
  if (activeConversationId) {
    const currentConv = conversations.find((c) => c.id === activeConversationId);
    const otherMember = currentConv?.members.find((m) => m.id !== currentUser.id);

    return (
      <div className="fixed inset-0 z-40 bg-[#000000] text-white flex flex-col max-w-md mx-auto pb-24">
        {/* Thread Header */}
        <div className="p-4 border-b border-white/10 flex items-center space-x-3 bg-neutral-900/80">
          <button
            onClick={() => onSelectConversation(null)}
            className="p-1 rounded-full text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img
            src={otherMember?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${otherMember?.id || 'conv'}`}
            alt="avatar"
            className="w-9 h-9 rounded-full object-cover border border-white/10"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold truncate">
              {currentConv?.title || `${otherMember?.first_name || 'Utilisateur'} ${otherMember?.last_name || ''}`}
            </h3>
            {otherMember && <p className="text-xs text-neutral-400">@{otherMember.username}</p>}
          </div>
        </div>

        {/* Message bubbles */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="py-16 text-center text-neutral-500 text-xs">
              Aucun message échangé pour le moment. Dites bonjour !
            </div>
          )}

          {messages.map((m) => {
            const isMe = m.sender_id === currentUser.id;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-neutral-800 text-neutral-200 rounded-bl-xs'
                  }`}
                >
                  <p className="break-words">{m.content}</p>
                </div>
                <span className="text-[10px] text-neutral-500 mt-1 px-1">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-[#141414] flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={getTranslation(lang, 'write_message_placeholder')}
            className="flex-1 bg-[#222] border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-40 text-white flex items-center justify-center transition-transform shrink-0"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    );
  }

  // Conversation list view
  return (
    <div className="fixed inset-0 z-40 bg-[#000000] text-white flex flex-col max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center space-x-3 bg-neutral-900/80">
        <button
          onClick={onBack}
          className="p-1 rounded-full text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold flex-1">{getTranslation(lang, 'messages_title')}</h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading && (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-200">
            {error}
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="py-20 text-center text-neutral-500 space-y-2 px-6">
            <MessageCircle className="w-12 h-12 mx-auto text-neutral-600" />
            <p className="text-sm font-semibold">Aucune conversation active</p>
            <p className="text-xs">
              Visitez le profil d'un créateur pour lui envoyer un message en direct.
            </p>
          </div>
        )}

        {conversations.map((conv) => {
          const other = conv.members.find((m) => m.id !== currentUser.id);
          return (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className="flex items-center space-x-3 p-3 rounded-2xl bg-[#161616] hover:bg-[#222] cursor-pointer transition-colors border border-white/5"
            >
              <img
                src={other?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${other?.id || 'conv'}`}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover border border-white/10"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold truncate text-white">
                    {conv.title || `${other?.first_name || 'Utilisateur'} ${other?.last_name || ''}`}
                  </h4>
                  {conv.last_message && (
                    <span className="text-[10px] text-neutral-500">
                      {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 truncate mt-0.5">
                  {conv.last_message?.content || 'Nouvelle conversation'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
