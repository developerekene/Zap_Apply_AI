import React, { useState } from 'react';
import { FileText, Upload, Sparkles, Plus, Trash2, CheckCircle2, Edit3, Shield, Award, Briefcase, GraduationCap, Code } from 'lucide-react';
import { ResumeData, ExperienceItem, EducationItem, ProjectItem } from '../types';

interface MasterProfileEditorProps {
  masterProfile: ResumeData;
  onUpdateMasterProfile: (updated: ResumeData) => void;
  onParseResumeRawText: (payload: { rawText?: string; fileBase64?: string; fileMimeType?: string }) => Promise<void>;
  isParsing: boolean;
  onResetProfile?: () => void;
}

export const MasterProfileEditor: React.FC<MasterProfileEditorProps> = ({
  masterProfile,
  onUpdateMasterProfile,
  onParseResumeRawText,
  isParsing,
  onResetProfile
}) => {
  const [rawTextModal, setRawTextModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [activeSection, setActiveSection] = useState<'summary' | 'contact' | 'experience' | 'skills' | 'education'>('summary');
  const [isDragging, setIsDragging] = useState(false);

  // Handle PDF file upload
  const handlePdfFileUpload = (file: File) => {
    if (!file) return;

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        if (result) {
          // Extract base64 portion
          const base64Data = result.split(',')[1] || result;
          await onParseResumeRawText({
            fileBase64: base64Data,
            fileMimeType: 'application/pdf'
          });
        }
      };
      reader.readAsDataURL(file);
    } else {
      // Plain text or doc file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        if (text) {
          await onParseResumeRawText({ rawText: text });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePdfFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePdfFileUpload(file);
  };

  // Handle parse submission from text modal
  const handleStartParseText = async () => {
    if (!pasteText.trim()) return;
    await onParseResumeRawText({ rawText: pasteText });
    setRawTextModal(false);
    setPasteText('');
  };

  // Update contact fields
  const handleContactChange = (field: keyof typeof masterProfile.contact, value: string) => {
    onUpdateMasterProfile({
      ...masterProfile,
      contact: { ...masterProfile.contact, [field]: value }
    });
  };

  // Experience management
  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: 'New Company',
      role: 'Software Engineer',
      location: 'City, State',
      startDate: '2023-01',
      endDate: 'Present',
      current: true,
      achievements: ['Achieved 30% metric improvement using tech stack']
    };
    onUpdateMasterProfile({
      ...masterProfile,
      experience: [newExp, ...masterProfile.experience]
    });
  };

  const handleUpdateExperience = (id: string, updated: Partial<ExperienceItem>) => {
    const updatedExp = masterProfile.experience.map(item => item.id === id ? { ...item, ...updated } : item);
    onUpdateMasterProfile({ ...masterProfile, experience: updatedExp });
  };

  const handleRemoveExperience = (id: string) => {
    onUpdateMasterProfile({
      ...masterProfile,
      experience: masterProfile.experience.filter(item => item.id !== id)
    });
  };

  // Education management
  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: 'University / Institution Name',
      degree: 'Degree / Certificate',
      fieldOfStudy: 'Major / Field of Study',
      startDate: '2020',
      endDate: '2024'
    };
    onUpdateMasterProfile({
      ...masterProfile,
      education: [newEdu, ...(masterProfile.education || [])]
    });
  };

  const handleRemoveEducation = (id: string) => {
    onUpdateMasterProfile({
      ...masterProfile,
      education: (masterProfile.education || []).filter(item => item.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Resume Parser Header & Strengths Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Resume Intelligence
            </div>
            <h2 className="text-2xl font-black text-slate-900">Master Candidate Profile</h2>
            <p className="text-sm text-slate-600">
              Your master repository for 1-click tailored resume generation across any job description.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-open-parser-modal"
              onClick={() => setRawTextModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-md shadow-indigo-600/20 shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Parse New Resume / Import Text</span>
            </button>
            {onResetProfile && (
              <button
                type="button"
                id="btn-clear-master-profile"
                onClick={onResetProfile}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-600 border border-slate-300 font-bold text-xs transition-all shrink-0 cursor-pointer"
                title="Completely clear all profile data from this device"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
                <span>Clear Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Drag & Drop PDF Resume Import Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
              {isParsing ? (
                <Sparkles className="w-6 h-6 animate-spin text-indigo-600" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                {isParsing ? 'Analyzing CV PDF with Gemini AI...' : 'Upload or Drag & Drop PDF Resume'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Upload your existing CV in PDF format (or .docx / .txt). Gemini will automatically extract your contact info, work history, skills, and education into the fields below.
              </p>
            </div>

            <div className="pt-1 flex items-center space-x-3">
              <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-colors shadow-sm cursor-pointer">
                <span>{isParsing ? 'Processing File...' : 'Select PDF Resume File'}</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  disabled={isParsing}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setRawTextModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
              >
                Or Paste Resume Text
              </button>
            </div>
          </div>
        </div>

        {/* Candidate Strengths Highlight Cards */}
        {masterProfile.strengths && masterProfile.strengths.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-indigo-700 flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Extracted Candidate Core Strengths
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {masterProfile.strengths.map((str, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-800 font-medium leading-relaxed">{str}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Parse Modal Popup */}
      {rawTextModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" /> Parse Resume with AI
              </h3>
              <button onClick={() => setRawTextModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-600">
              Paste your raw resume text or upload a plain text file. Gemini AI will automatically extract work experience, education, skills, and contact details into structured master sections.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Resume Text:</label>
                <label className="text-xs text-indigo-600 hover:underline cursor-pointer flex items-center gap-1 font-semibold">
                  <Upload className="w-3.5 h-3.5" /> Upload Resume (.pdf, .docx, .txt)
                  <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleFileInputChange} className="hidden" />
                </label>
              </div>

              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste full resume text here..."
                className="w-full h-64 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setRawTextModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-parse-resume"
                onClick={handleStartParseText}
                disabled={isParsing || !pasteText.trim()}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
              >
                {isParsing ? 'Parsing with Gemini AI...' : 'Parse Resume Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Main Content & Sub-tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Section Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
          {[
            { id: 'summary', label: 'Summary & Bio', icon: FileText },
            { id: 'contact', label: 'Contact Info', icon: Shield },
            { id: 'experience', label: 'Experience', icon: Briefcase },
            { id: 'skills', label: 'Skills & Tech', icon: Code },
            { id: 'education', label: 'Education', icon: GraduationCap }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section Content */}
        {activeSection === 'summary' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Master Professional Summary & Bio</h3>
              <span className="text-xs text-slate-500 font-medium">Used as the core profile baseline for tailoring</span>
            </div>
            <textarea
              value={masterProfile.summary || ''}
              onChange={(e) => onUpdateMasterProfile({ ...masterProfile, summary: e.target.value })}
              placeholder="e.g. Senior Software Engineer with 7+ years of experience architecting scalable distributed systems and leading agile engineering teams..."
              className="w-full h-36 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none leading-relaxed placeholder:text-slate-400"
            />
          </div>
        )}

        {activeSection === 'contact' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Jane Doe"
                value={masterProfile.contact.fullName || ''}
                onChange={(e) => handleContactChange('fullName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                placeholder="e.g. jane.doe@example.com"
                value={masterProfile.contact.email || ''}
                onChange={(e) => handleContactChange('email', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
              <input
                type="text"
                placeholder="e.g. +1 (555) 019-2834"
                value={masterProfile.contact.phone || ''}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Street Address</label>
              <input
                type="text"
                placeholder="e.g. 123 Main Street, Apt 4B"
                value={masterProfile.contact.address || ''}
                onChange={(e) => handleContactChange('address', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Post Code / Zip</label>
              <input
                type="text"
                placeholder="e.g. 90210 or SW1A 1AA"
                value={masterProfile.contact.postCode || ''}
                onChange={(e) => handleContactChange('postCode', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Country</label>
              <input
                type="text"
                placeholder="e.g. United States or United Kingdom"
                value={masterProfile.contact.country || ''}
                onChange={(e) => handleContactChange('country', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Location / City & State</label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA"
                value={masterProfile.contact.location || ''}
                onChange={(e) => handleContactChange('location', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">LinkedIn URL</label>
              <input
                type="text"
                placeholder="e.g. linkedin.com/in/username"
                value={masterProfile.contact.linkedin || ''}
                onChange={(e) => handleContactChange('linkedin', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Portfolio / Website</label>
              <input
                type="text"
                placeholder="e.g. https://myportfolio.dev"
                value={masterProfile.contact.portfolio || ''}
                onChange={(e) => handleContactChange('portfolio', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>
          </div>
        )}

        {activeSection === 'experience' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Work Experience ({masterProfile.experience?.length || 0})</h3>
              <button
                onClick={handleAddExperience}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>

            {(!masterProfile.experience || masterProfile.experience.length === 0) ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50/50">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No work experience added yet</p>
                <p className="text-[11px] text-slate-500">Import your resume or click "Add Position" above to start adding your career history.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {masterProfile.experience.map((exp) => (
                  <div key={exp.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => handleUpdateExperience(exp.id, { company: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Role / Title"
                        value={exp.role}
                        onChange={(e) => handleUpdateExperience(exp.id, { role: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Start Date"
                        value={exp.startDate}
                        onChange={(e) => handleUpdateExperience(exp.id, { startDate: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="End Date"
                        value={exp.endDate}
                        onChange={(e) => handleUpdateExperience(exp.id, { endDate: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      />
                    </div>

                    {/* Bullet points area */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Key Achievements & Bullet Points (one per line):</label>
                      <textarea
                        value={exp.achievements?.join('\n') || ''}
                        onChange={(e) => handleUpdateExperience(exp.id, { achievements: e.target.value.split('\n') })}
                        placeholder="• Architected microservices reducing latency by 45%&#10;• Led cross-functional team of 8 engineers"
                        className="w-full h-24 bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Position
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'skills' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Technical Skills (comma separated):</label>
              <textarea
                value={masterProfile.skills?.technical?.join(', ') || ''}
                onChange={(e) => onUpdateMasterProfile({
                  ...masterProfile,
                  skills: {
                    ...masterProfile.skills,
                    technical: e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : []
                  }
                })}
                placeholder="e.g. React, TypeScript, Python, Node.js, GraphQL, PostgreSQL"
                className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tools & Frameworks (comma separated):</label>
              <textarea
                value={masterProfile.skills?.toolsAndFrameworks?.join(', ') || ''}
                onChange={(e) => onUpdateMasterProfile({
                  ...masterProfile,
                  skills: {
                    ...masterProfile.skills,
                    toolsAndFrameworks: e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : []
                  }
                })}
                placeholder="e.g. Docker, Kubernetes, AWS, Git, Tailwind CSS, Next.js"
                className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Soft Skills & Leadership (comma separated):</label>
              <textarea
                value={masterProfile.skills?.soft?.join(', ') || ''}
                onChange={(e) => onUpdateMasterProfile({
                  ...masterProfile,
                  skills: {
                    ...masterProfile.skills,
                    soft: e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : []
                  }
                })}
                placeholder="e.g. Cross-Functional Leadership, Mentorship, Agile/Scrum, Problem Solving"
                className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Certifications & Credentials (comma separated):</label>
              <textarea
                value={masterProfile.skills?.certifications?.join(', ') || ''}
                onChange={(e) => onUpdateMasterProfile({
                  ...masterProfile,
                  skills: {
                    ...masterProfile.skills,
                    certifications: e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : []
                  }
                })}
                placeholder="e.g. AWS Certified Solutions Architect, Google Cloud Professional, PMP"
                className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        )}

        {activeSection === 'education' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Education & Degrees ({masterProfile.education?.length || 0})</h3>
              <button
                onClick={handleAddEducation}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Degree / Certificate</span>
              </button>
            </div>

            {(!masterProfile.education || masterProfile.education.length === 0) ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50/50">
                <GraduationCap className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No education entries added yet</p>
                <p className="text-[11px] text-slate-500">Click "Add Degree / Certificate" above to record your academic background.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {masterProfile.education.map((edu) => (
                  <div key={edu.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Institution</label>
                        <input
                          type="text"
                          placeholder="e.g. Stanford University"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = masterProfile.education.map(item => item.id === edu.id ? { ...item, institution: e.target.value } : item);
                            onUpdateMasterProfile({ ...masterProfile, education: updated });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Degree</label>
                        <input
                          type="text"
                          placeholder="e.g. Bachelor of Science"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = masterProfile.education.map(item => item.id === edu.id ? { ...item, degree: e.target.value } : item);
                            onUpdateMasterProfile({ ...masterProfile, education: updated });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Field of Study</label>
                        <input
                          type="text"
                          placeholder="e.g. Computer Science"
                          value={edu.fieldOfStudy}
                          onChange={(e) => {
                            const updated = masterProfile.education.map(item => item.id === edu.id ? { ...item, fieldOfStudy: e.target.value } : item);
                            onUpdateMasterProfile({ ...masterProfile, education: updated });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleRemoveEducation(edu.id)}
                        className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Education
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
