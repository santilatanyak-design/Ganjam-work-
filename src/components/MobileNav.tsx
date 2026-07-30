import React from 'react';
import { ActiveTab, Language } from '../types';
import { translations } from '../data/translations';
import { Wrench, Sprout, Tractor, TrendingUp, Sparkles } from 'lucide-react';

interface MobileNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  language: Language;
  onOpenAi: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  language,
  onOpenAi,
}) => {
  const t = translations[language];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-emerald-950 border-t border-emerald-800 py-1 px-2 sm:hidden flex items-center justify-around text-white shadow-2xl">
      <button
        onClick={() => onTabChange('services')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
          activeTab === 'services' ? 'text-amber-400 font-bold' : 'text-emerald-300 opacity-80'
        }`}
      >
        <Wrench className="w-5 h-5 mb-0.5" />
        <span>{language === 'or' ? 'ସେବା' : 'Services'}</span>
      </button>

      <button
        onClick={() => onTabChange('mandi')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
          activeTab === 'mandi' ? 'text-amber-400 font-bold' : 'text-emerald-300 opacity-80'
        }`}
      >
        <Sprout className="w-5 h-5 mb-0.5" />
        <span>{language === 'or' ? 'ମଣ୍ଡି' : 'Mandi'}</span>
      </button>

      {/* Center Floating AI Assistant */}
      <button
        onClick={onOpenAi}
        className="-mt-5 bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 p-3 rounded-full shadow-lg border-2 border-emerald-900 flex flex-col items-center justify-center active:scale-90 transition"
      >
        <Sparkles className="w-5 h-5" />
      </button>

      <button
        onClick={() => onTabChange('rentals')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
          activeTab === 'rentals' ? 'text-amber-400 font-bold' : 'text-emerald-300 opacity-80'
        }`}
      >
        <Tractor className="w-5 h-5 mb-0.5" />
        <span>{language === 'or' ? 'ଭଡ଼ା' : 'Rentals'}</span>
      </button>

      <button
        onClick={() => onTabChange('mandi-rates')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
          activeTab === 'mandi-rates' ? 'text-amber-400 font-bold' : 'text-emerald-300 opacity-80'
        }`}
      >
        <TrendingUp className="w-5 h-5 mb-0.5" />
        <span>{language === 'or' ? 'ଦର' : 'Rates'}</span>
      </button>
    </div>
  );
};
