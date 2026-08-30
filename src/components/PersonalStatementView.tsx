import React, { useState } from 'react';
import { Copy, Check, Download, FileText, Sparkles, CheckCircle2, Award, Lock, Crown, ArrowRight, Zap } from 'lucide-react';
import jsPDF from 'jspdf';
import { ContactInfo } from '../types';

interface PersonalStatementViewProps {
  personalStatementText: string;
  companyName?: string;
  jobTitle?: string;
  candidateName?: string;
  contact?: ContactInfo;
  onUpdateText: (newText: string) => void;
  isPro?: boolean;
  onRequirePro?: () => void;
}

export const PersonalStatementView: React.FC<PersonalStatementViewProps> = ({
  personalStatementText,
  companyName = '',
  jobTitle = 'Target Role',
  candidateName = 'Candidate',
  contact,
  onUpdateText,
  isPro = false,
  onRequirePro
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Clean company name
  const isInvalidCompany = !companyName || ['target company', 'hiring company', 'n/a', 'unknown'].includes(companyName.trim().toLowerCase());
  const displayCompanyName = isInvalidCompany ? '' : companyName.trim();

  // Clean string from any accidental "Target Company"
  const sanitizedText = (personalStatementText || '').replace(/Target Company/gi, displayCompanyName || 'the organization');

  // Build full text with candidate contact details
  const getFormattedStatementText = () => {
    let body = sanitizedText.trim();
    if (!contact) return body;

    const hasPhone = contact.phone && body.toLowerCase().includes(contact.phone.toLowerCase());
    const hasAddress = contact.address && body.toLowerCase().includes(contact.address.toLowerCase());

    if (hasPhone || hasAddress) {
      return body;
    }

    const headerLines: string[] = [];
    if (contact.fullName) headerLines.push(contact.fullName);
    if (contact.address) headerLines.push(contact.address);

    const locationParts = [contact.postCode, contact.location, contact.country].filter(Boolean);
    if (locationParts.length > 0) headerLines.push(locationParts.join(', '));

    const contactParts = [];
    if (contact.phone) contactParts.push(`Phone: ${contact.phone}`);
    if (contact.email) contactParts.push(`Email: ${contact.email}`);
    if (contactParts.length > 0) headerLines.push(contactParts.join(' | '));

    if (headerLines.length === 0) return body;

    if (contact.fullName && body.startsWith(contact.fullName)) {
      return body;
    }

    return `${headerLines.join('\n')}\n\n${body}`;
  };

  const finalFormattedStatement = getFormattedStatementText();

  const handleCopy = () => {
    if (!isPro) {
      if (onRequirePro) onRequirePro();
      return;
    }
    navigator.clipboard.writeText(finalFormattedStatement);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    if (!isPro) {
      if (onRequirePro) onRequirePro();
      return;
    }
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxLineY = pageHeight - margin;

    const lines = doc.splitTextToSize(finalFormattedStatement, pageWidth);
    let y = 20;

    lines.forEach((line: string) => {
      if (y > maxLineY) {
        doc.addPage();
        y = 20;
      }
      // Highlight main headings
      if (line.match(/^(Criterion|Essential Skill|Requirement|STATEMENT|STAR|S -|T -|A -|R -|[A-Z\s]{4,}:)/i)) {
        doc.setFont('Helvetica', 'bold');
      } else {
        doc.setFont('Helvetica', 'normal');
      }
      doc.text(line, margin, y);
      y += 5.5;
    });

    const safeName = (candidateName || 'Candidate').replace(/\s+/g, '_');
    const safeCompany = displayCompanyName ? displayCompanyName.replace(/\s+/g, '_') : 'Tailored';
    doc.save(`${safeName}_Personal_Statement_${safeCompany}.pdf`);
  };

  // Helper to render STAR enhanced elements when viewing
  const renderFormattedParagraph = (paragraph: string, idx: number) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return null;

    // Heading detect
    if (/^(Criterion|Essential Skill|Requirement|Key Competency|1\.|2\.|3\.|4\.|5\.|Section|\#\#)/i.test(trimmed)) {
      return (
        <div key={idx} className="mt-6 mb-3 pt-3 border-t border-slate-200">
          <h4 className="text-sm font-black text-slate-900 tracking-wide flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600 shrink-0" />
            {trimmed.replace(/^[\#\s]+/, '')}
          </h4>
        </div>
      );
    }

    // Detect STAR tags
    const isSituation = /^(\*?\s*Situation|\(?S\)?\s*[\:-])/i.test(trimmed);
    const isTask = /^(\*?\s*Task|\(?T\)?\s*[\:-])/i.test(trimmed);
    const isAction = /^(\*?\s*Action|\(?A\)?\s*[\:-])/i.test(trimmed);
    const isResult = /^(\*?\s*Result|\(?R\)?\s*[\:-])/i.test(trimmed);

    if (isSituation || isTask || isAction || isResult) {
      let badgeLabel = 'S';
      let badgeStyle = 'bg-sky-100 text-sky-800 border-sky-300';
      if (isSituation) { badgeLabel = 'S — Situation'; badgeStyle = 'bg-sky-50 text-sky-800 border-sky-200'; }
      if (isTask) { badgeLabel = 'T — Task'; badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200'; }
      if (isAction) { badgeLabel = 'A — Action'; badgeStyle = 'bg-indigo-50 text-indigo-800 border-indigo-200'; }
      if (isResult) { badgeLabel = 'R — Result'; badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200'; }

      return (
        <div key={idx} className={`p-3 rounded-xl border ${badgeStyle} my-2 text-xs leading-relaxed`}>
          <div className="font-extrabold uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {badgeLabel}
          </div>
          <div className="text-slate-800">{trimmed}</div>
        </div>
      );
    }

    return (
      <p key={idx} className="mb-3 text-slate-800 leading-relaxed text-xs">
        {trimmed}
      </p>
    );
  };

  const paragraphs = finalFormattedStatement.split('\n');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Personal Statement (STAR Format)
            </h3>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-indigo-600" /> Essential Skills Criteria Mapped
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrates evidence for all essential criteria using Situation, Task, Action, and Result methodology.
          </p>
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
          >
            {isEditing ? 'Done Editing' : 'Edit Text'}
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
            title="Copy Statement Text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-6 sm:p-8 font-sans text-xs shadow-xs min-h-[350px] overflow-hidden">
        {/* Rendered content */}
        <div className={`space-y-1 ${!isPro ? 'select-none blur-xs opacity-30 pointer-events-none' : ''}`}>
          {isEditing ? (
            <textarea
              value={finalFormattedStatement}
              onChange={(e) => onUpdateText(e.target.value)}
              className="w-full h-96 p-4 bg-white border border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-xs leading-relaxed"
            />
          ) : (
            paragraphs.map((p, idx) => renderFormattedParagraph(p, idx))
          )}
        </div>

        {/* Pro Lock Overlay */}
        {!isPro && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-20">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-xl mb-3">
              <Crown className="w-6 h-6 fill-white text-white" />
            </div>

            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 mb-2">
              EXECUTIVE PRO FEATURE
            </span>

            <h3 className="text-xl font-black text-white max-w-md">
              STAR Personal Statement Engine
            </h3>

            <p className="text-xs text-slate-200 max-w-md mt-2 mb-5 leading-relaxed">
              Mapped to essential advert criteria with STAR (Situation, Task, Action, Result) methodology. High-value candidates save hours structuring evidence responses.
            </p>

            <button
              onClick={onRequirePro}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <Zap className="w-4 h-4 fill-white text-white" />
              <span>Unlock STAR Personal Statement — Upgrade to Pro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
