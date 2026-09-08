/**
 * NNECXY - Splash Screen (Section 7)
 * - Official logo NNECXY
 * - Session verification (max 5s)
 * - Navigation to Feed or Welcome
 * - Clear error & retry if timeout or network failure
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { LogoNNECXY } from './LogoNNECXY';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { api, getStoredToken, setStoredToken, ApiError } from '../services/api';
import { UserProfile } from '../types';

interface SplashScreenProps {
  onSessionChecked: (user: UserProfile | null) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onSessionChecked }) => {
  const [isDelayed, setIsDelayed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Maximum splash timeout: 5 seconds (Section 7)
    const timeoutTimer = setTimeout(() => {
      if (isMounted) {
        setIsDelayed(true);
      }
    }, 4500);

    const checkSession = async () => {
      const token = getStoredToken();
      if (!token) {
        clearTimeout(timeoutTimer);
        setTimeout(() => {
          if (isMounted) onSessionChecked(null);
        }, 900);
        return;
      }

      try {
        const res = await api.getMe();
        clearTimeout(timeoutTimer);
        setTimeout(() => {
          if (isMounted) onSessionChecked(res.user);
        }, 800);
      } catch (err: any) {
        clearTimeout(timeoutTimer);
        if (isMounted) {
          // If token is invalid or expired (401), or session not found, clear token and proceed to Welcome screen
          if (
            err.status === 401 ||
            (err.message && (
              err.message.includes('401') ||
              err.message.includes('Session non valide') ||
              err.message.includes('expirée')
            ))
          ) {
            setStoredToken(null);
            onSessionChecked(null);
          } else {
            // Actual network or connectivity failure
            setErrorMessage('Connexion au serveur en cours...');
            setIsDelayed(true);
          }
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
      clearTimeout(timeoutTimer);
    };
  }, [onSessionChecked]);

  const handleRetry = async () => {
    setIsDelayed(false);
    setErrorMessage(null);
    try {
      const token = getStoredToken();
      if (token) {
        const res = await api.getMe();
        onSessionChecked(res.user);
        return;
      }
      onSessionChecked(null);
    } catch (err: any) {
      if (err.status === 401) {
        setStoredToken(null);
        onSessionChecked(null);
      } else {
        setErrorMessage('Connexion impossible. Veuillez réessayer.');
        setIsDelayed(true);
      }
    }
  };

  const handleContinueWelcome = () => {
    onSessionChecked(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#000000] flex flex-col items-center justify-center p-6 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center text-center"
      >
        {/* Official Logo NNECXY */}
        <LogoNNECXY size={140} showText={true} />

        <p className="mt-4 text-xs tracking-widest text-[#00E5FF]/80 uppercase font-semibold">
          Réseau Social Vidéo Réel
        </p>

        {/* Loading Spinner */}
        {!isDelayed && (
          <div className="mt-8 flex items-center space-x-2 text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin text-[#00E5FF]" />
            <span className="text-xs font-medium">Initialisation sécurisée...</span>
          </div>
        )}

        {/* Delayed or Error State with Retry (Section 7) */}
        {isDelayed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex flex-col items-center space-y-3 bg-neutral-900/80 border border-white/10 rounded-2xl p-4 max-w-xs"
          >
            {errorMessage ? (
              <div className="flex items-center space-x-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : (
              <span className="text-xs text-neutral-300">
                Le serveur prend un instant pour répondre...
              </span>
            )}

            <div className="flex items-center space-x-2 w-full pt-1">
              <button
                onClick={handleRetry}
                className="flex-1 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Réessayer</span>
              </button>
              <button
                onClick={handleContinueWelcome}
                className="flex-1 h-9 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold"
              >
                Continuer
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
