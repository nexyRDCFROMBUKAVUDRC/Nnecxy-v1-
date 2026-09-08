/**
 * NNECXY - Booster Modal (Sections 16 & 36)
 * Strict Requirement:
 * - Appears ONLY under user's own videos in "Mes vidéos"
 * - Displays clear status: "Fonctionnalité momentanément indisponible."
 * - No fake likes, views, followers, or simulated transactions.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Rocket, ShieldAlert, Sparkles } from 'lucide-react';
import { VideoRecord, SupportedLanguage } from '../types';
import { getTranslation } from '../i18n';

interface BoosterModalProps {
  isOpen: boolean;
  video: VideoRecord | null;
  onClose: () => void;
  lang: SupportedLanguage;
}

export const BoosterModal: React.FC<BoosterModalProps> = ({
  isOpen,
  video,
  onClose,
  lang,
}) => {
  if (!isOpen || !video) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-[#141414] text-white border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 text-center"
        >
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Rocket className="w-5 h-5" />
              <h3 className="font-bold text-base">{getTranslation(lang, 'booster_title')}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h4 className="font-bold text-lg text-white">
              {video.title || 'Vidéo sélectionnée'}
            </h4>
            <p className="text-xs text-neutral-400 mt-1">
              Visibilité organique & amplification pour les créateurs
            </p>
          </div>

          <div className="p-3.5 bg-amber-950/40 border border-amber-800/50 rounded-2xl text-left space-y-1.5">
            <div className="flex items-center space-x-2 text-amber-300 font-semibold text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{getTranslation(lang, 'feature_unavailable')}</span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              {getTranslation(lang, 'feature_unavailable_desc')}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full h-11 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {getTranslation(lang, 'close')}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
