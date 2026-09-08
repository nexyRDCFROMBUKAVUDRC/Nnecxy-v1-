/**
 * NNECXY - Welcome Screen (Section 10)
 * Afficher :
 * - logo officiel
 * - message de bienvenue
 * - Se connecter
 * - Créer un compte
 * - choix de langue
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { LogoNNECXY } from './LogoNNECXY';
import { Globe, LogIn, UserPlus, Server, CheckCircle2 } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { LANGUAGE_OPTIONS, getTranslation } from '../i18n';
import { api } from '../services/api';

interface WelcomeScreenProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  currentLang: SupportedLanguage;
  onChangeLang: (lang: SupportedLanguage) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onOpenLogin,
  onOpenSignup,
  currentLang,
  onChangeLang,
}) => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'offline'>('checking');

  useEffect(() => {
    let isMounted = true;
    api.checkHealth()
      .then((res) => {
        if (isMounted && res && res.status === 'ok') {
          setBackendStatus('connected');
        }
      })
      .catch(() => {
        if (isMounted) setBackendStatus('offline');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-[#000000] text-white flex flex-col justify-between p-6 max-w-md mx-auto select-none">
      {/* Top Bar: Language Selector & Backend Status */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center space-x-1.5 bg-neutral-900/90 border border-white/10 rounded-full px-3 py-1 shadow-lg text-[11px]">
          {backendStatus === 'connected' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-emerald-400 font-medium">Backend connecté</span>
            </>
          ) : backendStatus === 'checking' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span className="text-cyan-400/90 font-medium">Connexion backend...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span className="text-amber-400 font-medium">Reconnexion backend...</span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2 bg-neutral-900/90 border border-white/10 rounded-full px-3 py-1.5 shadow-lg">
          <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            value={currentLang}
            onChange={(e) => onChangeLang(e.target.value as SupportedLanguage)}
            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code} className="bg-neutral-900 text-white">
                {opt.native} ({opt.label})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Official Logo & Welcome Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center my-auto px-4"
      >
        <LogoNNECXY size={140} showText={true} />

        <h1 className="text-2xl font-black text-white mt-6 tracking-tight">
          {getTranslation(currentLang, 'welcome_title')}
        </h1>

        <p className="text-sm text-neutral-400 mt-2 max-w-xs leading-relaxed">
          {getTranslation(currentLang, 'welcome_subtitle')}
        </p>

        <div className="mt-4 flex items-center space-x-2 text-[11px] text-[#00E5FF]/80 font-medium tracking-wide">
          <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
          <span>Plateforme réelle et connectée</span>
        </div>
      </motion.div>

      {/* Bottom Actions: Log In & Sign Up */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-3 pb-4"
      >
        <button
          id="btn-welcome-login"
          onClick={onOpenLogin}
          className="w-full h-12 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg"
        >
          <LogIn className="w-4 h-4" />
          <span>{getTranslation(currentLang, 'login_button')}</span>
        </button>

        <button
          id="btn-welcome-signup"
          onClick={onOpenSignup}
          className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] text-white font-bold rounded-2xl border border-white/15 flex items-center justify-center space-x-2 transition-all shadow"
        >
          <UserPlus className="w-4 h-4 text-cyan-400" />
          <span>{getTranslation(currentLang, 'signup_button')}</span>
        </button>

        <p className="text-[11px] text-neutral-500 text-center pt-2">
          En continuant, vous acceptez les règles et la politique de confidentialité de NNECXY.
        </p>
      </motion.div>
    </div>
  );
};
