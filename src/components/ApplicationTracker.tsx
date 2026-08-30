import React, { useState } from 'react';
import { Calendar, Search, Filter, Plus, FileText, Mail, Target, Trash2, Edit2, ExternalLink, CheckCircle2, Clock, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { TailoredApplication, ApplicationStatus } from '../types';

interface ApplicationTrackerProps {
  applications: TailoredApplication[];
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDeleteApplication: (id: string) => void;
  onSelectApplicationForView: (app: TailoredApplication) => void;
  onOpenCalendarModal: (app: TailoredApplication) => void;
  googleToken: string | null;
  isPro?: boolean;
  onRequirePro?: () => void;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  onUpdateStatus,
  onUpdateNotes,
  onDeleteApplication,
  onSelectApplicationForView,
  onOpenCalendarModal,
  googleToken,
  isPro = false,
  onRequirePro
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  const statuses: ApplicationStatus[] = ['Saved', 'Applied', 'Interview Scheduled', 'Offer Received', 'Rejected'];

  // Calculate metrics
  const counts = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'Applied').length,
    interview: applications.filter(a => a.status === 'Interview Scheduled').length,
    offer: applications.filter(a => a.status === 'Offer Received').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
    avgAtsScore: applications.length > 0
      ? Math.round(applications.reduce((acc, a) => acc + (a.atsAnalysis?.score || 0), 0) / applications.length)
      : 0
  };

  // Filtered list
  const filteredApps = applications.filter(app => {
    const matchesSearch =
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeStyle = (s: ApplicationStatus) => {
    switch (s) {
      case 'Offer Received': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Interview Scheduled': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Applied': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Rejected': return 'bg-rose-50 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Free Tier Limit Banner */}
      {!isPro && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-white">Application Tracker Limit</span>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  {applications.length} / 5 Free Cards
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Free tier allows up to 5 tracking cards. Upgrade to Pro for unlimited application tracking.
              </p>
            </div>
          </div>

          <button
            onClick={onRequirePro}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shrink-0 shadow-sm"
          >
            Upgrade to Pro
          </button>
        </div>
      )}

      {/* Stats Pipeline Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Applications</span>
          <span className="text-2xl font-black text-slate-900">{counts.total}</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Avg ATS Score</span>
          <span className="text-2xl font-black text-indigo-600">{counts.avgAtsScore}%</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Applied</span>
          <span className="text-2xl font-black text-sky-600">{counts.applied}</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Interviews</span>
          <span className="text-2xl font-black text-indigo-600">{counts.interview}</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Offers Received</span>
          <span className="text-2xl font-black text-emerald-600">{counts.offer}</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Archived/Rejected</span>
          <span className="text-2xl font-black text-rose-600">{counts.rejected}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search role or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['All', ...statuses].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Cards List */}
      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <Target className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No applications match filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Use the 1-Click Tailor Studio to create and save tailored applications for your job hunt.
            </p>
          </div>
        ) : (
          filteredApps.map((app) => {
            const isExpanded = expandedAppId === app.id;
            return (
              <div
                key={app.id}
                className="bg-white border border-slate-200 hover:border-slate-300 transition-all rounded-2xl p-5 shadow-xs space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-black text-slate-900">{app.jobTitle}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeStyle(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-800">{app.companyName}</span>
                      <span>• {app.jobLocation}</span>
                      <span>• Created {app.dateCreated}</span>
                    </div>
                  </div>

                  {/* ATS Score & Action Dropdown */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                      <span className="text-xs text-slate-500">ATS Score:</span>
                      <span className="text-sm font-black text-indigo-600">{app.atsAnalysis?.score || 0}%</span>
                    </div>

                    <select
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                      className="bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => onDeleteApplication(app.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      title="Delete Application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Calendar & Notes Quick Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onOpenCalendarModal(app)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 font-semibold transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Google Calendar Sync</span>
                      {app.events?.length > 0 && (
                        <span className="ml-1 bg-indigo-600 text-white px-1.5 rounded-full font-bold">
                          {app.events.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => onSelectApplicationForView(app)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors border border-slate-300"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>View Tailored Application</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                    className="flex items-center space-x-1 text-slate-500 hover:text-slate-900 font-semibold"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'Expand Notes & Details'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Application Notes / Interview Preparation:</label>
                      <textarea
                        rows={2}
                        value={app.notes || ''}
                        onChange={(e) => onUpdateNotes(app.id, e.target.value)}
                        placeholder="Add notes, recruiter contacts, or interview round details..."
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    {app.events?.length > 0 && (
                      <div>
                        <span className="text-slate-600 font-semibold block mb-1">Scheduled Calendar Events:</span>
                        <div className="space-y-1.5">
                          {app.events.map((evt) => (
                            <div key={evt.id} className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between items-center text-slate-800">
                              <span>📅 <strong>{evt.title}</strong> — {new Date(evt.date).toLocaleString()}</span>
                              <span className="text-emerald-600 font-bold">Synced to Google</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
