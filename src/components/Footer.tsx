import React from 'react';
import {
  Zap,
  Briefcase,
  User,
  ShieldCheck,
  ListOrdered,
  Crown,
  ExternalLink,
  Globe,
  Heart
} from 'lucide-react';

export type TabType = 'generator' | 'jobs' | 'profile' | 'ats' | 'tracker' | string;

interface FooterProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMembershipModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  activeTab,
  setActiveTab,
  onOpenMembershipModal
}) => {
  return (
    <footer className="mt-16 bg-slate-900 border-t border-slate-800 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-500/20">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Zap<span className="text-indigo-400">Apply</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated ATS resume tailoring, direct company careers search, and specialist recruitment agency outreach for career advancement.
            </p>
          </div>

          {/* Fast Links: Core Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Fast Links: Tools
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('generator');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'generator' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>1-Click Tailor Studio</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('jobs');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'jobs' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Direct Careers & Agencies</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('profile');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'profile' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Master Profile Vault</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ats');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'ats' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ATS Keyword Optimizer</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('tracker');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'tracker' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Application Pipeline</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Fast Links: Memberships & Plans */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Membership Scheme
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={onOpenMembershipModal}
                  className="hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5 text-left"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Silver (Free Mode) — £0</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenMembershipModal}
                  className="hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5 text-left"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gold Member — £4.99/mo</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenMembershipModal}
                  className="hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5 text-left"
                >
                  <Crown className="w-3.5 h-3.5 text-purple-400" />
                  <span>Platinum VIP — £9.99/mo</span>
                </button>
              </li>
              <li className="pt-1">
                <button
                  type="button"
                  onClick={onOpenMembershipModal}
                  className="text-xs font-black text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                >
                  View Full Plan Comparison &rarr;
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Search Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Job Hunting Resources
            </h4>
            <p className="text-[11.5px] text-slate-400 leading-relaxed">
              Target direct hiring managers and specialized recruitment consultancies to bypass automated ATS filters and secure interviews faster.
            </p>
            <div className="pt-1 flex flex-wrap gap-2">
              <a
                href="https://www.linkedin.com/jobs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
              >
                <span>LinkedIn Jobs</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href="https://uk.indeed.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
              >
                <span>Indeed</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright 2026 developerekene */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span>
              Copyright &copy; 2026{' '}
              <a
                href="https://ekenedilichukwu.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
              >
                developerekene
              </a>
              . All rights reserved.
            </span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span>Built and deployed completely with Google AI Studio</span>
            <span>•</span>
            <a
              href="https://ekenedilichukwu.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 hover:text-white transition-colors"
            >
              <span>Portfolio</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
