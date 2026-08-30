import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, X, Sparkles, ExternalLink, Lock, Crown, ArrowRight, Download, Mail, Check } from 'lucide-react';
import { TailoredApplication } from '../types';
import { generateGoogleCalendarUrl, downloadICSFile } from '../lib/googleAuth';

interface GoogleCalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: TailoredApplication | null;
  googleToken: string | null;
  onConnectGoogle: () => void;
  onAddCalendarEvent: (appId: string, event: {
    title: string;
    date: string;
    type: 'Interview' | 'Follow-up' | 'Assessment';
    notes?: string;
  }) => Promise<void>;
  isPro?: boolean;
  onRequirePro?: () => void;
  profileEmail?: string;
}

export const GoogleCalendarSyncModal: React.FC<GoogleCalendarSyncModalProps> = ({
  isOpen,
  onClose,
  application,
  googleToken,
  onConnectGoogle,
  onAddCalendarEvent,
  isPro = false,
  onRequirePro,
  profileEmail = ''
}) => {
  if (!isOpen || !application) return null;

  const [eventType, setEventType] = useState<'Interview' | 'Follow-up' | 'Assessment'>('Interview');
  const [eventTitle, setEventTitle] = useState(
    `Interview with ${application.companyName} (${application.jobTitle})`
  );
  // Default date: tomorrow at 10:00 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const [eventDate, setEventDate] = useState(tomorrow.toISOString().slice(0, 16));
  const [eventNotes, setEventNotes] = useState(
    `Target Role: ${application.jobTitle}\nCompany: ${application.companyName}\nATS Score: ${application.atsAnalysis.score}%\nNotes: Review technical resume and project achievements.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successEvent, setSuccessEvent] = useState<{
    title: string;
    date: string;
    notes?: string;
    type: string;
    webUrl: string;
  } | null>(null);

  const handleTypeChange = (type: 'Interview' | 'Follow-up' | 'Assessment') => {
    setEventType(type);
    if (type === 'Interview') {
      setEventTitle(`Interview with ${application.companyName} (${application.jobTitle})`);
    } else if (type === 'Follow-up') {
      setEventTitle(`Follow up with recruiter at ${application.companyName}`);
    } else {
      setEventTitle(`Technical Assessment for ${application.companyName}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onAddCalendarEvent(application.id, {
        title: eventTitle,
        date: eventDate,
        type: eventType,
        notes: eventNotes
      });

      const webUrl = generateGoogleCalendarUrl({
        title: eventTitle,
        date: eventDate,
        type: eventType,
        notes: eventNotes,
        companyName: application.companyName,
        candidateEmail: profileEmail
      });

      setSuccessEvent({
        title: eventTitle,
        date: eventDate,
        notes: eventNotes,
        type: eventType,
        webUrl
      });
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleDirectGCalOpen = () => {
    const url = generateGoogleCalendarUrl({
      title: eventTitle,
      date: eventDate,
      type: eventType,
      notes: eventNotes,
      companyName: application.companyName,
      candidateEmail: profileEmail
    });
    window.open(url, '_blank');
  };

  const handleDownloadICS = () => {
    downloadICSFile({
      title: eventTitle,
      date: eventDate,
      notes: eventNotes,
      companyName: application.companyName,
      candidateEmail: profileEmail
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Google Calendar Sync</h3>
              <p className="text-xs text-slate-500 font-medium">{application.companyName} — {application.jobTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connected Email Badge */}
        {profileEmail && (
          <div className="bg-indigo-50/70 border border-indigo-200/60 rounded-2xl px-3.5 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-indigo-950 font-medium truncate">
              <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="truncate">Profile Email: <strong className="font-bold">{profileEmail}</strong></span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
              <Check className="w-3 h-3" /> Linked
            </span>
          </div>
        )}

        {successEvent ? (
          <div className="text-center space-y-4 py-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">Event Synced Successfully!</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                <strong>{successEvent.title}</strong> has been added to your Zap.AI tracker and scheduled for <strong>{new Date(successEvent.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</strong>.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={successEvent.webUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Google Calendar ({profileEmail || 'Google Account'})</span>
              </a>

              <button
                type="button"
                onClick={handleDownloadICS}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Download iCal File (.ics for Outlook/Apple/Google)</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Close & Return to Application
              </button>
            </div>
          </div>
        ) : !isPro ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg">
              <Crown className="w-6 h-6 fill-white text-white" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">Google Calendar Sync is a Pro Feature</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                Automatically schedule interview rounds, assessment deadlines, and recruiter follow-ups directly to your Google Calendar linked to <strong>{profileEmail || 'your profile'}</strong>.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                if (onRequirePro) onRequirePro();
              }}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 fill-white text-white" />
              <span>Upgrade to Pro to Sync Calendar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : !googleToken ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Connect Google Calendar</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                Link with <strong className="text-slate-900">{profileEmail || 'your Google account'}</strong> to automatically schedule interview rounds, technical tests, and recruiter reminders.
              </p>
            </div>
            <button
              type="button"
              onClick={onConnectGoogle}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-colors shadow-md flex items-center justify-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Connect Google Account ({profileEmail || 'Candidate Profile'})</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Event Type Toggle */}
            <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              {(['Interview', 'Follow-up', 'Assessment'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    eventType === t ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Summary</label>
              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notes & Candidate Details</label>
              <textarea
                rows={3}
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleDirectGCalOpen}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>1-Click GCal Link</span>
              </button>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-md disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Syncing...' : 'Sync to Google Calendar'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
