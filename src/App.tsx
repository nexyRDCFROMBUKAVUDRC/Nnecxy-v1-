/**
 * NNECXY - Main Application Root
 * Strictly respects all sections of the NNECXY Master Specifications
 */

import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthModals } from './components/AuthModals';
import { FeedView } from './components/FeedView';
import { ProfileView } from './components/ProfileView';
import { SearchView } from './components/SearchView';
import { MessagesView } from './components/MessagesView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { BottomTabs } from './components/BottomTabs';
import { ReportModal } from './components/ReportModal';
import { CommentsModal } from './components/CommentsModal';
import { CreateVideoModal } from './components/CreateVideoModal';
import { BoosterModal } from './components/BoosterModal';
import { Toast } from './components/Toast';
import { api } from './services/api';
import { 
  UserProfile, 
  VideoRecord, 
  AppTab, 
  SupportedLanguage, 
  AppTheme 
} from './types';

type ScreenState = 
  | 'splash'
  | 'welcome'
  | 'feed'
  | 'profile'
  | 'search'
  | 'messages'
  | 'notifications'
  | 'settings';

export default function App() {
  // Session & User
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [screen, setScreen] = useState<ScreenState>('splash');
  const [currentTab, setCurrentTab] = useState<AppTab>('feed');

  // Creator profile navigation target
  const [targetCreatorId, setTargetCreatorId] = useState<string | null>(null);

  // Active conversation for messaging
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Modals state
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot_password' | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [reportingVideo, setReportingVideo] = useState<VideoRecord | null>(null);
  const [commentingVideo, setCommentingVideo] = useState<VideoRecord | null>(null);
  const [boosterVideo, setBoosterVideo] = useState<VideoRecord | null>(null);

  // Settings: Theme & Language (Section 28)
  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('nnecxy_theme') as AppTheme) || 'dark';
  });

  const [lang, setLang] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('nnecxy_lang') as SupportedLanguage) || 'fr';
  });

  // Global Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleToggleTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    localStorage.setItem('nnecxy_theme', newTheme);
  };

  const handleChangeLang = (newLang: SupportedLanguage) => {
    setLang(newLang);
    localStorage.setItem('nnecxy_lang', newLang);
  };

  // Splash check completion
  const handleSessionChecked = (user: UserProfile | null) => {
    if (user) {
      setCurrentUser(user);
      setScreen('feed');
      setCurrentTab('feed');
    } else {
      setCurrentUser(null);
      setScreen('welcome');
    }
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setScreen('feed');
    setCurrentTab('feed');
    showToast(`Bienvenue sur NNECXY, @${user.username} !`);
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setScreen('welcome');
    showToast('Déconnexion réussie.', 'info');
  };

  const handleAccountDeleted = () => {
    setCurrentUser(null);
    setScreen('welcome');
  };

  // Bottom Tabs navigation handler (Section "BOTTOM TABS")
  const handleSelectTab = (tab: AppTab) => {
    setCurrentTab(tab);
    if (tab === 'feed') {
      setTargetCreatorId(null);
      setScreen('feed');
    } else if (tab === 'create') {
      setIsCreateOpen(true);
    } else if (tab === 'profile') {
      setTargetCreatorId(null);
      setScreen('profile');
    }
  };

  // Check if bottom tabs should be visible
  // Section "BOTTOM TABS": "Visible UNIQUEMENT si session Supabase valide. Invisible sur /, /welcome, /auth/*"
  const isBottomTabsVisible = 
    Boolean(currentUser) && 
    (screen === 'feed' || screen === 'profile') && 
    !isCreateOpen;

  return (
    <div className={`w-full h-[100dvh] overflow-hidden flex justify-center bg-black ${theme === 'light' ? 'theme-light' : 'theme-dark'}`}>
      <div className="relative w-full max-w-md h-full bg-black overflow-hidden shadow-2xl flex flex-col font-sans">
        
        {/* Toast Notification */}
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />

        {/* 1. SPLASH SCREEN (Section 7) */}
        {screen === 'splash' && (
          <SplashScreen onSessionChecked={handleSessionChecked} />
        )}

        {/* 2. WELCOME SCREEN (Section 10) */}
        {screen === 'welcome' && (
          <WelcomeScreen
            onOpenLogin={() => setAuthMode('login')}
            onOpenSignup={() => setAuthMode('signup')}
            currentLang={lang}
            onChangeLang={handleChangeLang}
          />
        )}

        {/* 3. MAIN FEED (Sections 4, 12, 13) */}
        {screen === 'feed' && currentUser && (
          <FeedView
            currentUser={currentUser}
            onOpenReport={(vid) => setReportingVideo(vid)}
            onOpenComments={(vid) => setCommentingVideo(vid)}
            onOpenCreator={(creatorId) => {
              setTargetCreatorId(creatorId);
              setScreen('profile');
              setCurrentTab('profile');
            }}
            onOpenSearch={() => setScreen('search')}
            onOpenMessages={() => setScreen('messages')}
            onOpenNotifications={() => setScreen('notifications')}
            onOpenCreate={() => setIsCreateOpen(true)}
            onToast={showToast}
            lang={lang}
          />
        )}

        {/* 4. PROFILE (MON PROFIL OU PROFIL CRÉATEUR) (Sections 11, 16) */}
        {screen === 'profile' && currentUser && (
          <ProfileView
            currentUser={currentUser}
            targetUserId={targetCreatorId}
            onBack={() => {
              setTargetCreatorId(null);
              setScreen('feed');
              setCurrentTab('feed');
            }}
            onOpenSettings={() => setScreen('settings')}
            onOpenBooster={(vid) => setBoosterVideo(vid)}
            onOpenMessagesWithUser={async (userId) => {
              try {
                const res = await api.createConversation(userId);
                setActiveConversationId(res.conversation.id);
                setScreen('messages');
              } catch (err: any) {
                showToast(err.message || 'Impossible d’ouvrir la conversation.', 'error');
              }
            }}
            onSelectVideo={(vid) => {
              // Open video in feed
              setScreen('feed');
              setCurrentTab('feed');
            }}
            onUpdateProfileSuccess={(updatedUser) => {
              setCurrentUser(updatedUser);
            }}
            onToast={showToast}
            lang={lang}
          />
        )}

        {/* 5. SEARCH VIEW (Section 23) */}
        {screen === 'search' && (
          <SearchView
            onBack={() => setScreen('feed')}
            onSelectUser={(userId) => {
              setTargetCreatorId(userId);
              setScreen('profile');
              setCurrentTab('profile');
            }}
            onSelectVideo={(video) => {
              setScreen('feed');
              setCurrentTab('feed');
            }}
            lang={lang}
          />
        )}

        {/* 6. MESSAGES VIEW (Section 24) */}
        {screen === 'messages' && currentUser && (
          <MessagesView
            currentUser={currentUser}
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
            onBack={() => {
              setActiveConversationId(null);
              setScreen('feed');
            }}
            lang={lang}
          />
        )}

        {/* 7. NOTIFICATIONS VIEW (Section 26) */}
        {screen === 'notifications' && (
          <NotificationsView
            onBack={() => setScreen('feed')}
            lang={lang}
          />
        )}

        {/* 8. SETTINGS VIEW (Section 28) */}
        {screen === 'settings' && (
          <SettingsView
            onBack={() => setScreen('profile')}
            currentTheme={theme}
            onToggleTheme={handleToggleTheme}
            currentLang={lang}
            onChangeLang={handleChangeLang}
            onLogout={handleLogout}
            onAccountDeleted={handleAccountDeleted}
            onToast={showToast}
          />
        )}

        {/* BOTTOM TABS - 3 BOUTONS FIXES (Page 13) */}
        {isBottomTabsVisible && (
          <BottomTabs
            currentTab={currentTab}
            onSelectTab={handleSelectTab}
            lang={lang}
          />
        )}

        {/* MODALS */}
        {/* Auth Modals: Login, Signup, Forgot Password (Section 10) */}
        <AuthModals
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitchMode={setAuthMode}
          onAuthSuccess={handleAuthSuccess}
          lang={lang}
        />

        {/* Create Video Modal (Section 14) */}
        <CreateVideoModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onVideoCreated={(newVid) => {
            showToast('Votre vidéo est en ligne !');
            setScreen('feed');
            setCurrentTab('feed');
          }}
          onToast={showToast}
        />

        {/* Report Modal - 13 Exact Reasons (Section 27) */}
        <ReportModal
          isOpen={Boolean(reportingVideo)}
          videoId={reportingVideo?.id || null}
          videoTitle={reportingVideo?.title}
          isOwner={Boolean(currentUser && reportingVideo && currentUser.id === reportingVideo.user_id)}
          onClose={() => setReportingVideo(null)}
          onSuccessToast={showToast}
        />

        {/* Comments Modal (Section 19) */}
        <CommentsModal
          isOpen={Boolean(commentingVideo)}
          videoId={commentingVideo?.id || null}
          currentUser={currentUser}
          onClose={() => setCommentingVideo(null)}
          onCommentAdded={() => {
            if (commentingVideo) {
              setCommentingVideo({
                ...commentingVideo,
                comments_count: (commentingVideo.comments_count || 0) + 1,
              });
            }
          }}
        />

        {/* Booster Modal (Sections 16 & 36) */}
        <BoosterModal
          isOpen={Boolean(boosterVideo)}
          video={boosterVideo}
          onClose={() => setBoosterVideo(null)}
          lang={lang}
        />

      </div>
    </div>
  );
}
