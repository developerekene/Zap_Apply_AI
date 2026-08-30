import React, { useState } from 'react';
import { Copy, Check, Download, Mail, Sparkles, Lock } from 'lucide-react';
import jsPDF from 'jspdf';
import { ContactInfo } from '../types';

interface CoverLetterViewProps {
  coverLetterText: string;
  companyName?: string;
  jobTitle?: string;
  candidateName?: string;
  contact?: ContactInfo;
  onUpdateText: (newText: string) => void;
  onRegenerateTone?: (tone: string) => void;
  isGenerating?: boolean;
  isPro?: boolean;
  onRequirePro?: () => void;
}

export const CoverLetterView: React.FC<CoverLetterViewProps> = ({
  coverLetterText,
  companyName = '',
  jobTitle = 'Target Role',
  candidateName = 'Candidate',
  contact,
  onUpdateText,
  onRegenerateTone,
  isGenerating = false,
  isPro = false,
  onRequirePro
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Clean company name (avoiding "Target Company" or generic placeholders)
  const isInvalidCompany = !companyName || ['target company', 'hiring company', 'n/a', 'unknown'].includes(companyName.trim().toLowerCase());
  const displayCompanyName = isInvalidCompany ? '' : companyName.trim();

  // Strip any accidental "Target Company" text from letter body
  const sanitizedBody = (coverLetterText || '').replace(/Target Company/gi, displayCompanyName || 'your company');

  // Build complete letter text including contact header if not already present
  const getFormattedLetterText = () => {
    let body = sanitizedBody.trim();
    if (!contact) return body;

    // Check if phone or address is already present in body
    const hasPhone = contact.phone && body.toLowerCase().includes(contact.phone.toLowerCase());
    const hasAddress = contact.address && body.toLowerCase().includes(contact.address.toLowerCase());

    if (hasPhone || hasAddress) {
      return body;
    }

    // Build applicant contact block
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

  const finalFormattedLetter = getFormattedLetterText();

  const handleCopy = () => {
    if (!isPro) {
      if (onRequirePro) onRequirePro();
      return;
    }
    navigator.clipboard.writeText(finalFormattedLetter);
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
    doc.setFontSize(10.5);

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;

    const lines = doc.splitTextToSize(finalFormattedLetter, pageWidth);
    doc.text(lines, margin, 25);

    const safeName = (candidateName || 'Candidate').replace(/\s+/g, '_');
    const safeCompany = displayCompanyName ? displayCompanyName.replace(/\s+/g, '_') : 'Tailored';
    doc.save(`${safeName}_Cover_Letter_${safeCompany}.pdf`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Tailored Cover Letter
              {displayCompanyName ? (
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  Customized for {displayCompanyName}
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                  Tailored for Position
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">Personalized persuasion addressing job specifications</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-copy-cover-letter"
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied!' : 'Copy Letter'}</span>
          </button>

          <button
            id="btn-download-cover-letter-pdf"
            onClick={handleDownloadPdf}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Cover Letter PDF</span>
          </button>
        </div>
      </div>

      {/* Tone Options */}
      {onRegenerateTone && (
        <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 overflow-x-auto">
          <span className="font-semibold text-slate-800 whitespace-nowrap flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Adjust Tone:
          </span>
          {['Executive & Direct', 'Passionate & Technical', 'Concise Bulleted', 'Enthusiastic'].map((tone) => (
            <button
              key={tone}
              onClick={() => onRegenerateTone(tone)}
              disabled={isGenerating}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-medium transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {tone}
            </button>
          ))}
        </div>
      )}

      {/* Cover Letter Content Body */}
      <div className="relative bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-6 sm:p-8 font-serif leading-relaxed text-sm shadow-xs min-h-[350px]">
        {isEditing ? (
          <textarea
            value={finalFormattedLetter}
            onChange={(e) => onUpdateText(e.target.value)}
            className="w-full h-80 p-3 bg-white border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 font-serif text-sm leading-relaxed"
          />
        ) : (
          <div className="whitespace-pre-line text-slate-800">
            {finalFormattedLetter}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-sans text-indigo-700 hover:text-indigo-900 underline font-semibold"
          >
            {isEditing ? 'Save Edits' : 'Edit Letter Directly'}
          </button>
        </div>
      </div>
    </div>
  );
};
