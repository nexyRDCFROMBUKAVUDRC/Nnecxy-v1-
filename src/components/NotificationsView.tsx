/**
 * NNECXY - Notifications Réelles (Section 26)
 * Événements réels uniquement (abonnements, likes, commentaires, messages).
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Heart, MessageCircle, UserPlus, Check, Loader2 } from 'lucide-react';
import { NotificationRecord, SupportedLanguage } from '../types';
import { api } from '../services/api';
import { getTranslation } from '../i18n';

interface NotificationsViewProps {
  onBack: () => void;
  lang: SupportedLanguage;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onBack, lang }) => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifs();
  }, []);

  const loadNotifs = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch { }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-400 fill-red-400" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-400" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-cyan-400" />;
      default:
        return <Bell className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#000000] text-white flex flex-col max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center space-x-3 bg-neutral-900/80">
        <button onClick={onBack} className="p-1 rounded-full text-neutral-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold flex-1">{getTranslation(lang, 'notifications_title')}</h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading && (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="py-20 text-center text-neutral-500 space-y-2 px-6">
            <Bell className="w-12 h-12 mx-auto text-neutral-600" />
            <p className="text-sm font-semibold">{getTranslation(lang, 'no_notifications')}</p>
            <p className="text-xs">
              Les notifications s'afficheront dès qu'un vrai utilisateur réagira à vos vidéos ou s'abonnera.
            </p>
          </div>
        )}

        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleMarkRead(n.id)}
            className={`flex items-start space-x-3 p-3 rounded-2xl border transition-colors cursor-pointer ${
              n.is_read
                ? 'bg-[#141414] border-white/5 opacity-80'
                : 'bg-[#1e1e1e] border-blue-500/30'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
              {getIcon(n.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                <span className="text-[10px] text-neutral-500">
                  {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">{n.message}</p>
            </div>
            {!n.is_read && (
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
