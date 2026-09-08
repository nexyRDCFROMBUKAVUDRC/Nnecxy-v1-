/**
 * NNECXY - BOTTOM TABS (3 BOUTONS FIXES)
 * Strictly adhering to Section "BOTTOM TABS - 3 BOUTONS FIXES" (Page 13)
 *
 * Requirements:
 * - Barre en bas : hauteur 70px max, fond noir #000 avec arrondi 28px en haut, toujours par dessus la vidéo
 * - 3 icônes seulement, espacées équitablement:
 *   1. ACCUEIL (maison outline) à gauche
 *   2. CRÉER (+) au centre, icône plus grande 56x56px, fond gris clair #222, arrondi 18px
 *   3. MON PROFIL (person outline) à droite
 * - Texte sous icônes: 11px, blanc, "Accueil", "Créer", "Mon Profil"
 */

import React from 'react';
import { Home, Plus, User } from 'lucide-react';
import { AppTab, SupportedLanguage } from '../types';
import { getTranslation } from '../i18n';

interface BottomTabsProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  lang: SupportedLanguage;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({ currentTab, onSelectTab, lang }) => {
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto pointer-events-auto"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <nav 
        id="nnecxy-bottom-tabs"
        className="h-[68px] bg-[#000000]/95 backdrop-blur-md rounded-t-[28px] border-t border-white/10 px-6 flex items-center justify-between shadow-2xl"
        style={{ opacity: 0.95 }}
      >
        {/* 1. ACCUEIL (maison outline) */}
        <button
          id="btn-tab-feed"
          onClick={() => onSelectTab('feed')}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all group active:scale-95"
        >
          <Home 
            className={`w-6 h-6 transition-colors ${
              currentTab === 'feed' ? 'text-white stroke-[2.5]' : 'text-neutral-400 stroke-[1.8] group-hover:text-white'
            }`} 
          />
          <span className="text-[11px] font-medium text-white tracking-tight mt-1 whitespace-nowrap">
            {getTranslation(lang, 'tab_feed')}
          </span>
        </button>

        {/* 2. CRÉER (+) au centre, 56x56px, fond #222, arrondi 18px */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <button
            id="btn-tab-create"
            onClick={() => onSelectTab('create')}
            className="w-[56px] h-[56px] bg-[#222222] hover:bg-[#2c2c2c] active:scale-95 text-white rounded-[18px] flex items-center justify-center shadow-lg border border-white/15 transition-transform"
            aria-label="Créer"
          >
            <Plus className="w-7 h-7 text-white stroke-[2.5]" />
          </button>
          <span className="text-[11px] font-medium text-white tracking-tight mt-0.5 whitespace-nowrap">
            {getTranslation(lang, 'tab_create')}
          </span>
        </div>

        {/* 3. MON PROFIL (person outline) */}
        <button
          id="btn-tab-profile"
          onClick={() => onSelectTab('profile')}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all group active:scale-95"
        >
          <User 
            className={`w-6 h-6 transition-colors ${
              currentTab === 'profile' ? 'text-white stroke-[2.5]' : 'text-neutral-400 stroke-[1.8] group-hover:text-white'
            }`} 
          />
          <span className="text-[11px] font-medium text-white tracking-tight mt-1 whitespace-nowrap">
            {getTranslation(lang, 'tab_profile')}
          </span>
        </button>
      </nav>
    </div>
  );
};
