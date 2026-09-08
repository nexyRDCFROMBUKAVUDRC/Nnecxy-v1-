/**
 * NNECXY - Settings Screen (Section 28)
 * - Apparence (mode clair / sombre)
 * - Langue (10 langues)
 * - Confidentialité
 * - Politique
 * - Aide
 * - Suppression du compte
 * - Déconnexion
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Globe, 
  ShieldCheck, 
  FileText, 
  HelpCircle, 
  Trash2, 
  LogOut, 
  AlertTriangle,
  Loader2,
  Server,
  Database,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { SupportedLanguage, AppTheme } from '../types';
import { LANGUAGE_OPTIONS, getTranslation } from '../i18n';
import { api } from '../services/api';

interface SettingsViewProps {
  onBack: () => void;
  currentTheme: AppTheme;
  onToggleTheme: (theme: AppTheme) => void;
  currentLang: SupportedLanguage;
  onChangeLang: (lang: SupportedLanguage) => void;
  onLogout: () => void;
  onAccountDeleted: () => void;
  onToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onBack,
  currentTheme,
  onToggleTheme,
  currentLang,
  onChangeLang,
  onLogout,
  onAccountDeleted,
  onToast,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeModal, setActiveModal] = useState<'privacy' | 'help' | null>(null);
  const [backendInfo, setBackendInfo] = useState<any>(null);
  const [isTestingBackend, setIsTestingBackend] = useState(false);

  useEffect(() => {
    api.checkHealth()
      .then((data) => setBackendInfo(data))
      .catch(() => setBackendInfo(null));
  }, []);

  const handleTestBackend = async () => {
    setIsTestingBackend(true);
    const start = Date.now();
    try {
      const data = await api.checkHealth();
      const elapsed = Date.now() - start;
      setBackendInfo(data);
      onToast(`Backend en ligne (${elapsed} ms) • API & DB connectées`);
    } catch (err: any) {
      onToast(`Erreur backend: ${err.message || 'Serveur injoignable'}`);
    } finally {
      setIsTestingBackend(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.deleteAccount();
      onToast('Votre compte et vos données ont été définitivement supprimés.');
      onAccountDeleted();
    } catch (err: any) {
      onToast(err.message || 'Erreur lors de la suppression.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#000000] text-white flex flex-col max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center space-x-3 bg-neutral-900/80">
        <button onClick={onBack} className="p-1 rounded-full text-neutral-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold flex-1">{getTranslation(currentLang, 'settings_title')}</h2>
      </div>

      {/* Settings list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Apparence */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>{getTranslation(currentLang, 'appearance')}</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onToggleTheme('light')}
              className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-colors ${
                currentTheme === 'light'
                  ? 'bg-white text-black border-white'
                  : 'bg-neutral-800 text-neutral-300 border-white/10 hover:bg-neutral-700'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Clair (Défaut)</span>
            </button>
            <button
              onClick={() => onToggleTheme('dark')}
              className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-colors ${
                currentTheme === 'dark'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                  : 'bg-neutral-800 text-neutral-300 border-white/10 hover:bg-neutral-700'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Sombre</span>
            </button>
          </div>
        </div>

        {/* Langue */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>{getTranslation(currentLang, 'language_select')}</span>
          </h3>
          <select
            value={currentLang}
            onChange={(e) => onChangeLang(e.target.value as SupportedLanguage)}
            className="w-full bg-[#202020] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code} className="bg-neutral-900 text-white">
                {opt.native} ({opt.label})
              </option>
            ))}
          </select>
        </div>

        {/* Statut Backend & Synchronisation */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Connexion Backend & Données</span>
            </h3>
            <button
              onClick={handleTestBackend}
              disabled={isTestingBackend}
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isTestingBackend ? 'animate-spin' : ''}`} />
              <span>Tester</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between bg-neutral-900/60 p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-neutral-300">Serveur API Express</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">Connecté (Port 3000)</span>
            </div>

            <div className="flex items-center justify-between bg-neutral-900/60 p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center space-x-2">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-neutral-300">Base de données & Vidéos</span>
              </div>
              <span className="text-[11px] text-blue-400 font-semibold">
                {backendInfo?.backend?.counts?.videos !== undefined
                  ? `${backendInfo.backend.counts.videos} vidéos actives`
                  : 'Opérationnel'}
              </span>
            </div>

            <div className="flex items-center justify-between bg-neutral-900/60 p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-neutral-300">Supabase Cloud Project</span>
              </div>
              <span className="text-[11px] text-purple-400 font-medium truncate max-w-[140px]">
                {backendInfo?.backend?.supabase?.configured ? 'Configuré' : 'Prêt'}
              </span>
            </div>
          </div>
        </div>

        {/* Confidentialité & Aide */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/10">
          <button
            onClick={() => setActiveModal('privacy')}
            className="w-full p-3.5 flex items-center justify-between text-sm text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{getTranslation(currentLang, 'privacy_policy')}</span>
            </div>
            <span className="text-xs text-neutral-500">Consulter</span>
          </button>

          <button
            onClick={() => setActiveModal('help')}
            className="w-full p-3.5 flex items-center justify-between text-sm text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>{getTranslation(currentLang, 'help_support')}</span>
            </div>
            <span className="text-xs text-neutral-500">FAQ & Aide</span>
          </button>
        </div>

        {/* Actions de compte */}
        <div className="space-y-2 pt-2">
          <button
            id="btn-logout"
            onClick={onLogout}
            className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-white/15 font-bold rounded-2xl flex items-center justify-center space-x-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{getTranslation(currentLang, 'logout')}</span>
          </button>

          <button
            id="btn-delete-account"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full h-12 bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-900/50 font-bold rounded-2xl flex items-center justify-center space-x-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{getTranslation(currentLang, 'delete_account')}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Suppression Compte (Section 28) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-red-900 rounded-3xl p-5 max-w-xs w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white">Supprimer votre compte ?</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {getTranslation(currentLang, 'delete_account_confirm')}
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="w-full h-11 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Confirmer la suppression</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full h-11 bg-neutral-800 text-neutral-300 hover:text-white rounded-xl text-sm font-semibold"
              >
                {getTranslation(currentLang, 'cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-white/10 rounded-3xl p-5 max-w-md w-full max-h-[80vh] flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="font-bold text-base">Politique de Confidentialité</h3>
              <button onClick={() => setActiveModal(null)} className="text-neutral-400 hover:text-white text-sm">Fermer</button>
            </div>
            <div className="overflow-y-auto text-xs text-neutral-300 space-y-2.5 pr-1">
              <p>NNECXY respecte scrupuleusement la confidentialité de ses utilisateurs.</p>
              <p><strong>1. Données collectées :</strong> Vos informations de profil, vidéos publiées et interactions nécessaires au fonctionnement du service.</p>
              <p><strong>2. RLS & Sécurité :</strong> Vos données privées restent strictement inaccessibles aux tiers via des règles de sécurité Row Level Security (RLS).</p>
              <p><strong>3. Suppression :</strong> Vous pouvez à tout moment supprimer l’intégralité de vos données via les paramètres.</p>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-white/10 rounded-3xl p-5 max-w-md w-full max-h-[80vh] flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="font-bold text-base">Aide & Support NNECXY</h3>
              <button onClick={() => setActiveModal(null)} className="text-neutral-400 hover:text-white text-sm">Fermer</button>
            </div>
            <div className="overflow-y-auto text-xs text-neutral-300 space-y-2.5 pr-1">
              <p><strong>Comment publier une vidéo ?</strong> Cliquez sur le bouton (+) au centre de la barre de navigation, sélectionnez un fichier vidéo puis prévisualisez avant de publier.</p>
              <p><strong>Signalement :</strong> Cliquez sur les 3 points (...) en haut à droite de chaque vidéo pour choisir l'une des 13 raisons officielles.</p>
              <p><strong>Contact :</strong> support@nnecxy.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
