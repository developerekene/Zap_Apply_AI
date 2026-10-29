import React, { useState, useEffect } from 'react';
import {
  Search,
  Briefcase,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  Filter,
  RefreshCw,
  Building2,
  ArrowRight,
  Shield,
  Crown,
  Lock,
  Globe,
  Mail,
  Phone,
  UserCheck,
  Send,
  Check,
  Compass
} from 'lucide-react';
import { ResumeData, JobMatchItem, RecruitmentAgency, MembershipTier } from '../types';
import { calculateTotalYearsOfExperience } from '../utils/experienceCalculator';

interface JobMatchesViewProps {
  masterProfile: ResumeData;
  membershipTier: MembershipTier;
  onOpenMembershipModal: () => void;
  onTailorForJob: (job: {
    jobTitle: string;
    companyName: string;
    jobLocation: string;
    jobDescription: string;
  }) => void;
}

export const JobMatchesView: React.FC<JobMatchesViewProps> = ({
  masterProfile,
  membershipTier,
  onOpenMembershipModal,
  onTailorForJob
}) => {
  // Derive candidate profile attributes
  const expAudit = calculateTotalYearsOfExperience(masterProfile.experience);
  const detectedTitle =
    masterProfile.experience?.[0]?.role ||
    masterProfile.summary?.match(/^(?:Accomplished|Experienced|Results-driven|Senior|Lead)?\s*([A-Za-z\s]+?)(?:\s+with|\s+specializing|\s+focused|\s+building|$)/i)?.[1]?.trim() ||
    'Software Engineer';
  const detectedLocation = masterProfile.contact.location || 'London, UK';

  // Search & Filter state
  const [searchTitle, setSearchTitle] = useState(detectedTitle);
  const [searchLocation, setSearchLocation] = useState(detectedLocation);
  const [activeTab, setActiveTab] = useState<'direct_company' | 'recruitment_agencies'>('direct_company');
  const [workModeFilter, setWorkModeFilter] = useState<'All' | 'Remote' | 'Hybrid' | 'On-site'>('All');
  const [jobs, setJobs] = useState<JobMatchItem[]>([]);
  const [agencies, setAgencies] = useState<RecruitmentAgency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Global search portals
  const encodedTitle = encodeURIComponent(searchTitle || detectedTitle);
  const encodedLoc = encodeURIComponent(searchLocation || detectedLocation);
  const isUK = /london|uk|united kingdom|manchester|birmingham|edinburgh|bristol|leeds/i.test(searchLocation);

  const globalPortals = {
    directCompanySearch: `https://www.google.com/search?q=${encodeURIComponent(`${searchTitle} careers direct apply hiring ${searchLocation}`)}`,
    recruitmentAgenciesSearch: `https://www.google.com/search?q=${encodeURIComponent(`best ${searchTitle} recruitment agencies headhunters ${searchLocation}`)}`,
    linkedin: `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}&location=${encodedLoc}`,
    indeed: isUK
      ? `https://uk.indeed.com/jobs?q=${encodedTitle}&l=${encodedLoc}`
      : `https://www.indeed.com/jobs?q=${encodedTitle}&l=${encodedLoc}`,
    googleJobs: `https://www.google.com/search?q=${encodeURIComponent(`${searchTitle} jobs in ${searchLocation} apply`)}&ibp=htl;jobs`,
    reed: isUK
      ? `https://www.reed.co.uk/jobs/${encodeURIComponent((searchTitle || 'developer').toLowerCase().replace(/\s+/g, '-'))}-jobs`
      : undefined
  };

  // Perform search
  const fetchMatchingJobs = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gemini/search-matching-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: searchTitle || detectedTitle,
          yearsOfExperience: expAudit.text,
          location: searchLocation || detectedLocation,
          skills: masterProfile.skills.technical,
          keywords: masterProfile.skills.toolsAndFrameworks?.slice(0, 4).join(', ')
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to search matching roles.');
      }

      setJobs(data.data.jobs || []);
      setAgencies(data.data.recruitmentAgencies || []);
    } catch (err: any) {
      console.error('Job search error:', err);
      setErrorMsg(err.message || 'Could not retrieve live job listings.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-search on mount or when profile role changes
  useEffect(() => {
    fetchMatchingJobs();
  }, [detectedTitle, expAudit.text]);

  // Filter jobs by work mode
  const filteredJobs = jobs.filter((job) => {
    if (workModeFilter === 'All') return true;
    return job.workMode === workModeFilter;
  });

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Matching Credentials */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Direct Careers & Headhunter Search</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/15">
              <span>{expAudit.text} Verified Experience</span>
            </span>

            {membershipTier === 'silver' ? (
              <button
                onClick={onOpenMembershipModal}
                className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 hover:bg-amber-400/30 transition-colors cursor-pointer"
              >
                <span>Silver (Free)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950">
                <Crown className="w-3 h-3" />
                <span>{membershipTier.toUpperCase()} Member</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Direct Company Careers & Specialist Recruiters
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Find direct openings on official company career portals and connect directly with top recruitment agencies and headhunters specializing in <strong className="text-white">{detectedTitle}</strong> positions in <strong className="text-white">{detectedLocation}</strong>.
          </p>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Search & Customization Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchMatchingJobs();
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3"
        >
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Role Title (e.g. Senior Frontend Developer)"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="sm:col-span-4 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Location (e.g. London, UK or Remote)"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="sm:col-span-3 flex gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching Web...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Search Roles & Agencies</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* View Mode Tabs: Direct Company Careers vs Recruitment Agencies */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl self-start">
            <button
              type="button"
              onClick={() => setActiveTab('direct_company')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'direct_company'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Direct Company Roles ({filteredJobs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('recruitment_agencies')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'recruitment_agencies'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Specialist Recruitment Agencies ({agencies.length})</span>
            </button>
          </div>

          {/* Quick Direct Web Search Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-bold mr-1 text-[11px]">Direct Portals:</span>
            <a
              href={globalPortals.directCompanySearch}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold text-[11px]"
              title="Search direct company career sites on the web"
            >
              <Globe className="w-3 h-3 text-emerald-600" />
              <span>Company Careers</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            <a
              href={globalPortals.recruitmentAgenciesSearch}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 font-bold text-[11px]"
              title="Search specialist headhunters & recruiters"
            >
              <UserCheck className="w-3 h-3 text-purple-600" />
              <span>Headhunters</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            <a
              href={globalPortals.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold text-[11px]"
            >
              <span>LinkedIn</span>
            </a>

            <a
              href={globalPortals.indeed}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-bold text-[11px]"
            >
              <span>Indeed</span>
            </a>
          </div>
        </div>

        {/* Work Mode Filter (only active on Direct Company view) */}
        {activeTab === 'direct_company' && (
          <div className="flex items-center space-x-1.5 text-xs pt-1">
            <span className="text-slate-500 font-bold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Work Mode:
            </span>
            {(['All', 'Remote', 'Hybrid', 'On-site'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setWorkModeFilter(mode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  workModeFilter === mode
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error notification if any */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={fetchMatchingJobs}
            className="font-bold underline text-rose-700 hover:text-rose-900 cursor-pointer"
          >
            Retry Search
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            Scanning Direct Employer Websites & Recruitment Networks...
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Checking official company career boards and verified headhunters for{' '}
            <span className="font-semibold">{searchTitle}</span> matching{' '}
            <span className="font-semibold">{expAudit.text} experience</span> in {searchLocation}.
          </p>
        </div>
      ) : activeTab === 'direct_company' ? (
        /* DIRECT COMPANY ROLES VIEW */
        filteredJobs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Direct Roles Found Matching Filter</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search title, location, or work mode filter to discover more company openings.
            </p>
            <button
              onClick={() => {
                setWorkModeFilter('All');
                fetchMatchingJobs();
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job, idx) => {
              const directCareersUrl = job.companyCareersUrl || job.applyUrl;

              return (
                <div
                  key={job.id || idx}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        <span>{job.matchScore}% Match</span>
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center space-x-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          <Building2 className="w-3 h-3" />
                          <span>Direct Company</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {job.workMode}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {job.experienceRequired}
                        </span>
                      </div>
                    </div>

                    {/* Title & Company */}
                    <div>
                      <h3 className="text-base font-black text-slate-950 group-hover:text-indigo-600 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-600 mt-0.5 font-medium flex-wrap">
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          {job.company}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                      </div>
                    </div>

                    {/* Compensation & Source */}
                    <div className="flex items-center justify-between text-xs pt-1 pb-1 border-y border-slate-100">
                      <span className="font-extrabold text-indigo-700">
                        {job.salaryRange || 'Competitive Market Rate'}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {job.postedDate || 'Active'} on {job.company} Careers
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {job.description}
                    </p>

                    {/* Skills tags */}
                    {job.matchedSkills && job.matchedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.matchedSkills.map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-semibold border border-slate-200"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions: Direct Company Apply + 1-Click Tailor */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-2">
                      {/* Direct Apply Button */}
                      <a
                        href={directCareersUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer text-center"
                      >
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Apply on Company Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {/* 1-Click Tailor Application */}
                      <button
                        onClick={() => {
                          onTailorForJob({
                            jobTitle: job.title,
                            companyName: job.company,
                            jobLocation: job.location,
                            jobDescription: `${job.title} at ${job.company}\nLocation: ${job.location} (${job.workMode})\nExperience Required: ${job.experienceRequired}\n\nJob Overview:\n${job.description}\n\nRequired Skills: ${job.matchedSkills.join(', ')}`
                          });
                        }}
                        className="inline-flex items-center space-x-1 px-3.5 py-2.5 rounded-xl text-xs font-black bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all cursor-pointer"
                        title="Generate tailored ATS resume, cover letter & STAR statement for this specific role"
                      >
                        <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                        <span className="hidden sm:inline">Tailor with Zap</span>
                      </button>
                    </div>

                    {/* Secondary Direct Portal Links */}
                    {job.portalLinks && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="font-medium text-slate-400">Also on:</span>
                        <div className="flex items-center space-x-2">
                          {job.portalLinks.companySite && (
                            <a
                              href={job.portalLinks.companySite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:underline font-bold"
                            >
                              Careers Portal
                            </a>
                          )}
                          <span>•</span>
                          <a
                            href={job.portalLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-semibold"
                          >
                            LinkedIn
                          </a>
                          <span>•</span>
                          <a
                            href={job.portalLinks.googleJobs}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-700 hover:underline font-semibold"
                          >
                            Google Jobs
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* SPECIALIST RECRUITMENT AGENCIES VIEW */
        agencies.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
            <UserCheck className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Specialist Agencies Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click below to search specialized headhunters and executive recruiters for {searchTitle} in {searchLocation}.
            </p>
            <a
              href={globalPortals.recruitmentAgenciesSearch}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              <span>Search Top Recruitment Firms on Web</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900">
                    Direct Recruiter Outreach
                  </h4>
                  <p className="text-slate-600 text-[11.5px]">
                    These recruitment consultancies place candidates with your exact verified {expAudit.text} experience. Use the direct email templates below to submit your CV.
                  </p>
                </div>
              </div>

              <a
                href={globalPortals.recruitmentAgenciesSearch}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-extrabold hover:bg-slate-50 transition-colors shrink-0 flex items-center space-x-1"
              >
                <span>Find More Agencies</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agencies.map((agency, idx) => {
                const outreachMailto = `mailto:${agency.contactEmail}?subject=${encodeURIComponent(`Candidate Inquiry: ${searchTitle} (${expAudit.text} Experience)`)}&body=${encodeURIComponent(
                  `Dear ${agency.name} Recruitment Team,\n\nI am contacting you directly regarding ${searchTitle} opportunities. I bring ${expAudit.text} of verified professional experience in ${searchLocation}.\n\nCore Competencies:\n- ${masterProfile.skills.technical.slice(0, 5).join('\n- ')}\n\nI have attached my tailored ATS CV for your review and would appreciate a brief discussion regarding active or upcoming roles with your client organizations.\n\nBest regards,\n${masterProfile.contact.fullName || 'Candidate'}\n${masterProfile.contact.phone || ''}\n${masterProfile.contact.email || ''}`
                )}`;

                return (
                  <div
                    key={agency.id || idx}
                    className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified Recruitment Partner</span>
                          </span>
                          <h3 className="text-base font-black text-slate-950">
                            {agency.name}
                          </h3>
                        </div>

                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 shrink-0">
                          <MapPin className="w-3 h-3" />
                          {agency.location}
                        </span>
                      </div>

                      {/* Specialization Badge */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs space-y-1">
                        <span className="font-extrabold text-indigo-700 block text-[11px] uppercase tracking-wider">
                          Specialization Focus
                        </span>
                        <p className="text-slate-800 font-medium">
                          {agency.specialization}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {agency.description}
                      </p>

                      {/* Placed Roles */}
                      {agency.rolesTypicallyPlaced && agency.rolesTypicallyPlaced.length > 0 && (
                        <div className="text-xs space-y-1">
                          <span className="text-[11px] font-bold text-slate-500">
                            Common Roles Placed:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {agency.rolesTypicallyPlaced.map((r, rIdx) => (
                              <span
                                key={rIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Outreach Tip */}
                      {agency.directOutreachTip && (
                        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 text-[11.5px] text-amber-900 flex items-start space-x-2">
                          <Compass className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                          <span><strong>Direct Tip:</strong> {agency.directOutreachTip}</span>
                        </div>
                      )}
                    </div>

                    {/* Agency Contact & Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Direct Email Candidate Intro */}
                        <a
                          href={outreachMailto}
                          className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Direct Email Intro</span>
                        </a>

                        {/* Agency Website / CV Upload */}
                        <a
                          href={agency.contactUrl || agency.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Agency Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Recruiter Contact Details Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                        {agency.contactEmail && (
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(agency.contactEmail!)}
                            className="inline-flex items-center space-x-1 text-slate-600 hover:text-indigo-600 cursor-pointer"
                            title="Copy email to clipboard"
                          >
                            <Mail className="w-3 h-3" />
                            <span>{agency.contactEmail}</span>
                            {copiedEmail === agency.contactEmail ? (
                              <Check className="w-3 h-3 text-emerald-600 ml-1" />
                            ) : null}
                          </button>
                        )}

                        {agency.contactPhone && (
                          <a
                            href={`tel:${agency.contactPhone}`}
                            className="inline-flex items-center space-x-1 text-slate-600 hover:text-indigo-600"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{agency.contactPhone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* Upgrade Banner for Silver Members */}
      {membershipTier === 'silver' && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-white/30 text-slate-950">
              <Crown className="w-3.5 h-3.5" />
              <span>Unlock Unlimited Roles & Recruiter Outreach</span>
            </div>
            <h4 className="text-lg font-black text-slate-950">
              Want unlimited direct company openings & automated recruiter emails?
            </h4>
            <p className="text-xs text-slate-900/80 font-medium max-w-xl">
              Upgrade to Gold (£4.99/mo) or Platinum (£9.99/mo) to unlock unlimited ATS CV tailoring, personalized recruiter messages, and direct STAR interview prep.
            </p>
          </div>
          <button
            onClick={onOpenMembershipModal}
            className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs shadow-md transition-all cursor-pointer shrink-0"
          >
            Upgrade Membership
          </button>
        </div>
      )}
    </div>
  );
};
