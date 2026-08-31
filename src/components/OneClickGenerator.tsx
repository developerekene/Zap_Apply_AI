import React, { useState, useEffect } from 'react';
import {
  Zap,
  Sparkles,
  FileText,
  Target,
  Mail,
  ArrowRight,
  Save,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Award,
  Loader2,
  Search,
  Check
} from 'lucide-react';
import { ResumeData, TailoredApplication } from '../types';
import { ResumePdfViewer } from './ResumePdfViewer';
import { CoverLetterView } from './CoverLetterView';
import { PersonalStatementView } from './PersonalStatementView';
import { AtsOptimizerView } from './AtsOptimizerView';

const GENERATION_STAGES = [
  {
    step: 1,
    title: 'Extracting Job Keywords & Criteria',
    shortLabel: 'Job Analysis',
    desc: 'Scanning requirements, tech stack, and critical qualifications...',
    icon: Search
  },
  {
    step: 2,
    title: 'Matching Candidate Experience & Strengths',
    shortLabel: 'Profile Alignment',
    desc: 'Cross-referencing background with target competencies...',
    icon: Target
  },
  {
    step: 3,
    title: 'Tailoring ATS-Compliant Resume Experience',
    shortLabel: 'Resume Crafting',
    desc: 'Formulating quantifiable XYZ achievements and impact metrics...',
    icon: FileText
  },
  {
    step: 4,
    title: 'Drafting Cover Letter & STAR Statement',
    shortLabel: 'Cover Letter & Pitch',
    desc: 'Writing personalized enthusiasm hook and STAR narrative...',
    icon: Mail
  },
  {
    step: 5,
    title: 'Auditing ATS Match Score & Finalizing',
    shortLabel: 'ATS Audit & Finalize',
    desc: 'Calculating keyword match score and formatting package...',
    icon: Award
  }
];

interface OneClickGeneratorProps {
  masterProfile: ResumeData;
  onGenerateTailoredApp: (payload: {
    jobTitle: string;
    companyName: string;
    jobLocation: string;
    jobDescription: string;
    customPrompt?: string;
  }) => Promise<TailoredApplication | null>;
  isGenerating: boolean;
  activeGeneratedApp: TailoredApplication | null;
  onSaveToTracker: (app: TailoredApplication) => void;
  onOpenCalendarSchedule: (app: TailoredApplication) => void;
  onGoToProfile?: () => void;
  isPro?: boolean;
  freeDownloadsCount?: number;
  onIncrementDownloadCount?: () => void;
  onRequirePro?: () => void;
}

export const OneClickGenerator: React.FC<OneClickGeneratorProps> = ({
  masterProfile,
  onGenerateTailoredApp,
  isGenerating,
  activeGeneratedApp,
  onSaveToTracker,
  onOpenCalendarSchedule,
  onGoToProfile,
  isPro = false,
  freeDownloadsCount = 0,
  onIncrementDownloadCount,
  onRequirePro
}) => {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [outputTab, setOutputTab] = useState<'resume' | 'cover' | 'statement' | 'ats'>('resume');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  // Cycle through generation stages when AI is tailoring
  useEffect(() => {
    if (!isGenerating) {
      setStageIndex(0);
      return;
    }

    setStageIndex(0);

    const timeouts = [
      setTimeout(() => setStageIndex(1), 2200), // Step 2: Matching
      setTimeout(() => setStageIndex(2), 5200), // Step 3: Resume Tailoring
      setTimeout(() => setStageIndex(3), 8800), // Step 4: Cover Letter & Statement
      setTimeout(() => setStageIndex(4), 12500) // Step 5: ATS Scoring & Finalizing
    ];

    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
  }, [isGenerating]);

  const handleClearForm = () => {
    setJobTitle('');
    setCompanyName('');
    setJobLocation('');
    setJobDescription('');
    setCustomPrompt('');
  };

  const handleRunTailor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    if (!masterProfile.contact.fullName.trim() && (!masterProfile.experience || masterProfile.experience.length === 0)) {
      if (confirm('Your Master Candidate Profile is currently empty. Would you like to update your profile with your contact details, experience, and skills first for the best tailoring results?')) {
        if (onGoToProfile) onGoToProfile();
        return;
      }
    }

    const result = await onGenerateTailoredApp({
      jobTitle: jobTitle.trim(),
      companyName: companyName.trim(),
      jobLocation: jobLocation.trim(),
      jobDescription,
      customPrompt
    });

    if (result) {
      setOutputTab('resume');
    }
  };

  const handleSaveApp = () => {
    if (!activeGeneratedApp) return;
    onSaveToTracker(activeGeneratedApp);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const isProfileEmpty =
    !masterProfile?.contact?.fullName?.trim() &&
    (!masterProfile?.experience || masterProfile.experience.length === 0) &&
    !masterProfile?.summary?.trim();

  const isProfileIncomplete =
    !masterProfile?.contact?.fullName?.trim() ||
    !masterProfile?.summary?.trim() ||
    (!masterProfile?.experience || masterProfile.experience.length === 0);

  return (
    <div className="space-y-6">
      {/* Hero Banner & Inputs Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" /> 1-Click Resume, Cover Letter & STAR Personal Statement Engine
            </div>
            <h2 className="text-2xl font-black text-slate-900">Paste Job Posting to Tailor Complete Application</h2>
            <p className="text-sm text-slate-600">
              ZAP Apply analyzes job requirements, extracts essential criteria, and crafts a bespoke ATS-compliant resume, persuasive cover letter, and STAR-formatted personal statement.
            </p>
          </div>

          {(jobTitle || companyName || jobLocation || jobDescription) && (
            <button
              type="button"
              onClick={handleClearForm}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors shrink-0"
            >
              <span>Clear Form</span>
            </button>
          )}
        </div>

        {/* Profile Alert Banner */}
        {isProfileEmpty ? (
          <div className="bg-indigo-50 border-2 border-indigo-200 text-indigo-950 rounded-2xl p-5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-indigo-950">Action Required: Please set up your Master Profile</h4>
                <p className="text-indigo-800 leading-relaxed">
                  Your Master Profile is currently empty. To tailor resumes, cover letters, and statements that accurately match your career, please update your candidate details or upload your CV.
                </p>
              </div>
            </div>
            {onGoToProfile && (
              <button
                type="button"
                id="btn-banner-setup-profile"
                onClick={onGoToProfile}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all whitespace-nowrap cursor-pointer flex items-center justify-center space-x-2 shrink-0"
              >
                <span>Update Master Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : isProfileIncomplete ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-950 rounded-2xl p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start space-x-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">Your Master Profile is missing key sections</p>
                <p className="text-amber-800">
                  Adding your work history, skills, and summary in <strong className="text-amber-950">Master Profile</strong> ensures highest-score ATS tailoring.
                </p>
              </div>
            </div>
            {onGoToProfile && (
              <button
                type="button"
                onClick={onGoToProfile}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer"
              >
                Update Profile →
              </button>
            )}
          </div>
        ) : null}

        {/* Input Form - Single Big Input */}
        <form onSubmit={handleRunTailor} className="space-y-4">
          {/* Profile Status Pill */}
          {isProfileEmpty ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong>Profile Status:</strong> Blank profile. Please update your master profile for accurate tailoring.</span>
              </div>
              {onGoToProfile && (
                <button
                  type="button"
                  onClick={onGoToProfile}
                  className="font-bold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Update Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Master Profile Active:</strong> {masterProfile.contact.fullName || 'Candidate'} ({masterProfile.experience?.length || 0} positions, {masterProfile.skills?.technical?.length || 0} technical skills)
                </span>
              </div>
              {onGoToProfile && (
                <button
                  type="button"
                  onClick={onGoToProfile}
                  className="font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                >
                  Edit Profile
                </button>
              )}
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Paste Job Posting & Details (Job Title, Company & Description)
              </label>
              <span className="text-[11px] text-slate-500 font-semibold">{jobDescription.length} chars</span>
            </div>
            <textarea
              required
              rows={10}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste everything here — the full job posting including company name, job title, responsibilities, tech stack, and key requirements..."
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl p-4 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:outline-none leading-relaxed font-sans shadow-inner transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Custom Tailoring Note (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Emphasize senior lead engineering experience and cloud infrastructure skills"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            {/* Status indicator on the left side of form bottom */}
            {isGenerating ? (
              <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3.5 py-2.5 rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                <span>
                  Stage {stageIndex + 1} of {GENERATION_STAGES.length}: {GENERATION_STAGES[stageIndex].title}...
                </span>
              </div>
            ) : (
              <div className="text-xs text-slate-500 hidden sm:flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Generates ATS Resume + Cover Letter + STAR Statement in seconds</span>
              </div>
            )}

            <button
              type="submit"
              id="btn-generate-tailored-application"
              disabled={isGenerating || !jobDescription.trim()}
              className={`w-full sm:w-auto relative overflow-hidden flex items-center justify-center space-x-2.5 px-6 sm:px-8 py-3.5 rounded-xl text-white font-extrabold text-sm shadow-lg transition-all ${
                isGenerating
                  ? 'bg-slate-900 shadow-indigo-900/30 ring-2 ring-indigo-500/60 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25 transform hover:-translate-y-0.5 cursor-pointer'
              } disabled:opacity-75`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-left sm:text-center">
                    <span className="text-indigo-300 text-[11px] uppercase tracking-wider font-black">
                      Step {stageIndex + 1}/{GENERATION_STAGES.length}
                    </span>
                    <span className="text-white font-bold text-xs sm:text-sm">
                      {GENERATION_STAGES[stageIndex].shortLabel}...
                    </span>
                  </div>
                  {/* Real-time progress line inside the button */}
                  <div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 transition-all duration-700 ease-out"
                    style={{ width: `${((stageIndex + 1) / GENERATION_STAGES.length) * 100}%` }}
                  />
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-white text-white" />
                  <span>Start Generation</span>
                </>
              )}
            </button>
          </div>

          {/* Staged Generation Live Progress Checklist Card */}
          {isGenerating && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                      Tailoring Complete Application Package
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                        {Math.round(((stageIndex + 1) / GENERATION_STAGES.length) * 100)}% Complete
                      </span>
                    </h4>
                    <p className="text-[11px] sm:text-xs text-indigo-200/80">
                      {GENERATION_STAGES[stageIndex].desc}
                    </p>
                  </div>
                </div>

                <div className="text-right hidden md:block">
                  <span className="text-base font-black text-indigo-300">
                    Stage {stageIndex + 1} of {GENERATION_STAGES.length}
                  </span>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {GENERATION_STAGES[stageIndex].shortLabel}
                  </span>
                </div>
              </div>

              {/* Step by step stages */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
                {GENERATION_STAGES.map((st, idx) => {
                  const isDone = idx < stageIndex;
                  const isCurrent = idx === stageIndex;
                  const Icon = st.icon;
                  return (
                    <div
                      key={st.step}
                      className={`p-2.5 rounded-xl border transition-all text-xs flex sm:flex-col items-center sm:items-start space-x-2.5 sm:space-x-0 sm:space-y-1.5 ${
                        isDone
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : isCurrent
                          ? 'bg-indigo-900/80 border-indigo-400 text-white ring-2 ring-indigo-400/50 shadow-md shadow-indigo-950'
                          : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isDone
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isCurrent
                              ? 'bg-indigo-500 text-white'
                              : 'bg-slate-700/50 text-slate-400'
                          }`}
                        >
                          {isDone ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : isCurrent ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          ) : (
                            <Icon className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span className="text-[10px] font-bold opacity-60 hidden sm:inline">0{st.step}</span>
                      </div>
                      <div>
                        <div className="font-bold text-xs leading-snug">
                          {st.shortLabel}
                        </div>
                        <div className="text-[10px] text-slate-300/80 sm:hidden">
                          {isDone ? 'Completed' : isCurrent ? 'Working...' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Generated Application Output View */}
      {activeGeneratedApp && (
        <div className="space-y-4">
          {/* Output Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            {/* View Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setOutputTab('resume')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  outputTab === 'resume'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Tailored ATS Resume</span>
              </button>

              <button
                onClick={() => setOutputTab('cover')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  outputTab === 'cover'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Cover Letter</span>
              </button>

              <button
                onClick={() => setOutputTab('statement')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  outputTab === 'statement'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Personal Statement (STAR)</span>
              </button>

              <button
                onClick={() => setOutputTab('ats')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  outputTab === 'ats'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>ATS Report ({activeGeneratedApp.atsAnalysis.score}%)</span>
              </button>
            </div>

            {/* Quick Actions: Save to Tracker & Schedule Interview */}
            <div className="flex items-center space-x-3">
              {saveSuccessMsg && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Saved to Tracker!
                </span>
              )}

              <button
                id="btn-save-application-tracker"
                onClick={handleSaveApp}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition-colors"
              >
                <Save className="w-4 h-4 text-indigo-600" />
                <span>Save Application</span>
              </button>

              <button
                id="btn-schedule-calendar-event"
                onClick={() => onOpenCalendarSchedule(activeGeneratedApp)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-colors shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Interview / Follow-up</span>
              </button>
            </div>
          </div>

          {/* Active View Display */}
          {outputTab === 'resume' && (
            <ResumePdfViewer
              resumeData={activeGeneratedApp.tailoredResume}
              jobTitle={activeGeneratedApp.jobTitle}
              companyName={activeGeneratedApp.companyName}
              isPro={isPro}
              freeDownloadsCount={freeDownloadsCount}
              onIncrementDownloadCount={onIncrementDownloadCount}
              onRequirePro={onRequirePro}
            />
          )}

          {outputTab === 'cover' && (
            <CoverLetterView
              coverLetterText={activeGeneratedApp.coverLetter}
              companyName={activeGeneratedApp.companyName}
              jobTitle={activeGeneratedApp.jobTitle}
              candidateName={activeGeneratedApp.tailoredResume.contact.fullName}
              contact={activeGeneratedApp.tailoredResume.contact}
              onUpdateText={(newText) => {
                activeGeneratedApp.coverLetter = newText;
              }}
              isPro={isPro}
              onRequirePro={onRequirePro}
            />
          )}

          {outputTab === 'statement' && (
            <PersonalStatementView
              personalStatementText={activeGeneratedApp.personalStatement || ''}
              companyName={activeGeneratedApp.companyName}
              jobTitle={activeGeneratedApp.jobTitle}
              candidateName={activeGeneratedApp.tailoredResume.contact.fullName}
              contact={activeGeneratedApp.tailoredResume.contact}
              onUpdateText={(newText) => {
                activeGeneratedApp.personalStatement = newText;
              }}
              isPro={isPro}
              onRequirePro={onRequirePro}
            />
          )}

          {outputTab === 'ats' && (
            <AtsOptimizerView
              atsAnalysis={activeGeneratedApp.atsAnalysis}
              jobTitle={activeGeneratedApp.jobTitle}
              companyName={activeGeneratedApp.companyName}
              isPro={isPro}
              onRequirePro={onRequirePro}
              onAddKeywordToResume={(kw) => {
                if (!activeGeneratedApp.tailoredResume.skills.technical.includes(kw)) {
                  activeGeneratedApp.tailoredResume.skills.technical.push(kw);
                  alert(`Added "${kw}" to Technical Skills in tailored resume.`);
                }
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
