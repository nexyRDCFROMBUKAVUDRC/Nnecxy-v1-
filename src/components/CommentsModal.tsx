/**
 * NNECXY - Comments Modal
 * Strictly adhering to Section 19 (Commentaires réels)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { CommentRecord, UserProfile } from '../types';
import { api } from '../services/api';

interface CommentsModalProps {
  isOpen: boolean;
  videoId: string | null;
  currentUser: UserProfile | null;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  videoId,
  currentUser,
  onClose,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && videoId) {
      loadComments();
    }
  }, [isOpen, videoId]);

  const loadComments = async () => {
    if (!videoId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getComments(videoId);
      setComments(res.comments);
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les commentaires.');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoId || !content.trim() || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.postComment(videoId, content.trim());
      setComments((prev) => [res.comment, ...prev]);
      setContent('');
      if (onCommentAdded) onCommentAdded();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la publication du commentaire.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!videoId) return;
    try {
      await api.deleteComment(videoId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression.');
    }
  };

  if (!isOpen || !videoId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[#121212] text-white rounded-t-[28px] border-t border-white/10 h-[65vh] flex flex-col z-10 shadow-2xl pb-24"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold">
                Commentaires ({comments.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-2 text-neutral-400">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-xs">Chargement des commentaires...</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={loadComments}
                  className="bg-red-800 text-white px-2 py-1 rounded text-xs"
                >
                  Réessayer
                </button>
              </div>
            )}

            {!loading && comments.length === 0 && (
              <div className="text-center py-12 text-neutral-500 space-y-1">
                <p className="text-sm font-medium">Aucun commentaire pour le moment.</p>
                <p className="text-xs">Soyez le premier à commenter !</p>
              </div>
            )}

            {!loading &&
              comments.map((comment) => {
                const isMyComment = currentUser && currentUser.id === comment.user_id;
                return (
                  <div key={comment.id} className="flex space-x-3 text-sm group">
                    <img
                      src={comment.author?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.user_id}`}
                      alt={comment.author?.username || 'user'}
                      className="w-8 h-8 rounded-full bg-neutral-800 object-cover shrink-0 border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-300">
                          @{comment.author?.username || 'utilisateur'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-neutral-500">
                            {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMyComment && (
                            <button
                              onClick={() => handleDelete(comment.id)}
                              className="text-neutral-500 hover:text-red-400 p-1 opacity-80 group-hover:opacity-100 transition-opacity"
                              title="Supprimer mon commentaire"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-neutral-200 mt-0.5 break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Form */}
          <form onSubmit={handlePost} className="p-3 border-t border-white/10 bg-[#161616] flex items-center space-x-2">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="flex-1 bg-[#242424] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-40 text-white flex items-center justify-center transition-transform shrink-0"
              aria-label="Envoyer"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
