/**
 * NNECXY - Feed Screen (Sections 4, 12, 13, 27)
 * - Vertical snap scrolling
 * - Active video resource management
 * - True empty state when database has no videos (Section 4)
 * - Top navigation bar: Search, Messages, Notifications
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MessageCircle, 
  Bell, 
  PlusCircle, 
  RefreshCw, 
  Loader2,
  Film
} from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { LogoNNECXY } from './LogoNNECXY';
import { VideoRecord, UserProfile, SupportedLanguage } from '../types';
import { api } from '../services/api';
import { getTranslation } from '../i18n';

interface FeedViewProps {
  currentUser: UserProfile;
  onOpenReport: (video: VideoRecord) => void;
  onOpenComments: (video: VideoRecord) => void;
  onOpenCreator: (userId: string) => void;
  onOpenSearch: () => void;
  onOpenMessages: () => void;
  onOpenNotifications: () => void;
  onOpenCreate: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  lang: SupportedLanguage;
}

export const FeedView: React.FC<FeedViewProps> = ({
  currentUser,
  onOpenReport,
  onOpenComments,
  onOpenCreator,
  onOpenSearch,
  onOpenMessages,
  onOpenNotifications,
  onOpenCreate,
  onToast,
  lang,
}) => {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getFeed();
      setVideos(res.videos);
      setActiveIndex(0);
    } catch (err: any) {
      setError(err.message || 'Impossible de charger le fil vidéo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  // Scroll detection to update active video index
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const height = el.clientHeight;
    if (height <= 0) return;
    const index = Math.round(el.scrollTop / height);
    if (index !== activeIndex && index >= 0 && index < videos.length) {
      setActiveIndex(index);
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {/* TOP OVERLAY HEADER */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-3 pb-2 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
        {/* Compact NNECXY Logo */}
        <div className="flex items-center space-x-1.5">
          <LogoNNECXY size={28} showText={false} />
          <span className="font-black text-sm tracking-tight text-white drop-shadow">
            NNECXY
          </span>
        </div>

        {/* Action icons: Search, Messages, Notifications */}
        <div className="flex items-center space-x-2.5">
          <button
            id="btn-nav-search"
            onClick={onOpenSearch}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors"
            aria-label="Rechercher"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            id="btn-nav-messages"
            onClick={onOpenMessages}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors"
            aria-label="Messages"
          >
            <MessageCircle className="w-4 h-4 text-cyan-300" />
          </button>

          <button
            id="btn-nav-notifications"
            onClick={onOpenNotifications}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </header>

      {/* FEED CONTENT */}
      {loading ? (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-3 bg-black text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
          <span className="text-xs font-semibold">{getTranslation(lang, 'loading')}</span>
        </div>
      ) : error ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-black text-white">
          <p className="text-sm text-neutral-300">{error}</p>
          <button
            onClick={loadFeed}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réessayer</span>
          </button>
        </div>
      ) : videos.length === 0 ? (
        /* SECTION 4 MANDATORY EMPTY STATE:
           "Au premier lancement, si la base ne contient aucune vidéo:
            Afficher un véritable état vide du Feed.
            Ne pas afficher de vidéos de démonstration.
            Ne pas afficher de faux créateurs.
            Ne pas afficher de faux compteurs.
            Proposer directement l'action réelle : « Publier la première vidéo »" */
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-black text-white pb-28">
          <div className="w-20 h-20 rounded-3xl bg-neutral-900 border border-white/10 flex items-center justify-center text-blue-400 shadow-2xl">
            <Film className="w-10 h-10 stroke-[1.5]" />
          </div>

          <div className="space-y-1 max-w-xs">
            <h3 className="text-lg font-black text-white">
              {getTranslation(lang, 'empty_feed_title')}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {getTranslation(lang, 'empty_feed_desc')}
            </p>
          </div>

          <button
            id="btn-publish-first-video"
            onClick={onOpenCreate}
            className="h-12 px-6 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-2xl flex items-center space-x-2 shadow-lg transition-transform"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{getTranslation(lang, 'publish_first_video')}</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-xs text-neutral-500 hover:text-neutral-300 flex items-center space-x-1 pt-4"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser le flux</span>
          </button>
        </div>
      ) : (
        /* SNAP-SCROLL VIDEO FEED */
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="w-full h-full snap-start snap-always relative"
            >
              <VideoPlayer
                video={video}
                isActive={index === activeIndex}
                currentUser={currentUser}
                onOpenReport={onOpenReport}
                onOpenComments={onOpenComments}
                onOpenCreator={onOpenCreator}
                onToast={onToast}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
