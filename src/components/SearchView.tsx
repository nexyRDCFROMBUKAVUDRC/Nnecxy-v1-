/**
 * NNECXY - Recherche Réelle (Section 23)
 * Utilisateurs / Créateurs / Vidéos
 * Aucun résultat fictif.
 */

import React, { useState } from 'react';
import { Search as SearchIcon, ArrowLeft, Loader2, Play, Users } from 'lucide-react';
import { UserProfile, VideoRecord, SupportedLanguage } from '../types';
import { api } from '../services/api';
import { getTranslation } from '../i18n';

interface SearchViewProps {
  onBack: () => void;
  onSelectUser: (userId: string) => void;
  onSelectVideo: (video: VideoRecord) => void;
  lang: SupportedLanguage;
}

export const SearchView: React.FC<SearchViewProps> = ({
  onBack,
  onSelectUser,
  onSelectVideo,
  lang,
}) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await api.search(query.trim());
      setUsers(res.users);
      setVideos(res.videos);
    } catch {
      setUsers([]);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#000000] text-white flex flex-col max-w-md mx-auto pb-24">
      {/* Search Header */}
      <div className="p-4 border-b border-white/10 flex items-center space-x-3 bg-neutral-900/80">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full text-neutral-400 hover:text-white"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearch} className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getTranslation(lang, 'search_placeholder')}
            autoFocus
            className="w-full bg-[#1c1c1c] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
          <SearchIcon className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs">{getTranslation(lang, 'loading')}</span>
          </div>
        )}

        {!loading && hasSearched && users.length === 0 && videos.length === 0 && (
          <div className="py-16 text-center text-neutral-500 px-6 space-y-2">
            <SearchIcon className="w-10 h-10 mx-auto text-neutral-600" />
            <p className="text-sm font-medium">{getTranslation(lang, 'search_empty')}</p>
          </div>
        )}

        {/* Users results */}
        {!loading && users.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Créateurs & Utilisateurs ({users.length})</span>
            </h3>
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => onSelectUser(u.id)}
                  className="flex items-center space-x-3 p-2.5 rounded-2xl bg-[#161616] hover:bg-[#202020] cursor-pointer transition-colors border border-white/5"
                >
                  <img
                    src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`}
                    alt={u.username}
                    className="w-11 h-11 rounded-full object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {u.first_name} {u.last_name}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">@{u.username}</p>
                  </div>
                  <span className="text-xs text-blue-400 font-semibold px-2 py-1 bg-blue-500/10 rounded-lg">
                    Voir
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos results */}
        {!loading && videos.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Vidéos ({videos.length})</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {videos.map((v) => (
                <div
                  key={v.id}
                  onClick={() => onSelectVideo(v)}
                  className="relative aspect-[9/16] bg-neutral-900 rounded-2xl overflow-hidden border border-white/10 group cursor-pointer"
                >
                  <video
                    src={v.video_url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 p-2.5 flex flex-col justify-between">
                    <span className="text-[10px] text-neutral-300 font-medium self-start bg-black/40 px-1.5 py-0.5 rounded">
                      @{v.creator?.username || 'user'}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white line-clamp-1">{v.title || 'Vidéo'}</p>
                      <p className="text-[10px] text-neutral-400">{v.likes_count || 0} j’aime</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
