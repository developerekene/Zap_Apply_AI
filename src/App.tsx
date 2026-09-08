import React, { useState, useEffect } from 'react';
import { ResumeData, TailoredApplication, ApplicationStatus } from './types';
import { emptyMasterProfile } from './mockData';
import { Navbar } from './components/Navbar';
import { OneClickGenerator } from './components/OneClickGenerator';
import { MasterProfileEditor } from './components/MasterProfileEditor';
import { AtsOptimizerView } from './components/AtsOptimizerView';
import { ApplicationTracker } from './components/ApplicationTracker';

export default function App() {
  // Master Profile State with LocalStorage persistence
  const [masterProfile, setMasterProfile] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('zap_master_profile_clean');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (e) {
        return emptyMasterProfile;
      }
    }
    // Clean legacy storage keys
    try {
      localStorage.removeItem('zap_master_profile');
      localStorage.removeItem('zap_master_profile_v2');
      localStorage.removeItem('zap_is_pro');
      localStorage.removeItem('zap_free_downloads');
      localStorage.removeItem('zap_google_token');
    } catch (e) {}
    return emptyMasterProfile;
  });

  // Applications Tracker State
  const [applications, setApplications] = useState<TailoredApplication[]>(() => {
    const saved = localStorage.getItem('zap_applications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((a: any) => a.id !== 'app-sample-1');
        }
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Navigation & Active Application View
  const [activeTab, setActiveTab] = useState<string>('generator');
  const [activeGeneratedApp, setActiveGeneratedApp] = useState<TailoredApplication | null>(null);

  // Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('zap_master_profile_clean', JSON.stringify(masterProfile));
  }, [masterProfile]);

  useEffect(() => {
    localStorage.setItem('zap_applications', JSON.stringify(applications));
  }, [applications]);

  // 1-Click Tailor Application AI Generator
  const handleGenerateTailoredApp = async (payload: {
    jobDescription: string;
    jobTitle?: string;
    companyName?: string;
    jobLocation?: string;
    customPrompt?: string;
  }): Promise<TailoredApplication | null> => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/tailor-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterProfile,
          jobDescription: payload.jobDescription,
          jobTitle: payload.jobTitle,
          companyName: payload.companyName,
          customPrompt: payload.customPrompt
        })
      });

      const responseData = await res.json();
      if (!res.ok || !responseData.success) {
        throw new Error(responseData.error || 'Server error while tailoring application.');
      }

      const { tailoredResume, coverLetter, personalStatement, atsAnalysis, extractedJobTitle, extractedCompanyName, extractedJobLocation } = responseData.data;

      const finalJobTitle = payload.jobTitle || extractedJobTitle || 'Target Position';
      const rawCompany = (payload.companyName || extractedCompanyName || '').trim();
      const finalCompanyName = (rawCompany === 'Target Company' || rawCompany === 'Hiring Company') ? '' : rawCompany;
      const finalJobLocation = payload.jobLocation || extractedJobLocation || 'Remote / Hybrid';

      const newApp: TailoredApplication = {
        id: `app-${Date.now()}`,
        jobTitle: finalJobTitle,
        companyName: finalCompanyName,
        jobLocation: finalJobLocation,
        rawJobDescription: payload.jobDescription,
        dateCreated: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        status: 'Saved',
        notes: '',
        tailoredResume,
        coverLetter,
        personalStatement,
        atsAnalysis
      };

      setActiveGeneratedApp(newApp);
      // Auto save to applications list
      setApplications(prev => [newApp, ...prev.filter(a => a.id !== newApp.id)]);
      return newApp;
    } catch (err: any) {
      console.error('Tailor application error:', err);
      alert('Failed to generate tailored application: ' + err.message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Parse Resume (PDF or raw text) with Gemini AI
  const handleParseResumeData = async (payload: {
    rawText?: string;
    fileBase64?: string;
    fileMimeType?: string;
    fileName?: string;
    fileSize?: string;
  }) => {
    setIsParsing(true);
    try {
      const res = await fetch('/api/gemini/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: payload.rawText,
          fileBase64: payload.fileBase64,
          fileMimeType: payload.fileMimeType
        })
      });

      const responseData = await res.json();
      if (!res.ok || !responseData.success) {
        throw new Error(responseData.error || 'Failed to parse resume text.');
      }

      const parsedResume: ResumeData = {
        ...responseData.data,
        attachedCvFileName: payload.fileName || (payload.fileBase64 ? 'Uploaded_CV.pdf' : (payload.rawText ? 'Imported Resume Text' : undefined)),
        attachedCvDate: new Date().toLocaleDateString(),
        attachedCvSize: payload.fileSize || ''
      };
      setMasterProfile(parsedResume);
      alert('Resume parsed successfully! Your Master Candidate Profile and attached CV have been loaded.');
    } catch (err: any) {
      console.error('Parse resume error:', err);
      alert('Error parsing resume: ' + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  // Application tracker handlers
  const handleUpdateStatus = (id: string, newStatus: ApplicationStatus) => {
    setApplications(prev =>
      prev.map(a => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setApplications(prev =>
      prev.map(a => (a.id === id ? { ...a, notes } : a))
    );
  };

  const handleDeleteApplication = (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      setApplications(prev => prev.filter(a => a.id !== id));
      if (activeGeneratedApp?.id === id) {
        setActiveGeneratedApp(null);
      }
    }
  };

  const handleResetProfile = async () => {
    setMasterProfile(emptyMasterProfile);
    localStorage.setItem('zap_master_profile_clean', JSON.stringify(emptyMasterProfile));
    localStorage.removeItem('zap_master_profile');
    localStorage.removeItem('zap_master_profile_v2');
  };

  const handleSelectApplicationForView = (app: TailoredApplication) => {
    setActiveGeneratedApp(app);
    setActiveTab('generator');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalApplicationsCount={applications.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'generator' && (
          <OneClickGenerator
            masterProfile={masterProfile}
            onGenerateTailoredApp={handleGenerateTailoredApp}
            isGenerating={isGenerating}
            activeGeneratedApp={activeGeneratedApp}
            onSaveToTracker={(app) => {
              setApplications(prev => [app, ...prev.filter(a => a.id !== app.id)]);
            }}
            onGoToProfile={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'profile' && (
          <MasterProfileEditor
            masterProfile={masterProfile}
            onUpdateMasterProfile={setMasterProfile}
            onParseResumeRawText={handleParseResumeData}
            isParsing={isParsing}
            onResetProfile={handleResetProfile}
          />
        )}

        {activeTab === 'ats' && activeGeneratedApp && (
          <AtsOptimizerView
            atsAnalysis={activeGeneratedApp.atsAnalysis}
            jobTitle={activeGeneratedApp.jobTitle}
            companyName={activeGeneratedApp.companyName}
            onAddKeywordToResume={(kw) => {
              if (!masterProfile.skills.technical.includes(kw)) {
                setMasterProfile({
                  ...masterProfile,
                  skills: {
                    ...masterProfile.skills,
                    technical: [...masterProfile.skills.technical, kw]
                  }
                });
                alert(`Added keyword "${kw}" to Master Technical Skills.`);
              }
            }}
          />
        )}

        {activeTab === 'ats' && !activeGeneratedApp && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900">No Application Selected for ATS Audit</h3>
            <p className="text-xs text-slate-500">
              Paste a job description in the 1-Click Tailor Studio to run an ATS keyword optimization report.
            </p>
          </div>
        )}

        {activeTab === 'tracker' && (
          <ApplicationTracker
            applications={applications}
            onUpdateStatus={handleUpdateStatus}
            onUpdateNotes={handleUpdateNotes}
            onDeleteApplication={handleDeleteApplication}
            onSelectApplicationForView={handleSelectApplicationForView}
          />
        )}
      </main>
    </div>
  );
}
