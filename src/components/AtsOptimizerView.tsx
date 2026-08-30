import React from 'react';
import { Target, CheckCircle2, AlertTriangle, Sparkles, TrendingUp, ShieldCheck, Lock, ArrowRight, Crown } from 'lucide-react';
import { AtsAnalysis } from '../types';

interface AtsOptimizerViewProps {
  atsAnalysis: AtsAnalysis;
  jobTitle?: string;
  companyName?: string;
  onAddKeywordToResume?: (keyword: string) => void;
  isPro?: boolean;
  onRequirePro?: () => void;
}

export const AtsOptimizerView: React.FC<AtsOptimizerViewProps> = ({
  atsAnalysis,
  jobTitle,
  companyName,
  onAddKeywordToResume,
  isPro = false,
  onRequirePro
}) => {
  const score = atsAnalysis.score || 0;

  // Determine score color
  const getScoreColor = (s: number) => {
    if (s >= 85) return 'text-emerald-700 border-emerald-200 bg-emerald-50';
    if (s >= 70) return 'text-amber-700 border-amber-200 bg-amber-50';
    return 'text-rose-700 border-rose-200 bg-rose-50';
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> ATS Compatibility Report
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {jobTitle ? `${jobTitle} at ${companyName || 'Target Company'}` : 'Job Description Keyword Alignment'}
            </h2>
            <p className="text-sm text-slate-600 max-w-xl">
              Analyzed against leading ATS algorithms (Workday, Greenhouse, Lever, Taleo) for keyword density, formatting compliance, and impact metrics.
            </p>
          </div>

          {/* Large Overall Score Meter */}
          <div className="flex items-center space-x-6">
            <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border ${getScoreColor(score)} min-w-[150px]`}>
              <span className="text-4xl font-black tracking-tight">{score}%</span>
              <span className="text-xs uppercase font-bold tracking-wider opacity-80 mt-1">ATS Match Score</span>
            </div>

            <div className="hidden sm:grid grid-cols-1 gap-2 text-xs">
              <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex justify-between gap-4">
                <span className="text-slate-600 font-medium">Formatting Integrity:</span>
                <span className="font-bold text-emerald-600">{atsAnalysis.formattingScore}%</span>
              </div>
              <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex justify-between gap-4">
                <span className="text-slate-600 font-medium">Impact Verbs & Metrics:</span>
                <span className="font-bold text-indigo-600">{atsAnalysis.impactScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Keywords */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Matched Keywords ({atsAnalysis.matchedKeywords?.length || 0})</h3>
            </div>
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
              Found in Resume
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {atsAnalysis.matchedKeywords?.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{kw}</span>
              </span>
            ))}
            {(!atsAnalysis.matchedKeywords || atsAnalysis.matchedKeywords.length === 0) && (
              <p className="text-xs text-slate-500">No key matches detected.</p>
            )}
          </div>
        </div>

        {/* Missing Keywords (Pro Gated) */}
        <div className="relative bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Missing Critical Terms ({atsAnalysis.missingKeywords?.length || 0})</h3>
            </div>
            {!isPro ? (
              <span className="text-[10px] font-extrabold uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3 text-indigo-600" /> PRO FEATURE
              </span>
            ) : (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-semibold">
                High Impact
              </span>
            )}
          </div>

          <div className={`flex flex-wrap gap-2 pt-1 ${!isPro ? 'select-none blur-xs opacity-40 pointer-events-none' : ''}`}>
            {(atsAnalysis.missingKeywords && atsAnalysis.missingKeywords.length > 0
              ? atsAnalysis.missingKeywords
              : ['Senior Leadership', 'TypeScript Architecture', 'Cross-Functional Strategy', 'CI/CD Pipelines', 'Performance Metrics']
            ).map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200"
              >
                <span>{kw}</span>
                {isPro && onAddKeywordToResume && (
                  <button
                    onClick={() => onAddKeywordToResume(kw)}
                    className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded hover:bg-indigo-700 transition-colors"
                  >
                    + Add
                  </button>
                )}
              </span>
            ))}
          </div>

          {!isPro && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center text-white z-10">
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg mb-2">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-extrabold">Exact Missing Keywords Locked</h4>
              <p className="text-xs text-slate-200 max-w-xs mt-1 mb-3">
                See the exact terms missing from your resume to pass ATS automated screening.
              </p>
              <button
                onClick={onRequirePro}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-1.5"
              >
                <Crown className="w-3.5 h-3.5 fill-white text-white" />
                <span>Unlock Missing Keywords</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ATS Parser Standard Checks & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Compliance Checklist */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">ATS Parsing Compliance Verification</h3>
          </div>

          <div className="space-y-3">
            {atsAnalysis.atsComplianceChecks?.map((chk, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-start space-x-3">
                {chk.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{chk.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{chk.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Actionable Recommendations (Pro Gated) */}
        <div className="relative bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Optimization Tips</h3>
            </div>
            {!isPro && (
              <span className="text-[10px] font-extrabold uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3 text-indigo-600" /> PRO
              </span>
            )}
          </div>

          <ul className={`space-y-2.5 text-xs text-slate-700 ${!isPro ? 'select-none blur-xs opacity-40 pointer-events-none' : ''}`}>
            {(atsAnalysis.keyRecommendations && atsAnalysis.keyRecommendations.length > 0
              ? atsAnalysis.keyRecommendations
              : [
                  'Incorporate quantifiable achievements in recent roles',
                  'Align job titles with target advert keywords',
                  'Add missing technical tools to skill section'
                ]
            ).map((rec, rIdx) => (
              <li key={rIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start space-x-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>

          {!isPro && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center text-white z-10">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md mb-2">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-extrabold">Actionable Insights Locked</h4>
              <button
                onClick={onRequirePro}
                className="mt-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] shadow-sm transition-all"
              >
                Upgrade to View Tips
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
