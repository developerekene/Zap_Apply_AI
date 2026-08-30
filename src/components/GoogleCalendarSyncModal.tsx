import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, X, Sparkles, ExternalLink, Lock, Crown, ArrowRight } from 'lucide-react';
import { TailoredApplication } from '../types';

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
}

export const GoogleCalendarSyncModal: React.FC<GoogleCalendarSyncModalProps> = ({
  isOpen,
  onClose,
  application,
  googleToken,
  onConnectGoogle,
  onAddCalendarEvent,
  isPro = false,
  onRequirePro
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
  const [successLink, setSuccessLink] = useState<string | null>(null);

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
    setSuccessLink(null);

    try {
      await onAddCalendarEvent(application.id, {
        title: eventTitle,
        date: eventDate,
        type: eventType,
        notes: eventNotes
      });
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Google Calendar Sync</h3>
              <p className="text-xs text-slate-500">{application.companyName} — {application.jobTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isPro ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg">
              <Crown className="w-6 h-6 fill-white text-white" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">Google Calendar Sync is a Pro Feature</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                Automatically schedule interview rounds, assessment deadlines, and recruiter follow-ups directly to your Google Calendar.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                if (onRequirePro) onRequirePro();
              }}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 fill-white text-white" />
              <span>Upgrade to Pro to Sync Calendar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : !googleToken ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-3">
            <Calendar className="w-10 h-10 text-indigo-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">Connect Google Calendar</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Sync interview invitations and follow-up reminders directly to your Google Calendar for seamless scheduling.
            </p>
            <button
              onClick={onConnectGoogle}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-colors shadow-sm"
            >
              Connect Google Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Event Type Toggle */}
            <div className="flex space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              {(['Interview', 'Follow-up', 'Assessment'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    eventType === t ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Summary</label>
              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes & Details</label>
              <textarea
                rows={3}
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-300"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Syncing to Google...' : 'Add to Google Calendar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
