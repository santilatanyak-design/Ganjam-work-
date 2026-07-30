import React from 'react';
import { Language, ActiveTab, UserProfile } from '../types';
import { translations } from '../data/translations';
import { 
  Wrench, 
  Sprout, 
  Tractor, 
  TrendingUp, 
  Globe, 
  UserCheck, 
  Sparkles, 
  ShoppingBag, 
  PhoneCall,
  Search,
  MapPin,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { ganjamTehsils } from '../data/mockData';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  user: UserProfile;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenAi: () => void;
  onOpenBookings: () => void;
  bookingCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTehsil: string;
  onTehsilChange: (tehsil: string) => void;
  onOpenRegisterWorker: () => void;
  onOpenAddProduce: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  activeTab,
  onTabChange,
  user,
  onOpenAuth,
  onOpenAdmin,
  onOpenAi,
  onOpenBookings,
  bookingCount,
  searchQuery,
  onSearchChange,
  selectedTehsil,
  onTehsilChange,
  onOpenRegisterWorker,
  onOpenAddProduce
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 text-white shadow-md border-b border-emerald-800">
      {/* Top Banner Bar */}
      <div className="bg-emerald-950 py-1.5 px-4 text-xs font-medium text-emerald-200 flex flex-wrap justify-between items-center gap-2 border-b border-emerald-800/50">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
            {t.districtBadge}
          </span>
          <span className="hidden sm:inline opacity-90">
            {language === 'or' 
              ? 'ଗଞ୍ଜାମ ଜିଲ୍ଲାର ସମସ୍ତ ବ୍ଲକ୍, ହାଟ ଓ ସହର ପାଇଁ ସ୍ଥାନୀୟ ପ୍ଲାଟଫର୍ମ' 
              : 'Direct service booking & farmer mandi platform for Ganjam, Odisha'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Admin Panel Button in top bar */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1 text-amber-300 hover:text-white font-bold transition-colors bg-emerald-900 px-2.5 py-0.5 rounded-full border border-amber-400/40"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Control Panel</span>
          </button>

          {/* Quick Helpline */}
          <a 
            href="tel:+911800123456" 
            className="hidden md:flex items-center gap-1 text-emerald-300 hover:text-white transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'or' ? 'ସାହାଯ୍ୟ: ୧୮୦୦-୧୨୩-୪୫୬' : 'Helpline: 1800-123-456'}</span>
          </a>

          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(language === 'en' ? 'or' : 'en')}
            className="flex items-center gap-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-600 transition"
            title="Switch Language / ଭାଷା ବଦଳାନ୍ତୁ"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="text-xs">{language === 'en' ? 'ଓଡ଼ିଆ' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('services')}>
          <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 rounded-xl flex items-center justify-center font-black shadow-lg shadow-amber-500/20 text-xl border border-amber-300">
            G
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>{t.appTitle}</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                {language === 'or' ? 'ସେବା ଓ ମଣ୍ଡି' : 'HUB'}
              </span>
            </h1>
            <p className="text-xs text-emerald-200 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action Buttons: AI Assistant, Add Worker/Produce, Login */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* AI Assistant Button */}
          <button
            onClick={onOpenAi}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg shadow-sm text-xs sm:text-sm transition-all transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-emerald-950 animate-pulse" />
            <span>{t.aiAssistantBtn}</span>
          </button>

          {/* Bookings / Orders Drawer Toggle */}
          <button
            onClick={onOpenBookings}
            className="relative flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs sm:text-sm border border-emerald-600 transition"
          >
            <ShoppingBag className="w-4 h-4 text-amber-300" />
            <span className="hidden md:inline">{t.myBookings}</span>
            {bookingCount > 0 && (
              <span className="bg-amber-400 text-slate-950 font-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {bookingCount}
              </span>
            )}
          </button>

          {/* Admin Quick Launch or User Auth Button */}
          {user.isAdmin ? (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-xs sm:text-sm shadow-md transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-100 font-medium px-3 py-1.5 rounded-lg text-xs sm:text-sm border border-emerald-700 transition"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>{user.isLoggedIn ? user.name || user.phone : t.loginBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-emerald-950/80 backdrop-blur-sm border-t border-emerald-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Hub Nav Buttons */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => onTabChange('services')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeTab === 'services'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>{t.navServices}</span>
            </button>

            <button
              onClick={() => onTabChange('mandi')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeTab === 'mandi'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>{t.navMandi}</span>
            </button>

            <button
              onClick={() => onTabChange('rentals')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeTab === 'rentals'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <Tractor className="w-4 h-4" />
              <span>{t.navRentals}</span>
            </button>

            <button
              onClick={() => onTabChange('mandi-rates')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeTab === 'mandi-rates'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{t.navMandiRates}</span>
            </button>
          </nav>

          {/* Right side Context Add Buttons */}
          <div className="flex items-center gap-2">
            {activeTab === 'services' && (
              <button
                onClick={onOpenRegisterWorker}
                className="bg-emerald-700 hover:bg-emerald-600 text-emerald-50 font-semibold px-3 py-1 rounded-md text-xs border border-emerald-500/50 whitespace-nowrap"
              >
                {t.addService}
              </button>
            )}

            {(activeTab === 'mandi' || activeTab === 'rentals') && (
              <button
                onClick={onOpenAddProduce}
                className="bg-emerald-700 hover:bg-emerald-600 text-emerald-50 font-semibold px-3 py-1 rounded-md text-xs border border-emerald-500/50 whitespace-nowrap"
              >
                {t.addProduce}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="bg-emerald-900 border-t border-emerald-800 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-2.5">
          {/* Location / Tehsil Selector */}
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedTehsil}
              onChange={(e) => onTehsilChange(e.target.value)}
              className="w-full bg-emerald-950 text-white pl-9 pr-8 py-1.5 rounded-lg text-xs font-medium border border-emerald-700 focus:outline-none focus:ring-2 focus:ring-amber-400 appearance-none cursor-pointer"
            >
              <option value="">{t.allGanjam}</option>
              {ganjamTehsils.map((tehsil) => (
                <option key={tehsil} value={tehsil}>
                  {tehsil} Tehsil / Block
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full flex-grow">
            <Search className="w-4 h-4 text-emerald-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-emerald-950 text-white pl-9 pr-8 py-1.5 rounded-lg text-xs sm:text-sm border border-emerald-700 placeholder-emerald-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
