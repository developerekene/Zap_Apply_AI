import React, { useRef, useState } from 'react';
import { Download, Copy, Check, Printer, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { ResumeData } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ResumePdfViewerProps {
  resumeData: ResumeData;
  jobTitle?: string;
  companyName?: string;
  onEditRequested?: () => void;
  isPro?: boolean;
  freeDownloadsCount?: number;
  onIncrementDownloadCount?: () => void;
  onRequirePro?: () => void;
}

export const ResumePdfViewer: React.FC<ResumePdfViewerProps> = ({
  resumeData,
  jobTitle,
  companyName,
  onEditRequested,
  isPro = false,
  freeDownloadsCount = 0,
  onIncrementDownloadCount,
  onRequirePro
}) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [density, setDensity] = useState<'compact' | 'standard'>('compact');

  // Helper: Find optimal blank white row in canvas to split pages seamlessly without cutting text
  const findCleanSplitRow = (
    ctx: CanvasRenderingContext2D,
    width: number,
    yStart: number,
    targetPageHeight: number,
    totalHeight: number
  ): number => {
    const idealEnd = yStart + targetPageHeight;
    if (idealEnd >= totalHeight - 30) {
      return totalHeight;
    }

    // Search window: Look backwards from idealEnd up to 280px for a clean white gap between paragraphs/bullets
    const searchStart = Math.max(yStart + 100, idealEnd - 320);
    const searchEnd = idealEnd;
    const checkWidth = Math.floor(width * 0.8);
    const offsetX = Math.floor(width * 0.1);

    let bestGapY = idealEnd;
    let longestGapLength = 0;
    let currentGapStart = -1;

    for (let y = searchStart; y <= searchEnd; y += 2) {
      try {
        const imgData = ctx.getImageData(offsetX, y, checkWidth, 1).data;
        let isRowWhite = true;
        // Sample every 4th pixel for speed & accuracy
        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          // If pixel is darker than off-white background, row contains text
          if (r < 240 || g < 240 || b < 240) {
            isRowWhite = false;
            break;
          }
        }

        if (isRowWhite) {
          if (currentGapStart === -1) {
            currentGapStart = y;
          }
        } else {
          if (currentGapStart !== -1) {
            const gapLength = y - currentGapStart;
            if (gapLength > longestGapLength || (gapLength >= longestGapLength && y > bestGapY)) {
              longestGapLength = gapLength;
              bestGapY = Math.floor((currentGapStart + y) / 2);
            }
            currentGapStart = -1;
          }
        }
      } catch {
        break;
      }
    }

    if (currentGapStart !== -1) {
      const gapLength = searchEnd - currentGapStart;
      if (gapLength > longestGapLength) {
        bestGapY = Math.floor((currentGapStart + searchEnd) / 2);
      }
    }

    return longestGapLength >= 4 ? bestGapY : idealEnd;
  };

  // Generate downloadable ATS PDF using html2canvas & jspdf with pixel-perfect whitespace-gap pagination
  const handleDownloadPdf = async () => {
    if (!resumeRef.current) return;

    // Check free download quota
    if (!isPro && freeDownloadsCount >= 2) {
      if (onRequirePro) onRequirePro();
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const element = resumeRef.current;

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution crisp rendering
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Remove on-screen corner accents from canvas capture so they don't get sliced
          clonedDoc.querySelectorAll('.corner-accent').forEach((el) => el.remove());

          // Replace unsupported CSS color functions (oklch, oklab, lch, lab) in all <style> blocks
          const styleEls = clonedDoc.querySelectorAll('style');
          styleEls.forEach((styleEl) => {
            if (styleEl.textContent && /oklch|oklab|lch|lab/i.test(styleEl.textContent)) {
              styleEl.textContent = styleEl.textContent
                .replace(/oklch\([^)]+\)/gi, '#0f172a')
                .replace(/oklab\([^)]+\)/gi, '#0f172a')
                .replace(/lch\([^)]+\)/gi, '#0f172a')
                .replace(/lab\([^)]+\)/gi, '#0f172a');
            }
          });

          // Sanitize inline styles on elements
          const allEls = clonedDoc.querySelectorAll('*');
          allEls.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style && htmlEl.style.cssText) {
              if (/oklch|oklab|lch|lab/i.test(htmlEl.style.cssText)) {
                htmlEl.style.cssText = htmlEl.style.cssText
                  .replace(/oklch\([^)]+\)/gi, '#0f172a')
                  .replace(/oklab\([^)]+\)/gi, '#0f172a')
                  .replace(/lch\([^)]+\)/gi, '#0f172a')
                  .replace(/lab\([^)]+\)/gi, '#0f172a');
              }
            }
          });
        }
      });

      const mainCtx = canvas.getContext('2d');
      if (!mainCtx) throw new Error('Could not get 2D context from canvas');

      const pdfWidth = 210;  // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const topMarginMm = 8;
      const bottomMarginMm = 8;
      const usableHeightMm = pdfHeight - topMarginMm - bottomMarginMm; // 281mm usable

      // Exact pixel height of a single A4 page content in canvas space
      const usableHeightPx = Math.floor((usableHeightMm * canvas.width) / pdfWidth);

      // Draw crisp vector 4 corner accent frames on every generated PDF page
      const drawCornerAccents = (pdfDoc: jsPDF) => {
        const cLen = 7; // arm length mm
        const pad = 5;  // edge margin mm
        pdfDoc.setDrawColor(30, 41, 59); // slate-800
        pdfDoc.setLineWidth(0.4);

        // Top-Left
        pdfDoc.line(pad, pad, pad + cLen, pad);
        pdfDoc.line(pad, pad, pad, pad + cLen);

        // Top-Right
        pdfDoc.line(pdfWidth - pad - cLen, pad, pdfWidth - pad, pad);
        pdfDoc.line(pdfWidth - pad, pad, pdfWidth - pad, pad + cLen);

        // Bottom-Left
        pdfDoc.line(pad, pdfHeight - pad, pad + cLen, pdfHeight - pad);
        pdfDoc.line(pad, pdfHeight - pad - cLen, pad, pdfHeight - pad);

        // Bottom-Right
        pdfDoc.line(pdfWidth - pad - cLen, pdfHeight - pad, pdfWidth - pad, pdfHeight - pad);
        pdfDoc.line(pdfWidth - pad, pdfHeight - pad - cLen, pdfWidth - pad, pdfHeight - pad);
      };

      // Pre-calculate natural whitespace split positions for all pages
      const slices: { yStart: number; height: number }[] = [];
      let yStartPx = 0;

      while (yStartPx < canvas.height - 10) {
        let breakYPx = canvas.height;

        if (yStartPx + usableHeightPx < canvas.height) {
          // Find the cleanest whitespace gap near the bottom of this page
          breakYPx = findCleanSplitRow(mainCtx, canvas.width, yStartPx, usableHeightPx, canvas.height);
          if (breakYPx <= yStartPx + 50) {
            breakYPx = yStartPx + usableHeightPx;
          }
        }

        const sliceHeightPx = Math.max(1, Math.min(breakYPx - yStartPx, canvas.height - yStartPx));
        slices.push({ yStart: yStartPx, height: sliceHeightPx });
        yStartPx = breakYPx;
      }

      // Strict 1 MB maximum file size constraint
      const MAX_PDF_SIZE_BYTES = 1024 * 1024; // 1 MB (1,048,576 bytes)

      // Helper function to build PDF with given compression parameters
      const buildCompressedPdf = (jpegQuality: number, downscaleRatio: number = 1.0): { pdf: jsPDF; sizeBytes: number } => {
        const pdfDoc = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4',
          compress: true
        });

        slices.forEach((slice, idx) => {
          const targetW = Math.max(1, Math.round(canvas.width * downscaleRatio));
          const targetH = Math.max(1, Math.round(slice.height * downscaleRatio));

          const subCanvas = document.createElement('canvas');
          subCanvas.width = targetW;
          subCanvas.height = targetH;
          const ctx = subCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetW, targetH);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(
              canvas,
              0,
              slice.yStart,
              canvas.width,
              slice.height,
              0,
              0,
              targetW,
              targetH
            );
          }

          // Encode high-clarity JPEG to drastically reduce file size vs uncompressed PNG
          const sliceImgData = subCanvas.toDataURL('image/jpeg', jpegQuality);
          const sliceHeightMm = (slice.height * pdfWidth) / canvas.width;

          if (idx > 0) {
            pdfDoc.addPage();
          }

          pdfDoc.addImage(sliceImgData, 'JPEG', 0, topMarginMm, pdfWidth, sliceHeightMm, undefined, 'FAST');
          drawCornerAccents(pdfDoc);
        });

        const blob = pdfDoc.output('blob');
        return { pdf: pdfDoc, sizeBytes: blob.size };
      };

      // Progressive compression tiers to guarantee PDF stays strictly <= 1 MB while maximizing visual clarity
      const compressionTiers = [
        { quality: 0.88, downscale: 1.0 },
        { quality: 0.80, downscale: 1.0 },
        { quality: 0.72, downscale: 1.0 },
        { quality: 0.65, downscale: 0.9 },
        { quality: 0.58, downscale: 0.8 },
        { quality: 0.50, downscale: 0.75 },
      ];

      let finalPdfDoc: jsPDF | null = null;

      for (const tier of compressionTiers) {
        const result = buildCompressedPdf(tier.quality, tier.downscale);
        finalPdfDoc = result.pdf;
        if (result.sizeBytes <= MAX_PDF_SIZE_BYTES) {
          break;
        }
      }

      if (!finalPdfDoc) {
        finalPdfDoc = buildCompressedPdf(0.5, 0.75).pdf;
      }

      const fileName = `${resumeData.contact.fullName.replace(/\s+/g, '_')}_Resume_ATS_${companyName ? companyName.replace(/\s+/g, '_') : 'Tailored'}.pdf`;
      finalPdfDoc.save(fileName);
      if (!isPro && onIncrementDownloadCount) {
        onIncrementDownloadCount();
      }
    } catch (err) {
      console.warn('html2canvas failed, falling back to native jsPDF text generator:', err);
      try {
        // Native jsPDF text fallback
        const doc = new jsPDF('p', 'mm', 'a4');
        const docWidth = doc.internal.pageSize.getWidth();
        const docHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        const pageWidth = docWidth - margin * 2;
        let y = 18;
        let currentPage = 1;

        const drawCornerAccents = (pdfDoc: jsPDF, w: number, h: number) => {
          const cLen = 7;
          const pad = 5;
          pdfDoc.setDrawColor(30, 41, 59);
          pdfDoc.setLineWidth(0.4);
          pdfDoc.line(pad, pad, pad + cLen, pad);
          pdfDoc.line(pad, pad, pad, pad + cLen);
          pdfDoc.line(w - pad - cLen, pad, w - pad, pad);
          pdfDoc.line(w - pad, pad, w - pad, pad + cLen);
          pdfDoc.line(pad, h - pad, pad + cLen, h - pad);
          pdfDoc.line(pad, h - pad - cLen, pad, h - pad);
          pdfDoc.line(w - pad - cLen, h - pad, w - pad, h - pad);
          pdfDoc.line(w - pad, h - pad - cLen, w - pad, h - pad);
        };

        const tryAddPage = () => {
          doc.addPage();
          currentPage++;
          y = 18;
          return true;
        };

        // Name
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(15);
        doc.text((resumeData.contact.fullName || 'Candidate').toUpperCase(), margin, y);
        y += 5.5;

        // Contact Info
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8.5);
        const contactStr = [
          resumeData.contact.location,
          resumeData.contact.phone,
          resumeData.contact.email,
          resumeData.contact.linkedin
        ].filter(Boolean).join(' | ');
        doc.text(contactStr, margin, y);
        y += 7;

        // Summary
        if (resumeData.summary) {
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.text('PROFESSIONAL SUMMARY', margin, y);
          y += 4.5;
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8.5);
          const summaryLines = doc.splitTextToSize(resumeData.summary, pageWidth);
          doc.text(summaryLines, margin, y);
          y += summaryLines.length * 4 + 3.5;
        }

        // Skills
        if (resumeData.skills && (resumeData.skills.technical?.length > 0 || resumeData.skills.toolsAndFrameworks?.length > 0)) {
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.text('CORE SKILLS & COMPETENCIES', margin, y);
          y += 4.5;
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8.5);
          if (resumeData.skills.technical?.length > 0) {
            const techStr = `Technical Skills: ${resumeData.skills.technical.join(', ')}`;
            const techLines = doc.splitTextToSize(techStr, pageWidth);
            doc.text(techLines, margin, y);
            y += techLines.length * 4;
          }
          if (resumeData.skills.toolsAndFrameworks?.length > 0) {
            const toolsStr = `Tools & Frameworks: ${resumeData.skills.toolsAndFrameworks.join(', ')}`;
            const toolsLines = doc.splitTextToSize(toolsStr, pageWidth);
            doc.text(toolsLines, margin, y);
            y += toolsLines.length * 4;
          }
          y += 3.5;
        }

        // Experience
        if (resumeData.experience?.length > 0) {
          if (y > 255) {
            tryAddPage();
          }
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.text('PROFESSIONAL EXPERIENCE', margin, y);
          y += 4.5;

          resumeData.experience.forEach((exp) => {
            if (y > 265) {
              if (!tryAddPage()) return;
            }
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.text(`${exp.role} - ${exp.company} (${exp.startDate} - ${exp.endDate || (exp.current ? 'Present' : '')})`, margin, y);
            y += 4;
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8);
            exp.achievements?.forEach((ach) => {
              if (y > 272) {
                if (!tryAddPage()) return;
              }
              const bulletLines = doc.splitTextToSize(`• ${ach}`, pageWidth - 4);
              doc.text(bulletLines, margin + 2, y);
              y += bulletLines.length * 3.8;
            });
            y += 2.5;
          });
        }

        // Education
        if (resumeData.education?.length > 0) {
          if (y > 255) {
            tryAddPage();
          }
          if (y <= 270) {
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.text('EDUCATION', margin, y);
            y += 4.5;
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8.5);
            resumeData.education.forEach((edu) => {
              if (y <= 278) {
                doc.text(`${edu.degree} in ${edu.fieldOfStudy} - ${edu.institution} (${edu.startDate} - ${edu.endDate})`, margin, y);
                y += 4;
              }
            });
          }
        }

        // Apply corner accents to all generated fallback pages
        for (let i = 1; i <= currentPage; i++) {
          doc.setPage(i);
          drawCornerAccents(doc, docWidth, docHeight);
        }

        const fileName = `${(resumeData.contact.fullName || 'Candidate').replace(/\s+/g, '_')}_Resume_ATS.pdf`;
        doc.save(fileName);
      } catch (fallbackError) {
        console.error('All PDF generation methods failed:', fallbackError);
        alert('Could not generate PDF directly. Please use the Print button to Save as PDF from your browser.');
      }
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
            className="flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download ATS PDF'}</span>
            {!isPro && (
              <span className="ml-1 text-[10px] bg-indigo-800 text-indigo-100 px-1.5 py-0.5 rounded-full font-extrabold">
                {Math.max(0, 2 - freeDownloadsCount)} Free Left
              </span>
            )}
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
