/**
 * NNECXY - Création & Publication de Vidéo
 * Strictly adhering to Section 14 & 15 (Parcours obligatoire de création vidéo)
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Video as VideoIcon, CheckCircle2, AlertCircle, Loader2, Play, Pause } from 'lucide-react';
import { api } from '../services/api';
import { VideoRecord } from '../types';

interface CreateVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoCreated: (video: VideoRecord) => void;
  onToast: (msg: string) => void;
}

export const CreateVideoModal: React.FC<CreateVideoModalProps> = ({
  isOpen,
  onClose,
  onVideoCreated,
  onToast,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict validation Section 14:
    // "V1: seules les vidéos sont acceptées. Si l'utilisateur choisit une photo: Afficher 'Veuillez sélectionner une vidéo.' Ne pas publier."
    if (!file.type.startsWith('video/')) {
      setErrorMessage('Veuillez sélectionner une vidéo.');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Size limit check (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage('La vidéo dépasse la taille maximale autorisée (100 Mo).');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Veuillez sélectionner une vidéo avant de publier.');
      return;
    }

    setStatus('uploading');
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('allow_downloads', String(allowDownloads));

    try {
      const res = await api.uploadVideo(formData);
      onToast('Vidéo publiée avec succès !');
      onVideoCreated(res.video);
      handleReset();
      onClose();
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Erreur lors de la publication de la vidéo.');
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setTitle('');
    setDescription('');
    setStatus('idle');
    setErrorMessage(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <VideoIcon className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-bold text-white">Nouvelle Vidéo</h2>
            </div>
            <button
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form / Content */}
          <form onSubmit={handlePublish} className="p-5 overflow-y-auto space-y-4 flex-1">
            {errorMessage && (
              <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl text-red-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span className="flex-1">{errorMessage}</span>
              </div>
            )}

            {/* Hidden Input for Video ONLY */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* 1. SELECTION & PREVIEW (Mandatory Section 14) */}
            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-56 border-2 border-dashed border-neutral-700 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-900/50 p-6 text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform mb-3">
                  <Upload className="w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-white">
                  Choisir une vidéo depuis la galerie
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Format MP4, WebM ou MOV (Max 100 Mo)
                </p>
                <span className="text-[11px] text-amber-400/90 mt-2 font-medium">
                  * Seules les vidéos sont acceptées (Pas de photo)
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-semibold text-white flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Prévisualisation obligatoire</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-400 hover:underline"
                  >
                    Changer de vidéo
                  </button>
                </div>

                <div 
                  className="relative w-full h-64 bg-black rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center group cursor-pointer"
                  onClick={handleTogglePlay}
                >
                  <video
                    ref={videoRef}
                    src={previewUrl}
                    className="w-full h-full object-contain"
                    playsInline
                    loop
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  {!isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-xl">
                        <Play className="w-7 h-7 fill-white translate-x-0.5" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Titre & Description facultatifs */}
            <div className="space-y-1">
              <label htmlFor="video-title" className="text-xs text-neutral-300 font-medium">
                Titre de la vidéo (facultatif)
              </label>
              <input
                id="video-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Donnez un titre captivant..."
                className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="video-desc" className="text-xs text-neutral-300 font-medium">
                Description (facultatif)
              </label>
              <textarea
                id="video-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Ajoutez des détails, #hashtags ou mentions..."
                className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Téléchargement checkbox (Section 22) */}
            <label className="flex items-center space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allowDownloads}
                onChange={(e) => setAllowDownloads(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 text-blue-600 focus:ring-blue-500 bg-neutral-800"
              />
              <span className="text-xs text-neutral-300">
                Autoriser les autres utilisateurs à télécharger cette vidéo
              </span>
            </label>

            {/* Bouton Publier */}
            <button
              id="btn-publish-video"
              type="submit"
              disabled={!selectedFile || status === 'uploading'}
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-40 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg"
            >
              {status === 'uploading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Publication en cours...</span>
                </>
              ) : (
                <span>Publier la vidéo</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
