import React, { useState, useRef, useEffect } from 'react';
import {
  Zap,
  FileText,
  Target,
  Layers,
  ChevronDown,
  Menu,
  X,
  Briefcase,
  Crown,
  Sparkles
} from 'lucide-react';
import { MembershipTier } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalApplicationsCount: number;
  membershipTier: MembershipTier;
  onOpenMembershipModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalApplicationsCount,
  membershipTier,
  onOpenMembershipModal
}) => {
  const [activeDropdown, setActiveDropdown] = useState<'resume' | null>(null);
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

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    {
      id: 'generator',
      label: 'Tailor Studio',
      shortLabel: 'Tailor',
      description: '1-Click ATS Resume & Cover Letter Generator',
      icon: Zap
    },
    {
      id: 'jobs',
      label: 'Job Matches',
      shortLabel: 'Jobs',
      description: 'AI Web Search for Matching Roles with Apply Links',
      icon: Briefcase
    },
    {
      id: 'profile',
      label: 'Master Profile',
      shortLabel: 'Profile',
      description: 'Resume Experience, Skills & Strength Vault',
      icon: FileText
    },
    {
      id: 'ats',
      label: 'ATS Keyword Match',
      shortLabel: 'ATS Match',
      description: 'Job Description Match & Gap Analyzer',
      icon: Target
    },
    {
      id: 'tracker',
      label: 'Application Tracker',
      shortLabel: 'Tracker',
      description: 'Job Application Pipeline & Status Management',
      icon: Layers
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={navRef}>
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-2.5">
            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              className="flex items-center space-x-2.5 cursor-pointer select-none"
              onClick={() => handleSelectTab('generator')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
                <Zap className="w-5 h-5 fill-white text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                    Zap<span className="text-indigo-600">.AI</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Automated ATS Resume Tailoring & Job Hunt Hub</p>
              </div>
            </div>
          </div>

          {/* Grouped Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {/* Direct Primary Action: Tailor Studio */}
            <button
              id="nav-tab-generator"
              onClick={() => handleSelectTab('generator')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Zap className={`w-4 h-4 ${activeTab === 'generator' ? 'text-white' : 'text-indigo-600'}`} />
              <span>Tailor Studio</span>
            </button>

            {/* Direct Primary Action: Job Matches */}
            <button
              id="nav-tab-jobs"
              onClick={() => handleSelectTab('jobs')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase className={`w-4 h-4 ${activeTab === 'jobs' ? 'text-white' : 'text-slate-500'}`} />
              <span>Job Matches</span>
            </button>

            {/* Dropdown 1: Resume & ATS Tools */}
            <div className="relative">
              <button
                id="nav-dropdown-resume"
                onClick={() => setActiveDropdown(activeDropdown === 'resume' ? null : 'resume')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
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
                    className={`w-full flex items-start space-x-3 px-3 py-2.5 hover:bg-slate-50 text-left transition-colors cursor-pointer ${
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
                    className={`w-full flex items-start space-x-3 px-3 py-2.5 hover:bg-slate-50 text-left transition-colors cursor-pointer ${
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

            {/* Direct Tracker Link */}
            <button
              id="nav-tab-tracker"
              onClick={() => handleSelectTab('tracker')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'tracker'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className={`w-4 h-4 ${activeTab === 'tracker' ? 'text-white' : 'text-slate-500'}`} />
              <span>Application Tracker</span>
              {totalApplicationsCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'tracker' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {totalApplicationsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action: Membership Scheme Badge & Button */}
          <div className="flex items-center space-x-2">
            {membershipTier === 'platinum' ? (
              <button
                type="button"
                id="btn-membership-badge"
                onClick={onOpenMembershipModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-extrabold text-xs shadow-sm hover:opacity-95 transition-all cursor-pointer"
                title="Manage Platinum VIP Membership"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>Platinum VIP (£9.99)</span>
              </button>
            ) : membershipTier === 'gold' ? (
              <button
                type="button"
                id="btn-membership-badge"
                onClick={onOpenMembershipModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs shadow-sm hover:opacity-95 transition-all cursor-pointer"
                title="Manage Gold Membership"
              >
                <Crown className="w-3.5 h-3.5 text-slate-950" />
                <span>Gold Member (£4.99)</span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-membership-badge"
                onClick={onOpenMembershipModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer group"
                title="View Membership Plans"
              >
                <span className="text-slate-300 font-semibold">Silver (Free)</span>
                <span className="w-1 h-1 rounded-full bg-slate-500" />
                <span className="text-amber-300 group-hover:text-amber-200">Upgrade</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Expandable Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-1 bg-white animate-in slide-in-from-top-2 duration-200">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigate Zap.AI Hub
            </div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleSelectTab(link.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60 shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{link.label}</div>
                      <div className="text-xs text-slate-500">{link.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Mobile Membership Button */}
            <div className="pt-2 px-3">
              <button
                type="button"
                onClick={() => {
                  onOpenMembershipModal();
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs cursor-pointer ${
                  membershipTier === 'platinum'
                    ? 'bg-purple-700 text-white'
                    : membershipTier === 'gold'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-900 text-white'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>
                  {membershipTier === 'platinum'
                    ? 'Platinum VIP Active (£9.99/mo)'
                    : membershipTier === 'gold'
                    ? 'Gold Member Active (£4.99/mo)'
                    : 'Silver (Free Mode) — Upgrade'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Persistent Bottom Tab Bar with ALL Navigation Links */}
        <div className="flex md:hidden border-t border-slate-200 py-1.5 items-center justify-around bg-white">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleSelectTab(link.id)}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                  isActive ? 'text-indigo-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 leading-none">{link.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
