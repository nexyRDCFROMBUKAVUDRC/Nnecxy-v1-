/**
 * NNECXY - Profile View (Sections 11, 16, 21, 36)
 * - Mon Profil vs Profil Créateur
 * - Vrais compteurs (aucun faux chiffre)
 * - Sous "Mes vidéos" : Options Gérer, Supprimer, et BOOSTER (Section 16)
 * - Modal Modifier le profil
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Settings as SettingsIcon, 
  Edit3, 
  Rocket, 
  Trash2, 
  MessageSquare, 
  UserPlus, 
  Check, 
  Loader2, 
  Film,
  Play
} from 'lucide-react';
import { UserProfile, VideoRecord, SupportedLanguage } from '../types';
import { api } from '../services/api';
import { getTranslation } from '../i18n';

interface ProfileViewProps {
  currentUser: UserProfile;
  targetUserId?: string | null;
  onBack?: () => void;
  onOpenSettings: () => void;
  onOpenBooster: (video: VideoRecord) => void;
  onOpenMessagesWithUser?: (userId: string) => void;
  onSelectVideo: (video: VideoRecord) => void;
  onUpdateProfileSuccess: (user: UserProfile) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  lang: SupportedLanguage;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  targetUserId,
  onBack,
  onOpenSettings,
  onOpenBooster,
  onOpenMessagesWithUser,
  onSelectVideo,
  onUpdateProfileSuccess,
  onToast,
  lang,
}) => {
  const isMyProfile = !targetUserId || targetUserId === currentUser.id;

  const [profile, setProfile] = useState<UserProfile>(currentUser);
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState(currentUser.first_name);
  const [editLastName, setEditLastName] = useState(currentUser.last_name);
  const [editBio, setEditBio] = useState(currentUser.bio || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(currentUser.avatar_url || '');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [targetUserId, currentUser.id]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      if (isMyProfile) {
        setProfile(currentUser);
        const res = await api.getMyVideos();
        setVideos(res.videos);
      } else if (targetUserId) {
        const res = await api.getUserProfile(targetUserId);
        setProfile(res.profile);
        setVideos(res.profile.videos || []);
        setIsFollowing(res.profile.is_following || false);
      }
    } catch (err: any) {
      onToast(err.message || 'Erreur lors du chargement du profil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (isMyProfile) return;
    try {
      const res = await api.toggleFollow(profile.id);
      setIsFollowing(res.is_following);
      setProfile((prev) => ({
        ...prev,
        followers_count: res.followers_count,
      }));
      onToast(res.is_following ? 'Abonnement enregistré' : 'Désabonné(e)');
    } catch (err: any) {
      onToast(err.message || 'Erreur abonnement', 'error');
    }
  };

  const handleDeleteVideo = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Voulez-vous vraiment supprimer définitivement cette vidéo ?')) return;

    try {
      await api.deleteVideo(videoId);
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      onToast('Vidéo supprimée.');
    } catch (err: any) {
      onToast(err.message || 'Erreur de suppression.', 'error');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.updateProfile({
        first_name: editFirstName.trim(),
        last_name: editLastName.trim(),
        bio: editBio.trim(),
        avatar_url: editAvatarUrl.trim() || undefined,
      });
      setProfile(res.user);
      onUpdateProfileSuccess(res.user);
      setIsEditing(false);
      onToast('Profil mis à jour avec succès.');
    } catch (err: any) {
      onToast(err.message || 'Erreur de mise à jour.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#000000] text-white flex flex-col max-w-md mx-auto pb-24">
      {/* Profile Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-neutral-900/80">
        {!isMyProfile ? (
          <button onClick={onBack} className="p-1 rounded-full text-neutral-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-6" />
        )}

        <h2 className="text-base font-bold truncate max-w-[200px]">
          @{profile.username}
        </h2>

        {isMyProfile ? (
          <button
            id="btn-profile-settings"
            onClick={onOpenSettings}
            className="p-1 rounded-full text-neutral-400 hover:text-white"
            aria-label="Paramètres"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-6" />
        )}
      </div>

      {/* Main Profile Info */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* Avatar & Names */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-20 h-20 rounded-full border-2 border-cyan-500/50 p-0.5 shadow-xl bg-neutral-800">
                <img
                  src={profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.id}`}
                  alt={profile.username}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white">
                  {profile.first_name} {profile.last_name}
                </h3>
                <p className="text-xs text-cyan-400 font-medium">@{profile.username}</p>
              </div>

              {profile.bio && (
                <p className="text-xs text-neutral-300 max-w-xs leading-relaxed px-4">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* REAL STATS COUNTERS (Section 11: Compteurs réels abonnés, abonnements, vidéos. Aucun faux chiffre.) */}
            <div className="flex items-center justify-center space-x-6 py-3 border-y border-white/10">
              <div className="text-center">
                <span className="block text-base font-extrabold text-white">
                  {videos.length}
                </span>
                <span className="text-[11px] text-neutral-400">
                  {getTranslation(lang, 'profile_videos')}
                </span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center">
                <span className="block text-base font-extrabold text-white">
                  {profile.followers_count || 0}
                </span>
                <span className="text-[11px] text-neutral-400">
                  {getTranslation(lang, 'profile_followers')}
                </span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center">
                <span className="block text-base font-extrabold text-white">
                  {profile.following_count || 0}
                </span>
                <span className="text-[11px] text-neutral-400">
                  {getTranslation(lang, 'profile_following')}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2">
              {isMyProfile ? (
                <button
                  id="btn-edit-profile"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 h-10 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border border-white/10"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{getTranslation(lang, 'profile_edit')}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleToggleFollow}
                    className={`flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors ${
                      isFollowing
                        ? 'bg-neutral-800 text-neutral-300 border border-white/15'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                        <span>Abonné(e)</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>S’abonner</span>
                      </>
                    )}
                  </button>

                  {onOpenMessagesWithUser && (
                    <button
                      onClick={() => onOpenMessagesWithUser(profile.id)}
                      className="flex-1 h-10 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border border-white/10"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Message</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* MES VIDÉOS / SES VIDÉOS GRID */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
                <Film className="w-4 h-4 text-blue-400" />
                <span>
                  {isMyProfile ? getTranslation(lang, 'profile_my_videos') : 'Vidéos publiées'} ({videos.length})
                </span>
              </h4>

              {videos.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 space-y-1">
                  <Film className="w-8 h-8 mx-auto text-neutral-600" />
                  <p className="text-xs font-medium">Aucune vidéo publiée pour le moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {videos.map((v) => (
                    <div
                      key={v.id}
                      className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden flex flex-col group"
                    >
                      {/* Video Thumbnail */}
                      <div
                        onClick={() => onSelectVideo(v)}
                        className="relative aspect-[9/14] bg-neutral-900 cursor-pointer overflow-hidden"
                      >
                        <video src={v.video_url} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <Play className="w-6 h-6 text-white/80" />
                        </div>
                        <span className="absolute bottom-2 left-2 text-[10px] text-white bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                          {v.likes_count || 0} ♥
                        </span>
                      </div>

                      {/* Video Info */}
                      <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                        <p className="text-xs font-semibold text-white line-clamp-1">
                          {v.title || 'Vidéo sans titre'}
                        </p>

                        {/* SECTION 16 & 36 MANDATORY RULE:
                            "Le bouton Booster doit apparaître uniquement sous les vidéos de l'utilisateur dans 'Mes vidéos'.
                             Ne pas afficher le Booster partout dans le Feed." */}
                        {isMyProfile && (
                          <div className="flex items-center space-x-1.5 pt-1 border-t border-white/10">
                            {/* BOOSTER BUTTON */}
                            <button
                              id={`btn-booster-${v.id}`}
                              onClick={() => onOpenBooster(v)}
                              className="flex-1 h-7 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 transition-colors"
                              title="Booster cette vidéo"
                            >
                              <Rocket className="w-3 h-3 text-cyan-400" />
                              <span>Booster</span>
                            </button>

                            {/* DELETE BUTTON */}
                            <button
                              id={`btn-delete-vid-${v.id}`}
                              onClick={(e) => handleDeleteVideo(v.id, e)}
                              className="w-7 h-7 bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400 border border-white/10 hover:border-red-800 rounded-lg flex items-center justify-center transition-colors shrink-0"
                              title="Supprimer la vidéo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-3xl p-5 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-base text-white">Modifier le profil</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400">Prénom</label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  required
                  className="w-full bg-[#202020] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400">Nom</label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  required
                  className="w-full bg-[#202020] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-[#202020] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 h-10 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 h-10 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
