import React, { useState, useEffect } from 'react';
import { ResumeData, TailoredApplication, ApplicationStatus } from './types';
import { initialMasterProfile, sampleApplications } from './mockData';
import { Navbar } from './components/Navbar';
import { OneClickGenerator } from './components/OneClickGenerator';
import { MasterProfileEditor } from './components/MasterProfileEditor';
import { AtsOptimizerView } from './components/AtsOptimizerView';
import { ApplicationTracker } from './components/ApplicationTracker';
import { GoogleCalendarSyncModal } from './components/GoogleCalendarSyncModal';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { requestGoogleCalendarToken } from './lib/googleAuth';

export default function App() {
  // Pro Subscription State
  const [isPro, setIsPro] = useState<boolean>(() => {
    return localStorage.getItem('zap_is_pro') === 'true';
  });

  // Free Downloads Counter
  const [freeDownloadsCount, setFreeDownloadsCount] = useState<number>(() => {
    return Number(localStorage.getItem('zap_free_downloads') || '0');
  });

  // Pro Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Master Profile State with LocalStorage persistence
  const [masterProfile, setMasterProfile] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('zap_master_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.contact?.fullName === 'Alex Morgan') {
          return initialMasterProfile;
        }
        return parsed;
      } catch (e) {
        return initialMasterProfile;
      }
    }
    return initialMasterProfile;
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

  // Google OAuth Calendar State
  const [googleToken, setGoogleToken] = useState<string | null>(() => {
    return localStorage.getItem('zap_google_token') || null;
  });
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  // Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Calendar Modal State
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [selectedAppForCalendar, setSelectedAppForCalendar] = useState<TailoredApplication | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('zap_is_pro', String(isPro));
  }, [isPro]);

  useEffect(() => {
    localStorage.setItem('zap_free_downloads', String(freeDownloadsCount));
  }, [freeDownloadsCount]);

  useEffect(() => {
    localStorage.setItem('zap_master_profile', JSON.stringify(masterProfile));
  }, [masterProfile]);

  useEffect(() => {
    localStorage.setItem('zap_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    if (googleToken) {
      localStorage.setItem('zap_google_token', googleToken);
    } else {
      localStorage.removeItem('zap_google_token');
    }
  }, [googleToken]);

  const handleOpenUpgradeModal = () => {
    setIsUpgradeModalOpen(true);
  };

  const handlePaymentSuccess = (transactionRef: string, plan: 'weekly' | 'monthly' | 'quarterly', email: string) => {
    setIsPro(true);
    setIsUpgradeModalOpen(false);
    alert(`🎉 Payment Successful! Welcome to Zap.AI Pro (${plan.toUpperCase()} Plan). Transaction Ref: ${transactionRef}`);
  };

  const handleIncrementDownloadCount = () => {
    setFreeDownloadsCount(prev => prev + 1);
  };

  // Connect Google Calendar via OAuth
  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    try {
      const token = await requestGoogleCalendarToken();
      setGoogleToken(token);
    } catch (err: any) {
      console.error('Failed to connect Google Calendar:', err);
      alert('Google Calendar Connection: ' + (err.message || 'Error authorizing calendar access.'));
    } finally {
      setIsConnectingGoogle(false);
    }
  };

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
        atsAnalysis,
        events: []
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
  const handleParseResumeData = async (payload: { rawText?: string; fileBase64?: string; fileMimeType?: string }) => {
    setIsParsing(true);
    try {
      const res = await fetch('/api/gemini/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();
      if (!res.ok || !responseData.success) {
        throw new Error(responseData.error || 'Failed to parse resume text.');
      }

      const parsedResume: ResumeData = responseData.data;
      setMasterProfile(parsedResume);
      alert('Resume parsed successfully! Your Master Candidate Profile has been populated.');
    } catch (err: any) {
      console.error('Parse resume error:', err);
      alert('Error parsing resume: ' + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  // Google Calendar Event Creator
  const handleAddCalendarEvent = async (
    appId: string,
    eventData: {
      title: string;
      date: string;
      type: 'Interview' | 'Follow-up' | 'Assessment';
      notes?: string;
    }
  ) => {
    if (!googleToken) {
      alert('Please connect Google Calendar first.');
      return;
    }

    const app = applications.find(a => a.id === appId);

    const res = await fetch('/api/calendar/create-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${googleToken}`
      },
      body: JSON.stringify({
        title: eventData.title,
        date: eventData.date,
        notes: eventData.notes,
        companyName: app?.companyName || 'Job Application',
        type: eventData.type
      })
    });

    const resJson = await res.json();
    if (!res.ok || !resJson.success) {
      throw new Error(resJson.error || 'Failed to add event to Google Calendar.');
    }

    const newCalendarEvent = {
      id: `evt-${Date.now()}`,
      calendarEventId: resJson.eventId,
      title: eventData.title,
      date: eventData.date,
      type: eventData.type,
      notes: eventData.notes,
      syncedToGoogle: true
    };

    // Update state
    setApplications(prev =>
      prev.map(a => {
        if (a.id === appId) {
          const updatedEvents = [...(a.events || []), newCalendarEvent];
          // If scheduling an interview, auto upgrade status to "Interview Scheduled"
          const updatedStatus = eventData.type === 'Interview' ? 'Interview Scheduled' : a.status;
          return { ...a, events: updatedEvents, status: updatedStatus };
        }
        return a;
      })
    );

    if (activeGeneratedApp && activeGeneratedApp.id === appId) {
      setActiveGeneratedApp({
        ...activeGeneratedApp,
        events: [...(activeGeneratedApp.events || []), newCalendarEvent],
        status: eventData.type === 'Interview' ? 'Interview Scheduled' : activeGeneratedApp.status
      });
    }

    alert(`Successfully synced event "${eventData.title}" to Google Calendar!`);
    setCalendarModalOpen(false);
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

  const handleResetProfile = () => {
    if (confirm('Are you sure you want to clear your Master Candidate Profile?')) {
      setMasterProfile(initialMasterProfile);
      localStorage.removeItem('zap_master_profile');
    }
  };

  const handleSelectApplicationForView = (app: TailoredApplication) => {
    setActiveGeneratedApp(app);
    setActiveTab('generator');
  };

  const handleOpenCalendarModal = (app: TailoredApplication) => {
    setSelectedAppForCalendar(app);
    setCalendarModalOpen(true);
  };

  const upcomingInterviewsCount = applications.filter(a => a.status === 'Interview Scheduled').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        googleUser={null}
        googleToken={googleToken}
        onConnectGoogle={handleConnectGoogle}
        isConnectingGoogle={isConnectingGoogle}
        totalApplicationsCount={applications.length}
        upcomingInterviewsCount={upcomingInterviewsCount}
        isPro={isPro}
        onOpenUpgradeModal={handleOpenUpgradeModal}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'generator' && (
          <OneClickGenerator
            masterProfile={masterProfile}
            onGenerateTailoredApp={handleGenerateTailoredApp}
            isGenerating={isGenerating}
            activeGeneratedApp={activeGeneratedApp}
            onSaveToTracker={(app) => {
              if (!isPro && applications.length >= 5 && !applications.some(a => a.id === app.id)) {
                handleOpenUpgradeModal();
                alert('Free tier limit: You can track up to 5 job application cards. Upgrade to Pro for unlimited application tracking.');
                return;
              }
              setApplications(prev => [app, ...prev.filter(a => a.id !== app.id)]);
            }}
            onOpenCalendarSchedule={handleOpenCalendarModal}
            onGoToProfile={() => setActiveTab('profile')}
            isPro={isPro}
            freeDownloadsCount={freeDownloadsCount}
            onIncrementDownloadCount={handleIncrementDownloadCount}
            onRequirePro={handleOpenUpgradeModal}
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
            isPro={isPro}
            onRequirePro={handleOpenUpgradeModal}
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
            onOpenCalendarModal={handleOpenCalendarModal}
            googleToken={googleToken}
            isPro={isPro}
            onRequirePro={handleOpenUpgradeModal}
          />
        )}
      </main>

      {/* Google Calendar Event Modal */}
      <GoogleCalendarSyncModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        application={selectedAppForCalendar}
        googleToken={googleToken}
        onConnectGoogle={handleConnectGoogle}
        onAddCalendarEvent={handleAddCalendarEvent}
        isPro={isPro}
        onRequirePro={handleOpenUpgradeModal}
      />

      {/* Pro Upgrade & Paystack Checkout Modal */}
      <ProUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
