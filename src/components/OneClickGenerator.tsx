import React, { useState } from 'react';
import { Zap, Sparkles, FileText, Target, Mail, ArrowRight, Save, Calendar, CheckCircle2, AlertCircle, Award } from 'lucide-react';
import { ResumeData, TailoredApplication } from '../types';
import { ResumePdfViewer } from './ResumePdfViewer';
import { CoverLetterView } from './CoverLetterView';
import { PersonalStatementView } from './PersonalStatementView';
import { AtsOptimizerView } from './AtsOptimizerView';

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

        {/* Empty Master Profile Alert Banner */}
        {(!masterProfile.contact.fullName && masterProfile.experience.length === 0) && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Your Master Profile is currently empty.</p>
                <p className="text-amber-800">
                  Add your contact info, work experience, and skills in <strong className="text-amber-950">Master Candidate Profile</strong> or parse your existing resume text for personalized tailoring results.
                </p>
              </div>
            </div>
            {onGoToProfile && (
              <button
                type="button"
                onClick={onGoToProfile}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 transition-colors"
              >
                Set Up Profile →
              </button>
            )}
          </div>
        )}

        {/* Input Form - Single Big Input */}
        <form onSubmit={handleRunTailor} className="space-y-4">
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

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              id="btn-generate-tailored-application"
              disabled={isGenerating || !jobDescription.trim()}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Zap className="w-5 h-5 fill-white text-white" />
              <span>{isGenerating ? 'AI Tailoring Complete Application...' : '1-Click Tailor Resume, Cover Letter & Statement'}</span>
            </button>
          </div>
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
