/**
 * NNECXY - Signalement Bottom Sheet Modal
 * Strictly adhering to Section 27 (PROMPT MAÎTRE - BOUTON SIGNALER NNECXY)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { REPORT_REASONS_EXACT, ReportReason } from '../types';
import { api } from '../services/api';

interface ReportModalProps {
  isOpen: boolean;
  videoId: string | null;
  videoTitle?: string;
  isOwner: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  videoId,
  isOwner,
  onClose,
  onSuccessToast,
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'initial' | 'loading' | 'error'>('initial');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !videoId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOwner) {
      setErrorMessage('Vous ne pouvez pas signaler votre propre vidéo.');
      setStatus('error');
      return;
    }

    if (!selectedReason) {
      setErrorMessage('Veuillez sélectionner l’une des 13 raisons de signalement.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const res = await api.reportVideo({
        video_id: videoId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });

      setStatus('initial');
      setSelectedReason(null);
      setDescription('');
      onClose();
      onSuccessToast(res.message || 'Merci, votre signalement a été reçu.');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Erreur lors de l’envoi du signalement.');
    }
  };

  const handleRetry = () => {
    setStatus('initial');
    setErrorMessage(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
        {/* Backdrop dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[#121212] text-white rounded-t-[28px] border-t border-white/10 max-h-[85vh] flex flex-col z-10 shadow-2xl pb-24"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-[#FF3B30]" />
              <h2 className="text-lg font-bold">Signaler cette vidéo</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1">
            {isOwner && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-sm">
                Vous ne pouvez pas signaler votre propre vidéo.
              </div>
            )}

            {status === 'error' && errorMessage && (
              <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl text-red-200 text-sm flex items-center justify-between">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="text-xs bg-red-800 hover:bg-red-700 text-white font-medium px-2 py-1 rounded"
                >
                  Réessayer
                </button>
              </div>
            )}

            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
              Choisissez une raison (une seule sélectionnable) :
            </p>

            {/* 13 Exact Reasons List */}
            <div className="space-y-1.5">
              {REPORT_REASONS_EXACT.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => {
                      setSelectedReason(reason);
                      setErrorMessage(null);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                        : 'bg-[#1a1a1a] border-white/5 text-neutral-300 hover:bg-[#242424]'
                    }`}
                  >
                    <span>{reason}</span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-neutral-600 bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Details (optional) */}
            <div className="space-y-1">
              <label htmlFor="report-details" className="text-xs text-neutral-400 font-medium">
                Détails (optionnel)
              </label>
              <textarea
                id="report-details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Précisez le contexte du signalement..."
                className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Action button */}
            <button
              id="btn-submit-report"
              type="submit"
              disabled={status === 'loading' || !selectedReason || isOwner}
              className="w-full h-12 bg-[#FF3B30] hover:bg-[#ff2417] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <span>Envoyer le signalement</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
