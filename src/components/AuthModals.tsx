/**
 * NNECXY - Authentication Screens & Modals
 * Strictly adhering to Section 10 (Login, Signup, Forgot Password)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, UserPlus, KeyRound, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { UserProfile, SupportedLanguage } from '../types';
import { getTranslation } from '../i18n';

interface AuthModalsProps {
  mode: 'login' | 'signup' | 'forgot_password' | null;
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'signup' | 'forgot_password') => void;
  onAuthSuccess: (user: UserProfile) => void;
  lang: SupportedLanguage;
}

export const AuthModals: React.FC<AuthModalsProps> = ({
  mode,
  onClose,
  onSwitchMode,
  onAuthSuccess,
  lang,
}) => {
  // Login Form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup Form state (Section 10 requirements)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [username, setUsername] = useState('');
const [pseudo, setPseudo] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // General state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!mode) return null;
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMessage('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.login({
        identifier: loginIdentifier.trim(),
        password: loginPassword,
      });
      console.log("Réponse login:", res);
      const user = (res as any).user || res;
      if (!user) throw new Error("Email ou mot de passe incorrect.");
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Échec de connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim() || !lastName.trim() || !emailOrPhone.trim() || !username.trim() || !signupPassword) {
      setErrorMessage("Tous les champs obligatoires doivent être renseignés.");
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMessage("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }
    if (signupPassword !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!acceptTerms) {
      setErrorMessage("Vous devez accepter les conditions d'utilisation.");
      return;
    }

    setLoading(true);
    const isEmail = emailOrPhone.includes('@');

    try {
      const res = await api.signup({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: isEmail ? emailOrPhone.trim() : undefined,
        phone: isEmail ? undefined : emailOrPhone.trim(),
        // birth_date retiré temporairement pour débloquer la création selon Section 10 du PDF
        username: username.trim(),
        password: signupPassword,
        accept_terms: acceptTerms,
      });

      console.log("Réponse signup:", res);
      const user = (res as any).user || res;
      if (!user) throw new Error("Compte créé, veuillez vous connecter.");
      
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de la création de l'utilisateur.");
    } finally {
      setLoading(false);
    }
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMessage('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
= async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMessage('Veuillez renseigner votre adresse email.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.forgotPassword(forgotEmail.trim());
      setForgotSuccess(res.message);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur de réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl text-white max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {mode !== 'login' && (
                <button
                  type="button"
                  onClick={() => onSwitchMode('login')}
                  className="p-1 -ml-1 text-neutral-400 hover:text-white rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-lg font-bold">
                {mode === 'login' && getTranslation(lang, 'login_title')}
                {mode === 'signup' && getTranslation(lang, 'signup_title')}
                {mode === 'forgot_password' && getTranslation(lang, 'forgot_password')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span className="flex-1">{errorMessage}</span>
              </div>
            )}

            {/* 1. LOGIN */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="login-id" className="text-xs font-medium text-neutral-300">
                    {getTranslation(lang, 'email_or_phone')} ou Pseudo
                  </label>
                  <input
                    id="login-id"
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="email@domaine.com, +243... ou @pseudo"
                    required
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-pwd" className="text-xs font-medium text-neutral-300">
                      {getTranslation(lang, 'password_label')}
                    </label>
                    <button
                      type="button"
                      onClick={() => onSwitchMode('forgot_password')}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      {getTranslation(lang, 'forgot_password')}
                    </button>
                  </div>
                  <input
                    id="login-pwd"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg mt-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  <span>{getTranslation(lang, 'login_button')}</span>
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-neutral-400">
                    {getTranslation(lang, 'no_account_prompt')}{' '}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSwitchMode('signup')}
                    className="text-xs text-cyan-400 font-bold hover:underline"
                  >
                    {getTranslation(lang, 'signup_button')}
                  </button>
                </div>
              </form>
            )}

            {/* 2. SIGNUP */}
            {mode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="reg-first" className="text-xs font-medium text-neutral-300">
                      {getTranslation(lang, 'first_name_label')} *
                    </label>
                    <input
                      id="reg-first"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder="Justin"
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="reg-last" className="text-xs font-medium text-neutral-300">
                      {getTranslation(lang, 'last_name_label')} *
                    </label>
                    <input
                      id="reg-last"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      placeholder="Batumike"
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="reg-contact" className="text-xs font-medium text-neutral-300">
                    {getTranslation(lang, 'email_or_phone')} *
                  </label>
                  <input
                    id="reg-contact"
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    required
                    placeholder="email@domaine.com ou +243..."
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="reg-user" className="text-xs font-medium text-neutral-300">
                      {getTranslation(lang, 'username_label')} *
                    </label>
                    <input
                      id="reg-user"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="justin902"
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="reg-birth" className="text-xs font-medium text-neutral-300">
                      {getTranslation(lang, 'birth_date_label')}
                    </label>
                    <input
                      id="reg-birth"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="reg-pwd" className="text-xs font-medium text-neutral-300">
                      {getTranslation(lang, 'password_label')} *
                    </label>
                    <input
                      id="reg-pwd"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      placeholder="min. 6 car."
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="reg-pwd-conf" className="text-xs font-medium text-neutral-300">
                      {getTranslation(lang, 'confirm_password_label')} *
                    </label>
                    <input
                      id="reg-pwd-conf"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="confirmer"
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <label className="flex items-start space-x-2 text-xs text-neutral-300 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    required
                    className="w-4 h-4 mt-0.5 rounded border-neutral-700 text-blue-600 bg-neutral-800"
                  />
                  <span>{getTranslation(lang, 'accept_terms_label')}</span>
                </label>

                <button
                  id="btn-submit-signup"
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg mt-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>{getTranslation(lang, 'signup_button')}</span>
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-neutral-400">
                    {getTranslation(lang, 'have_account_prompt')}{' '}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSwitchMode('login')}
                    className="text-xs text-cyan-400 font-bold hover:underline"
                  >
                    {getTranslation(lang, 'login_button')}
                  </button>
                </div>
              </form>
            )}

            {/* 3. FORGOT PASSWORD */}
            {mode === 'forgot_password' && (
              <form onSubmit={handleForgot} className="space-y-4">
                <p className="text-xs text-neutral-400">
                  {getTranslation(lang, 'reset_password_instructions')}
                </p>

                {forgotSuccess ? (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-200 text-xs">
                    {forgotSuccess}
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label htmlFor="forgot-email" className="text-xs font-medium text-neutral-300">
                        {getTranslation(lang, 'email_label')}
                      </label>
                      <input
                        id="forgot-email"
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="votre-email@domaine.com"
                        required
                        className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                      <span>{getTranslation(lang, 'send_reset_link')}</span>
                    </button>
                  </>
                )}

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => onSwitchMode('login')}
                    className="text-xs text-cyan-400 font-bold hover:underline"
                  >
                    {getTranslation(lang, 'back_to_login')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
