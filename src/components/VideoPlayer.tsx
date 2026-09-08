/**
 * NNECXY - Video Player Component
 * Strictly adhering to Sections 12, 13, 18, 19, 20, 22, 27
 */

import React, { useRef, useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Download, 
  MoreVertical, 
  Play, 
  Plus, 
  Check, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { VideoRecord, UserProfile } from '../types';
import { api } from '../services/api';

interface VideoPlayerProps {
  video: VideoRecord;
  isActive: boolean;
  currentUser: UserProfile | null;
  onOpenReport: (video: VideoRecord) => void;
  onOpenComments: (video: VideoRecord) => void;
  onOpenCreator: (userId: string) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  isActive,
  currentUser,
  onOpenReport,
  onOpenComments,
  onOpenCreator,
  onToast,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasLiked, setHasLiked] = useState(Boolean(video.has_liked));
  const [likesCount, setLikesCount] = useState(video.likes_count || 0);
  const [isFollowing, setIsFollowing] = useState(Boolean(video.is_following_creator));
  const [hasLogged90, setHasLogged90] = useState(false);

  // Sync like & following state when video prop changes
  useEffect(() => {
    setHasLiked(Boolean(video.has_liked));
    setLikesCount(video.likes_count || 0);
    setIsFollowing(Boolean(video.is_following_creator));
  }, [video]);

  // Handle active playback (Section 12: Une seule vidéo principale active; arrêter quand elle sort)
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (isActive) {
      el.currentTime = 0;
      el.play()
        .then(() => {
          setIsPlaying(true);
          api.logEvent(video.id, 'video_view_started');
        })
        .catch(() => {
          // Autoplay blocked without mute on some mobile browsers
          el.muted = true;
          setIsMuted(true);
          el.play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        });
    } else {
      el.pause();
      setIsPlaying(false);
    }
  }, [isActive, video.id]);

  // Handle video progress for 90% view recommendation event (Section 13)
  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (!el || hasLogged90 || el.duration <= 0) return;
    const percent = (el.currentTime / el.duration) * 100;
    if (percent >= 90) {
      setHasLogged90(true);
      api.logEvent(video.id, 'video_view_90');
    }
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onToast('Veuillez vous connecter pour aimer.', 'info');
      return;
    }

    try {
      const res = await api.toggleLike(video.id);
      setHasLiked(res.has_liked);
      setLikesCount(res.likes_count);
      api.logEvent(video.id, 'video_liked');
    } catch (err: any) {
      onToast(err.message || 'Erreur lors du like.', 'error');
    }
  };

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onToast('Veuillez vous connecter pour vous abonner.', 'info');
      return;
    }
    try {
      const res = await api.toggleFollow(video.user_id);
      setIsFollowing(res.is_following);
      onToast(res.is_following ? 'Abonnement enregistré' : 'Désabonné(e)');
      api.logEvent(video.id, 'creator_followed');
    } catch (err: any) {
      onToast(err.message || 'Erreur abonnement', 'error');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/video/${video.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title || 'NNECXY Vidéo',
          text: video.description || 'Regardez cette vidéo sur NNECXY',
          url: shareUrl,
        });
        api.logEvent(video.id, 'video_shared');
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      onToast('Lien de la vidéo copié !', 'success');
      api.logEvent(video.id, 'video_shared');
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Section 22: Téléchargement uniquement si autorisé
    if (!video.is_download_allowed) {
      onToast('Le créateur a désactivé le téléchargement pour cette vidéo.', 'info');
      return;
    }

    onToast('Téléchargement de la vidéo en cours...', 'info');
    api.logEvent(video.id, 'video_downloaded');

    try {
      const a = document.createElement('a');
      a.href = video.video_url;
      a.download = `nnecxy_${video.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      onToast('Erreur lors du téléchargement.', 'error');
    }
  };

  const isOwner = Boolean(currentUser && currentUser.id === video.user_id);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none">
      {/* 100% Background Video Player */}
      <video
        ref={videoRef}
        src={video.video_url}
        className="w-full h-full object-cover cursor-pointer"
        playsInline
        loop
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onClick={handleTogglePlay}
      />

      {/* Paused Overlay Indicator */}
      {!isPlaying && (
        <div 
          onClick={handleTogglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-auto cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-2xl">
            <Play className="w-8 h-8 fill-white translate-x-1" />
          </div>
        </div>
      )}

      {/* TOP BAR: Section 27 Master Requirement:
          "Sur l'écran FEED /(tabs)/feed, chaque vidéo plein écran a en haut à droite une icône 3 points '...' blanche.
           Au clic, ouvrir un Bottom Sheet avec titre 'Signaler cette vidéo'" */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted(!isMuted);
          }}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10"
          aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* 3 DOTS REPORT BUTTON (Section 27) */}
        <button
          id={`btn-report-video-${video.id}`}
          onClick={(e) => {
            e.stopPropagation();
            if (videoRef.current) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
            onOpenReport(video);
          }}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-black/60 active:scale-95 transition-transform"
          aria-label="Options et signalement"
        >
          <MoreVertical className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* RIGHT SIDEBAR ACTIONS */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center space-y-4 z-30 pointer-events-auto">
        {/* Creator Avatar with Follow Button */}
        <div className="relative flex flex-col items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenCreator(video.user_id);
            }}
            className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-neutral-800 shadow-xl active:scale-95 transition-transform"
          >
            <img
              src={video.creator?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${video.user_id}`}
              alt={video.creator?.username || 'Creator'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
          {!isOwner && !isFollowing && (
            <button
              onClick={handleToggleFollow}
              className="absolute -bottom-1.5 w-5 h-5 rounded-full bg-[#0084FF] text-white flex items-center justify-center shadow-lg border border-black active:scale-90 transition-transform"
              aria-label="Suivre ce créateur"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          )}
        </div>

        {/* Like Button */}
        <button
          id={`btn-like-${video.id}`}
          onClick={handleToggleLike}
          className="flex flex-col items-center group active:scale-90 transition-transform"
          aria-label="Aimer"
        >
          <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg">
            <Heart 
              className={`w-6 h-6 transition-colors ${
                hasLiked ? 'text-[#FF3B30] fill-[#FF3B30]' : 'text-white'
              }`} 
            />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow mt-1">
            {likesCount}
          </span>
        </button>

        {/* Comments Button */}
        <button
          id={`btn-comments-${video.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenComments(video);
          }}
          className="flex flex-col items-center group active:scale-90 transition-transform"
          aria-label="Commentaires"
        >
          <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow mt-1">
            {video.comments_count || 0}
          </span>
        </button>

        {/* Share Button */}
        <button
          id={`btn-share-${video.id}`}
          onClick={handleShare}
          className="flex flex-col items-center group active:scale-90 transition-transform"
          aria-label="Partager"
        >
          <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow mt-1">
            {video.shares_count || 0}
          </span>
        </button>

        {/* Download Button (Section 22) */}
        <button
          id={`btn-download-${video.id}`}
          onClick={handleDownload}
          className={`flex flex-col items-center group active:scale-90 transition-transform ${
            !video.is_download_allowed ? 'opacity-40' : ''
          }`}
          aria-label="Télécharger"
        >
          <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg">
            <Download className="w-5 h-5 text-white" />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow mt-1">
            {video.downloads_count || 0}
          </span>
        </button>
      </div>

      {/* BOTTOM-LEFT VIDEO DETAILS */}
      <div className="absolute left-4 bottom-20 right-20 z-30 pointer-events-auto text-white">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenCreator(video.user_id);
          }}
          className="text-sm font-black hover:underline tracking-tight flex items-center space-x-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        >
          <span>@{video.creator?.username || 'créateur'}</span>
          {isFollowing && (
            <span className="text-[10px] bg-blue-500/80 px-1.5 py-0.5 rounded font-medium">
              Abonné(e)
            </span>
          )}
        </button>

        {video.title && (
          <h3 className="text-sm font-semibold mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-1">
            {video.title}
          </h3>
        )}

        {video.description && (
          <p className="text-xs text-neutral-200 mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-2">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
};
