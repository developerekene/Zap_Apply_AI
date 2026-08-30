import React, { useState, useRef, useEffect } from 'react';
import {
  Zap,
  FileText,
  Target,
  Calendar,
  CheckCircle2,
  CalendarPlus,
  Sparkles,
  ChevronDown,
  Layers,
  Crown,
  Lock
} from 'lucide-react';
import { GoogleUserInfo } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  googleUser: GoogleUserInfo | null;
  googleToken: string | null;
  onConnectGoogle: () => void;
  isConnectingGoogle: boolean;
  totalApplicationsCount: number;
  upcomingInterviewsCount: number;
  isPro?: boolean;
  onOpenUpgradeModal?: () => void;
  profileEmail?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  googleUser,
  googleToken,
  onConnectGoogle,
  isConnectingGoogle,
  totalApplicationsCount,
  upcomingInterviewsCount,
  isPro = false,
  onOpenUpgradeModal,
  profileEmail = ''
}) => {
  const [activeDropdown, setActiveDropdown] = useState<'resume' | 'apps' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isResumeActive = activeTab === 'profile' || activeTab === 'ats';
  const isAppsActive = activeTab === 'tracker';

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={navRef}>
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => handleSelectTab('generator')}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Zap<span className="text-indigo-600">.AI</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Automated ATS Resume Tailoring & Job Hunt Hub</p>
            </div>
          </div>

          {/* Grouped Desktop Navigation Dropdowns */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {/* Direct Primary Action: Tailor Studio */}
            <button
              id="nav-tab-generator"
              onClick={() => handleSelectTab('generator')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'generator'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Zap className={`w-4 h-4 ${activeTab === 'generator' ? 'text-white' : 'text-indigo-600'}`} />
              <span>Tailor Studio</span>
            </button>

            {/* Dropdown 1: Resume & ATS Tools */}
            <div className="relative">
              <button
                id="nav-dropdown-resume"
                onClick={() => setActiveDropdown(activeDropdown === 'resume' ? null : 'resume')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isResumeActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : activeDropdown === 'resume'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className={`w-4 h-4 ${isResumeActive ? 'text-white' : 'text-slate-500'}`} />
                <span>Resume Tools</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'resume' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'resume' && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Resume Management
                  </div>

                  <button
                    id="nav-item-profile"
                    onClick={() => handleSelectTab('profile')}
                    className={`w-full flex items-start space-x-3 px-3 py-2.5 hover:bg-slate-50 text-left transition-colors ${
                      activeTab === 'profile' ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : ''
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Master Resume & Profile</div>
                      <div className="text-xs text-slate-500">Edit experience, skills & strengths repository</div>
                    </div>
                  </button>

                  <button
                    id="nav-item-ats"
                    onClick={() => handleSelectTab('ats')}
                    className={`w-full flex items-start space-x-3 px-3 py-2.5 hover:bg-slate-50 text-left transition-colors ${
                      activeTab === 'ats' ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : ''
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">ATS Keyword Optimizer</div>
                      <div className="text-xs text-slate-500">Analyze job descriptions & gap keywords</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Dropdown 2: Applications & Interview Tracker */}
            <div className="relative">
              <button
                id="nav-dropdown-apps"
                onClick={() => setActiveDropdown(activeDropdown === 'apps' ? null : 'apps')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isAppsActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : activeDropdown === 'apps'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Calendar className={`w-4 h-4 ${isAppsActive ? 'text-white' : 'text-slate-500'}`} />
                <span>Tracker & Hub</span>
                {upcomingInterviewsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs bg-indigo-600 text-white font-bold">
                    {upcomingInterviewsCount}
                  </span>
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'apps' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'apps' && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Job Application Management
                  </div>

                  <button
                    id="nav-item-tracker"
                    onClick={() => handleSelectTab('tracker')}
                    className={`w-full flex items-start space-x-3 px-3 py-2.5 hover:bg-slate-50 text-left transition-colors ${
                      activeTab === 'tracker' ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : ''
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 mt-0.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">Application Tracker</span>
                        {totalApplicationsCount > 0 && (
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                            {totalApplicationsCount}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">Track applications, interviews & follow-ups</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Pro Status / Upgrade & Google Calendar Auth */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Pro Badge or Upgrade CTA */}
            {isPro ? (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-extrabold text-xs shadow-xs">
                <Crown className="w-3.5 h-3.5 fill-white text-white" />
                <span className="hidden sm:inline">PRO ACTIVE</span>
                <span className="sm:hidden">PRO</span>
              </div>
            ) : (
              <button
                onClick={onOpenUpgradeModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
                <span>Upgrade Pro</span>
              </button>
            )}

            {googleToken ? (
              <div
                className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-800"
                title={`Google Calendar connected with ${profileEmail || 'your profile'}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden lg:inline font-semibold">Calendar: {profileEmail || 'Active'}</span>
                <span className="lg:hidden">Calendar Linked</span>
              </div>
            ) : (
              <button
                id="btn-connect-google-calendar"
                onClick={onConnectGoogle}
                disabled={isConnectingGoogle}
                className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                title={`Connect Google Calendar using ${profileEmail || 'your email'}`}
              >
                <CalendarPlus className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">{isConnectingGoogle ? 'Connecting...' : 'Connect Calendar'}</span>
                <span className="sm:hidden">Connect</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden border-t border-slate-200 py-2 items-center justify-around bg-white">
          <button
            onClick={() => handleSelectTab('generator')}
            className={`flex flex-col items-center px-2 py-1 rounded-md text-xs font-medium ${
              activeTab === 'generator' ? 'text-indigo-600 font-bold' : 'text-slate-600'
            }`}
          >
            <Zap className="w-4 h-4 mb-0.5" />
            <span>Tailor</span>
          </button>

          <button
            onClick={() => handleSelectTab('profile')}
            className={`flex flex-col items-center px-2 py-1 rounded-md text-xs font-medium ${
              activeTab === 'profile' ? 'text-indigo-600 font-bold' : 'text-slate-600'
            }`}
          >
            <FileText className="w-4 h-4 mb-0.5" />
            <span>Master Profile</span>
          </button>

          <button
            onClick={() => handleSelectTab('ats')}
            className={`flex flex-col items-center px-2 py-1 rounded-md text-xs font-medium ${
              activeTab === 'ats' ? 'text-indigo-600 font-bold' : 'text-slate-600'
            }`}
          >
            <Target className="w-4 h-4 mb-0.5" />
            <span>ATS Match</span>
          </button>

          <button
            onClick={() => handleSelectTab('tracker')}
            className={`flex flex-col items-center px-2 py-1 rounded-md text-xs font-medium ${
              activeTab === 'tracker' ? 'text-indigo-600 font-bold' : 'text-slate-600'
            }`}
          >
            <Calendar className="w-4 h-4 mb-0.5" />
            <span>Tracker</span>
          </button>
        </div>
      </div>
    </header>
  );
};
