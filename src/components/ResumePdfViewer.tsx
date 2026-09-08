import React, { useRef, useState } from 'react';
import { Download, Copy, Check, Printer, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { ResumeData } from '../types';
import jsPDF from 'jspdf';

interface ResumePdfViewerProps {
  resumeData: ResumeData;
  jobTitle?: string;
  companyName?: string;
  onEditRequested?: () => void;
}

export const ResumePdfViewer: React.FC<ResumePdfViewerProps> = ({
  resumeData,
  jobTitle,
  companyName,
  onEditRequested
}) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [density, setDensity] = useState<'compact' | 'standard'>('compact');

  // Generate 100% native vector text PDF with selectable, copyable, AI-readable text streams and strict <=2 pages guarantee
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = doc.internal.pageSize.getWidth();   // 210mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
      const margin = 14; // Left and right margin in mm
      const contentWidth = pageWidth - margin * 2; // 182mm
      const topMargin = 14;
      const bottomMargin = 14;
      const maxY = pageHeight - bottomMargin; // 283mm

      let currentPage = 1;
      let y = topMargin;

      // Draw crisp vector 4-corner accents
      const drawCornerAccents = (pdfDoc: jsPDF, w: number, h: number) => {
        const cLen = 6;
        const pad = 5;
        pdfDoc.setDrawColor(15, 23, 42); // slate-900
        pdfDoc.setLineWidth(0.35);

        // Top-Left
        pdfDoc.line(pad, pad, pad + cLen, pad);
        pdfDoc.line(pad, pad, pad, pad + cLen);

        // Top-Right
        pdfDoc.line(w - pad - cLen, pad, w - pad, pad);
        pdfDoc.line(w - pad, pad, w - pad, pad + cLen);

        // Bottom-Left
        pdfDoc.line(pad, h - pad, pad + cLen, h - pad);
        pdfDoc.line(pad, h - pad - cLen, pad, h - pad);

        // Bottom-Right
        pdfDoc.line(w - pad - cLen, h - pad, w - pad, h - pad);
        pdfDoc.line(w - pad, h - pad - cLen, w - pad, h - pad);
      };

      // Helper to check if a block of height requiredHeight fits on current page, or transitions cleanly to page 2 (never page 3)
      const ensureSpace = (requiredHeight: number): boolean => {
        if (y + requiredHeight > maxY) {
          if (currentPage === 1) {
            doc.addPage();
            currentPage = 2;
            y = topMargin + 4;
            return true;
          } else {
            // Already on Page 2: do not create page 3
            return false;
          }
        }
        return true;
      };

      // Typography scaling based on density mode
      const isCompact = density === 'compact';
      const nameSize = isCompact ? 16 : 17;
      const sectionTitleSize = isCompact ? 9.5 : 10;
      const subheadSize = isCompact ? 8.5 : 9;
      const bodySize = isCompact ? 8 : 8.5;
      const bodyLineSpacing = isCompact ? 3.3 : 3.7;

      // 1. CANDIDATE HEADER
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(nameSize);
      doc.setTextColor(15, 23, 42); // slate-900
      const candidateName = (resumeData.contact?.fullName || 'Candidate Name').toUpperCase();
      doc.text(candidateName, pageWidth / 2, y, { align: 'center' });
      y += isCompact ? 4.5 : 5.2;

      // Contact Line 1: Location | Phone | Email
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(bodySize);
      doc.setTextColor(51, 65, 85); // slate-700
      const contactParts1 = [
        resumeData.contact?.location,
        resumeData.contact?.phone,
        resumeData.contact?.email
      ].filter(Boolean);

      if (contactParts1.length > 0) {
        doc.text(contactParts1.join('  •  '), pageWidth / 2, y, { align: 'center' });
        y += isCompact ? 3.8 : 4.2;
      }

      // Contact Line 2: LinkedIn | Portfolio | GitHub
      const contactParts2 = [
        resumeData.contact?.linkedin ? `LinkedIn: ${resumeData.contact.linkedin}` : null,
        resumeData.contact?.portfolio ? `Portfolio: ${resumeData.contact.portfolio}` : null,
        resumeData.contact?.github ? `GitHub: ${resumeData.contact.github}` : null
      ].filter(Boolean);

      if (contactParts2.length > 0) {
        doc.setFontSize(bodySize - 0.5);
        doc.setTextColor(71, 85, 105);
        doc.text(contactParts2.join('  •  '), pageWidth / 2, y, { align: 'center' });
        y += isCompact ? 3.5 : 4;
      }

      // Header bottom border rule
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.4);
      doc.line(margin, y, margin + contentWidth, y);
      y += isCompact ? 4 : 5;

      // Section Header Drawer Helper
      const drawSectionHeader = (title: string) => {
        ensureSpace(8);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(sectionTitleSize);
        doc.setTextColor(15, 23, 42);
        doc.text(title, margin, y);
        y += 1.2;
        doc.setDrawColor(203, 213, 225); // slate-300
        doc.setLineWidth(0.25);
        doc.line(margin, y, margin + contentWidth, y);
        y += isCompact ? 3.5 : 4.2;
      };

      // 2. PROFESSIONAL SUMMARY
      if (resumeData.summary) {
        drawSectionHeader('PROFESSIONAL SUMMARY');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(bodySize);
        doc.setTextColor(30, 41, 59); // slate-800
        const summaryLines = doc.splitTextToSize(resumeData.summary, contentWidth);
        for (const line of summaryLines) {
          if (ensureSpace(bodyLineSpacing)) {
            doc.text(line, margin, y);
            y += bodyLineSpacing;
          }
        }
        y += isCompact ? 2.5 : 3.5;
      }

      // 3. CORE COMPETENCIES & SKILLS
      const hasSkills =
        (resumeData.skills?.technical && resumeData.skills.technical.length > 0) ||
        (resumeData.skills?.toolsAndFrameworks && resumeData.skills.toolsAndFrameworks.length > 0) ||
        (resumeData.skills?.soft && resumeData.skills.soft.length > 0) ||
        (resumeData.skills?.certifications && resumeData.skills.certifications.length > 0);

      if (hasSkills) {
        drawSectionHeader('CORE COMPETENCIES & SKILLS');

        const renderSkillCategory = (label: string, items?: string[]) => {
          if (!items || items.length === 0) return;
          const fullText = `${label}: ${items.join(', ')}`;
          const lines = doc.splitTextToSize(fullText, contentWidth);
          for (let i = 0; i < lines.length; i++) {
            if (ensureSpace(bodyLineSpacing)) {
              if (i === 0) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(bodySize);
                doc.setTextColor(15, 23, 42);
                doc.text(`${label}: `, margin, y);
                const labelWidth = doc.getTextWidth(`${label}: `);

                doc.setFont('helvetica', 'normal');
                doc.setTextColor(51, 65, 85);
                const firstLineRemainder = lines[0].substring(label.length + 2);
                doc.text(firstLineRemainder, margin + labelWidth, y);
              } else {
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(51, 65, 85);
                doc.text(lines[i], margin, y);
              }
              y += bodyLineSpacing;
            }
          }
        };

        renderSkillCategory('Technical Skills', resumeData.skills?.technical);
        renderSkillCategory('Tools & Frameworks', resumeData.skills?.toolsAndFrameworks);
        renderSkillCategory('Domain & Leadership', resumeData.skills?.soft);
        renderSkillCategory('Certifications', resumeData.skills?.certifications);
        y += isCompact ? 2.5 : 3.5;
      }

      // 4. PROFESSIONAL EXPERIENCE
      if (resumeData.experience && resumeData.experience.length > 0) {
        drawSectionHeader('PROFESSIONAL EXPERIENCE');

        for (const exp of resumeData.experience) {
          // Check if at least the role header + 1 bullet fit on this page, else cleanly start on next page
          ensureSpace(12);

          // Role Title + Company
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(subheadSize);
          doc.setTextColor(15, 23, 42);
          const roleText = `${exp.role}`;
          doc.text(roleText, margin, y);
          const roleWidth = doc.getTextWidth(roleText);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(` — ${exp.company}`, margin + roleWidth, y);

          // Date on right baseline
          const dateStr = `${exp.startDate || ''} - ${exp.endDate || (exp.current ? 'Present' : '')}`;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(bodySize);
          doc.setTextColor(51, 65, 85);
          doc.text(dateStr, margin + contentWidth, y, { align: 'right' });
          y += isCompact ? 3.4 : 3.8;

          // Location if present
          if (exp.location) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(bodySize - 0.5);
            doc.setTextColor(100, 116, 139);
            doc.text(exp.location, margin, y);
            y += isCompact ? 3.0 : 3.4;
          }

          // Bullet achievements
          if (exp.achievements && exp.achievements.length > 0) {
            for (const bullet of exp.achievements) {
              const bulletLines = doc.splitTextToSize(bullet, contentWidth - 5);
              const bulletTotalHeight = bulletLines.length * bodyLineSpacing;

              if (!ensureSpace(bulletTotalHeight)) {
                // If on page 2 and out of space, stop adding more bullets to protect 2-page max
                break;
              }

              // Draw bullet symbol
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(bodySize);
              doc.setTextColor(79, 70, 229); // indigo bullet
              doc.text('•', margin + 1.2, y);

              // Draw bullet text
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(30, 41, 59);
              for (const bLine of bulletLines) {
                doc.text(bLine, margin + 4.5, y);
                y += bodyLineSpacing;
              }
            }
          }
          y += isCompact ? 2.0 : 2.8;
        }
        y += isCompact ? 1.5 : 2.5;
      }

      // 5. SELECTED PROJECTS
      if (resumeData.projects && resumeData.projects.length > 0) {
        drawSectionHeader('SELECTED PROJECTS');

        for (const proj of resumeData.projects) {
          ensureSpace(10);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(subheadSize);
          doc.setTextColor(15, 23, 42);
          doc.text(proj.name, margin, y);

          if (proj.technologies && proj.technologies.length > 0) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(bodySize - 0.5);
            doc.setTextColor(71, 85, 105);
            const techTag = ` [${proj.technologies.join(', ')}]`;
            doc.text(techTag, margin + doc.getTextWidth(proj.name), y);
          }
          y += isCompact ? 3.2 : 3.6;

          if (proj.description) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(bodySize);
            doc.setTextColor(51, 65, 85);
            const projLines = doc.splitTextToSize(proj.description, contentWidth);
            for (const pLine of projLines) {
              if (ensureSpace(bodyLineSpacing)) {
                doc.text(pLine, margin, y);
                y += bodyLineSpacing;
              }
            }
          }
          y += isCompact ? 1.8 : 2.5;
        }
      }

      // 6. EDUCATION
      if (resumeData.education && resumeData.education.length > 0) {
        drawSectionHeader('EDUCATION');

        for (const edu of resumeData.education) {
          ensureSpace(6);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(subheadSize);
          doc.setTextColor(15, 23, 42);
          const eduLeft = `${edu.degree} in ${edu.fieldOfStudy}`;
          doc.text(eduLeft, margin, y);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          const instText = `, ${edu.institution}${edu.gpa ? ` (GPA: ${edu.gpa})` : ''}`;
          doc.text(instText, margin + doc.getTextWidth(eduLeft), y);

          const eduDates = `${edu.startDate || ''} - ${edu.endDate || ''}`;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(bodySize);
          doc.setTextColor(51, 65, 85);
          doc.text(eduDates, margin + contentWidth, y, { align: 'right' });
          y += isCompact ? 3.5 : 4.0;
        }
      }

      // Total pages count (capped at 2)
      const totalPages = Math.min(doc.getNumberOfPages(), 2);

      // Render footers, page numbering, and corner frame accents on each page
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        drawCornerAccents(doc, pageWidth, pageHeight);

        if (totalPages > 1) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184); // slate-400
          const pageStr = `Page ${p} of ${totalPages}`;
          doc.text(pageStr, pageWidth / 2, pageHeight - 6, { align: 'center' });
        }
      }

      const safeName = (resumeData.contact?.fullName || 'Candidate').replace(/\s+/g, '_');
      const safeCompany = companyName ? companyName.replace(/\s+/g, '_') : 'Tailored';
      const fileName = `${safeName}_Resume_ATS_${safeCompany}.pdf`;

      doc.save(fileName);
    } catch (err) {
      console.error('Vector PDF generation error:', err);
      alert('Failed to generate ATS PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getPlainText = () => {
    let text = `${resumeData.contact.fullName || ''}\n`;
    text += `${[resumeData.contact.location, resumeData.contact.phone, resumeData.contact.email, resumeData.contact.linkedin, resumeData.contact.portfolio, resumeData.contact.github].filter(Boolean).join(' | ')}\n\n`;

    if (resumeData.summary) {
      text += `PROFESSIONAL SUMMARY\n${resumeData.summary}\n\n`;
    }

    if (resumeData.skills) {
      text += `CORE COMPETENCIES & SKILLS\n`;
      if (resumeData.skills.technical?.length) text += `Technical Skills: ${resumeData.skills.technical.join(', ')}\n`;
      if (resumeData.skills.toolsAndFrameworks?.length) text += `Tools & Frameworks: ${resumeData.skills.toolsAndFrameworks.join(', ')}\n`;
      if (resumeData.skills.soft?.length) text += `Domain & Leadership: ${resumeData.skills.soft.join(', ')}\n`;
      if (resumeData.skills.certifications?.length) text += `Certifications: ${resumeData.skills.certifications.join(', ')}\n`;
      text += `\n`;
    }

    if (resumeData.experience?.length) {
      text += `PROFESSIONAL EXPERIENCE\n`;
      resumeData.experience.forEach((exp) => {
        text += `${exp.role} - ${exp.company} (${exp.startDate} - ${exp.endDate || (exp.current ? 'Present' : '')})\n`;
        if (exp.location) text += `${exp.location}\n`;
        exp.achievements?.forEach((ach) => {
          text += `• ${ach}\n`;
        });
        text += `\n`;
      });
    }

    if (resumeData.education?.length) {
      text += `EDUCATION\n`;
      resumeData.education.forEach((edu) => {
        text += `${edu.degree} in ${edu.fieldOfStudy} - ${edu.institution} (${edu.startDate} - ${edu.endDate})\n`;
      });
      text += `\n`;
    }

    if (resumeData.projects?.length) {
      text += `SELECTED PROJECTS\n`;
      resumeData.projects.forEach((p) => {
        text += `${p.name} | ${p.technologies.join(', ')}\n${p.description}\n\n`;
      });
    }

    return text;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getPlainText());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Control Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>100% ATS Compliant Layout (Executive Single-Column Flow)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Density Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700">
            <button
              type="button"
              onClick={() => setDensity('compact')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                density === 'compact' ? 'bg-white shadow-xs text-indigo-700 font-bold' : 'hover:text-slate-900'
              }`}
              title="Compact spacing for tighter page budgeting"
            >
              Compact
            </button>
            <button
              type="button"
              onClick={() => setDensity('standard')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                density === 'standard' ? 'bg-white shadow-xs text-indigo-700 font-bold' : 'hover:text-slate-900'
              }`}
              title="Standard executive spacing"
            >
              Standard
            </button>
          </div>

          <button
            id="btn-copy-resume-text"
            onClick={handleCopyText}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
          </button>

          <button
            id="btn-print-resume"
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
            title="Print or Save as Vector PDF via Browser"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>

          <button
            id="btn-download-pdf"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download ATS PDF'}</span>
          </button>
        </div>
      </div>

      {/* Actual Rendered ATS Resume Container */}
      <div className="bg-slate-200/60 p-2 sm:p-6 rounded-2xl border border-slate-300 overflow-x-auto">
        <div
          ref={resumeRef}
          id="ats-resume-document"
          className={`relative bg-white text-slate-900 w-full max-w-[780px] mx-auto rounded shadow-xl font-sans text-xs selection:bg-indigo-100 ${
            density === 'compact' ? 'p-6 sm:p-8 leading-snug' : 'p-8 sm:p-10 leading-normal'
          }`}
          style={{ color: '#0f172a', fontFamily: 'Arial, Helvetica, sans-serif' }}
        >
          {/* Presentable Four Corner Accents */}
          <div className="corner-accent absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-slate-900 pointer-events-none" />
          <div className="corner-accent absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-slate-900 pointer-events-none" />
          <div className="corner-accent absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-slate-900 pointer-events-none" />
          <div className="corner-accent absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-slate-900 pointer-events-none" />

          {/* Resume Header / Contact Info */}
          <div className={`border-b-2 border-slate-900 text-center ${density === 'compact' ? 'pb-2.5 mb-3.5' : 'pb-3.5 mb-4'}`}>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 mb-0.5">
              {resumeData.contact.fullName || 'Candidate Name'}
            </h1>
            <div className="flex flex-wrap justify-center items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-700 font-medium">
              {resumeData.contact.location && <span>{resumeData.contact.location}</span>}
              {resumeData.contact.phone && <span>• {resumeData.contact.phone}</span>}
              {resumeData.contact.email && <span>• {resumeData.contact.email}</span>}
            </div>
            {(resumeData.contact.linkedin || resumeData.contact.portfolio || resumeData.contact.github) && (
              <div className="flex flex-wrap justify-center items-center gap-x-2.5 gap-y-0.5 text-[10.5px] text-slate-600 mt-0.5">
                {resumeData.contact.linkedin && <span>LinkedIn: {resumeData.contact.linkedin}</span>}
                {resumeData.contact.portfolio && <span>• Portfolio: {resumeData.contact.portfolio}</span>}
                {resumeData.contact.github && <span>• GitHub: {resumeData.contact.github}</span>}
              </div>
            )}
          </div>

          {/* Professional Summary */}
          {resumeData.summary && (
            <div className={`${density === 'compact' ? 'mb-3' : 'mb-4'}`}>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
                PROFESSIONAL SUMMARY
              </h2>
              <p className="text-[11px] text-slate-800 text-justify">
                {resumeData.summary}
              </p>
            </div>
          )}

          {/* Core Technical & Professional Skills */}
          {resumeData.skills && (
            <div className={`${density === 'compact' ? 'mb-3' : 'mb-4'}`}>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
                CORE COMPETENCIES & SKILLS
              </h2>
              <div className={`text-[11px] text-slate-800 ${density === 'compact' ? 'space-y-0.5' : 'space-y-1'}`}>
                {resumeData.skills.technical?.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-900">Technical Skills: </span>
                    {resumeData.skills.technical.join(', ')}
                  </div>
                )}
                {resumeData.skills.toolsAndFrameworks?.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-900">Tools & Frameworks: </span>
                    {resumeData.skills.toolsAndFrameworks.join(', ')}
                  </div>
                )}
                {resumeData.skills.soft?.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-900">Domain & Leadership: </span>
                    {resumeData.skills.soft.join(', ')}
                  </div>
                )}
                {resumeData.skills.certifications?.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-900">Certifications: </span>
                    {resumeData.skills.certifications.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Professional Experience */}
          {resumeData.experience?.length > 0 && (
            <div className={`${density === 'compact' ? 'mb-3' : 'mb-4'}`}>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2">
                PROFESSIONAL EXPERIENCE
              </h2>
              <div className={density === 'compact' ? 'space-y-2.5' : 'space-y-3.5'}>
                {resumeData.experience.map((exp, idx) => (
                  <div key={exp.id || idx}>
                    <div className="flex justify-between items-baseline font-bold text-slate-900 text-[11.5px]">
                      <span>{exp.role} <span className="font-normal text-slate-700">— {exp.company}</span></span>
                      <span className="text-slate-700 font-semibold whitespace-nowrap ml-2 text-[10.5px]">
                        {exp.startDate} - {exp.endDate || (exp.current ? 'Present' : '')}
                      </span>
                    </div>
                    {exp.location && (
                      <div className="text-[10px] text-slate-500 italic mb-1">{exp.location}</div>
                    )}
                    <ul className={`list-disc list-inside text-[11px] text-slate-800 pl-1 ${density === 'compact' ? 'space-y-0.5' : 'space-y-1'}`}>
                      {exp.achievements?.map((bullet, bIdx) => (
                        <li key={bIdx} className="leading-normal">
                          <span className="-ml-1">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Projects */}
          {resumeData.projects && resumeData.projects.length > 0 && (
            <div className={`${density === 'compact' ? 'mb-3' : 'mb-4'}`}>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2">
                SELECTED PROJECTS
              </h2>
              <div className={density === 'compact' ? 'space-y-2' : 'space-y-2.5'}>
                {resumeData.projects.map((proj, pIdx) => (
                  <div key={proj.id || pIdx} className="text-[11px]">
                    <div className="flex justify-between items-baseline font-bold text-slate-900">
                      <span>{proj.name}</span>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span className="font-medium text-slate-600 text-[10px]">
                          [{proj.technologies.join(', ')}]
                        </span>
                      )}
                    </div>
                    <p className="text-slate-800 text-[11px] mt-0.5">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resumeData.education?.length > 0 && (
            <div className="mb-2">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
                EDUCATION
              </h2>
              <div className="space-y-1.5">
                {resumeData.education.map((edu, eIdx) => (
                  <div key={edu.id || eIdx} className="flex justify-between items-baseline text-[11px]">
                    <div>
                      <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</span>
                      <span className="text-slate-700">, {edu.institution}</span>
                      {edu.gpa && <span className="text-slate-600 text-[10px]"> (GPA: {edu.gpa})</span>}
                    </div>
                    <span className="text-slate-700 font-semibold whitespace-nowrap ml-2 text-[10.5px]">
                      {edu.startDate} - {edu.endDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
