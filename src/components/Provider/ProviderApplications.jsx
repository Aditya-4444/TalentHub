import React, { useState } from 'react';
import { Mail, Calendar, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Filter, Sparkles, Inbox, FileText, X, Phone, Printer } from 'lucide-react';
import { db } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function ProviderApplications({ jobs, applications, filterJobId, setFilterJobId, onStatusChangeSuccess, seekerProfiles = {} }) {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [selectedSyncedResume, setSelectedSyncedResume] = useState(null);

  const handleStatusUpdate = async (appId, currentStatus, newStatus) => {
    try {
      const appRef = doc(db, 'applications', appId);
      await updateDoc(appRef, { status: newStatus });
      if (onStatusChangeSuccess) {
        onStatusChangeSuccess(`Applicant marked as ${newStatus}!`);
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Error updating applicant status. Please try again.");
    }
  };

  const handleToggleExpand = async (appId, status) => {
    if (expandedAppId === appId) {
      setExpandedAppId(null);
    } else {
      setExpandedAppId(appId);
      // Automatically transition from "Pending" to "Reviewed" when opened
      if (status === 'Pending') {
        try {
          const appRef = doc(db, 'applications', appId);
          await updateDoc(appRef, { status: 'Reviewed' });
        } catch (error) {
          console.error("Error setting status to Reviewed:", error);
        }
      }
    }
  };

  const handleViewResume = (resume) => {
    if (!resume || !resume.data) return;
    
    try {
      // Create a temporary link and trigger download/tab open
      const link = document.createElement('a');
      link.href = resume.data;
      link.download = resume.name || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error opening resume:", error);
      alert("Could not open resume. File data is invalid.");
    }
  };

  // Filtered applications list
  const filteredApplications = applications.filter((app) => {
    const matchesJob = filterJobId === 'All' || app.jobId === filterJobId;
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
    return matchesJob && matchesStatus;
  });

  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-badge-remote-bg text-badge-remote-text border border-amber-300/30';
      case 'Reviewed':
        return 'bg-badge-dept-bg text-badge-dept-text border border-primary-avocado/20';
      case 'Shortlisted':
        return 'bg-badge-ft-bg text-badge-ft-text border border-primary-avocado/30';
      case 'Rejected':
        return 'bg-red-50 text-danger-reject border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold font-serif text-body-text">Candidate Applications</h2>
        <p className="text-muted-text text-sm mt-1">Review and process submissions from job seekers.</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-border-divider rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 text-sm font-semibold text-body-text w-full md:w-auto">
          <Filter size={16} className="text-primary-avocado" />
          <span>Filters</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto md:flex md:flex-row md:items-center">
          {/* Job Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="jobFilterSelect" className="text-xs font-semibold text-muted-text whitespace-nowrap">Filter by Job:</label>
            <select
              id="jobFilterSelect"
              value={filterJobId}
              onChange={(e) => setFilterJobId(e.target.value)}
              className="text-xs font-semibold border border-border-divider/70 focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-3 py-2 bg-white min-w-[160px]"
            >
              <option value="All">All Jobs</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="statusFilterSelect" className="text-xs font-semibold text-muted-text whitespace-nowrap">Filter by Status:</label>
            <select
              id="statusFilterSelect"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-semibold border border-border-divider/70 focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-3 py-2 bg-white min-w-[140px]"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white border border-border-divider rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs">
          <div className="p-4 bg-badge-remote-bg/40 text-badge-remote-text rounded-full">
            <Inbox size={40} className="stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-body-text">No applications match</h3>
            <p className="text-sm text-muted-text max-w-sm">
              Try modifying your active filter parameters or post additional listings.
            </p>
          </div>
          {(filterJobId !== 'All' || filterStatus !== 'All') && (
            <button
              onClick={() => { setFilterJobId('All'); setFilterStatus('All'); }}
              className="text-xs font-semibold py-2 px-4 border border-primary-avocado text-primary-avocado hover:bg-badge-dept-bg/25 rounded-xl transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const isExpanded = expandedAppId === app.id;
            return (
              <div 
                key={app.id}
                className="bg-white border border-border-divider rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow"
              >
                {/* Header Section */}
                <div 
                  onClick={() => handleToggleExpand(app.id, app.status)}
                  className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-panel-bg/15 select-none"
                >
                  {(() => {
                    const seekerProfile = seekerProfiles[app.seekerId] || {};
                    const seekerPlan = seekerProfile.plan || 'free';
                    const seekerPhotoURL = seekerProfile.photoURL || '';
                    return (
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Seeker Avatar */}
                        {seekerPhotoURL ? (
                          <img 
                            src={seekerPhotoURL} 
                            alt={app.seekerName} 
                            className={`w-11 h-11 rounded-full object-cover shrink-0 shadow-2xs ${
                              seekerPlan === 'gold' ? 'border-2 border-gold-glow' :
                              seekerPlan === 'silver' ? 'border-2 border-silver-glow' :
                              'border border-primary-avocado/30'
                            }`}
                          />
                        ) : (
                          <div className={`w-11 h-11 rounded-full bg-badge-dept-bg text-badge-dept-text flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                            seekerPlan === 'gold' ? 'border-2 border-gold-glow' :
                            seekerPlan === 'silver' ? 'border-2 border-silver-glow' :
                            'border border-primary-avocado/20'
                          }`}>
                            {getInitials(app.seekerName)}
                          </div>
                        )}
                        
                        <div className="space-y-1.5 flex-1 min-w-0 text-left">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="text-base font-bold text-body-text">{app.seekerName}</strong>
                            {seekerPlan === 'gold' && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8.5px] font-bold bg-gold-metallic text-white border border-gold-glow select-none">
                                <Sparkles size={8.5} className="fill-white" />
                                Gold Member
                              </span>
                            )}
                            {seekerPlan === 'silver' && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8.5px] font-bold bg-silver-metallic text-body-text border border-silver-glow select-none">
                                <Sparkles size={8.5} className="fill-body-text" />
                                Silver Member
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeStyles(app.status)}`}>
                              {app.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-text">
                            <span className="flex items-center gap-1">
                              <Mail size={13} className="text-primary-avocado" />
                              {app.seekerEmail}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={13} className="text-primary-avocado" />
                              Applied on {formatDate(app.appliedAt)}
                            </span>
                          </div>
                          
                          <div className="text-xs font-medium text-body-text">
                            Role applied: <span className="text-primary-avocado font-semibold">{app.jobTitle}</span> ({app.company})
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t border-border-divider/20 sm:border-none pt-3 sm:pt-0">
                    <span className="text-xs text-primary-avocado font-semibold sm:hidden">Click card to review details</span>
                    {isExpanded ? <ChevronUp size={18} className="text-muted-text" /> : <ChevronDown size={18} className="text-muted-text" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-border-divider/30 bg-panel-bg/10 space-y-4 animate-slide-in">
                    
                    {/* Cover Note Section */}
                    <div className="space-y-1.5 text-left">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-text">Applicant Cover Note</h4>
                      <p className="text-sm text-body-text bg-white border border-border-divider/50 p-4 rounded-xl whitespace-pre-wrap leading-relaxed">
                        {app.coverNote || "No cover note was provided with this application."}
                      </p>
                    </div>

                    {/* Resume Attachment Section */}
                    {app.resume && (
                      <div className="space-y-1.5 text-left animate-fade-in">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-text">Attached Resume</h4>
                        <div className="bg-white border border-border-divider/50 p-4 rounded-xl flex items-center justify-between shadow-2xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2.5 rounded-xl border shrink-0 ${
                              app.resume.type === 'synced' 
                                ? 'bg-primary-avocado/10 text-primary-hover border-primary-avocado/15' 
                                : 'bg-red-50 text-red-500 border-red-100'
                            }`}>
                              <FileText size={20} />
                            </div>
                            <div className="text-left min-w-0">
                              <p className="text-xs font-bold text-body-text truncate max-w-md">{app.resume.name}</p>
                              <p className="text-[10px] text-muted-text font-medium">
                                {app.resume.type === 'synced' ? 'Built & Synced via TalentHub' : 'Attached document file'}
                              </p>
                            </div>
                          </div>
                          {app.resume.type === 'synced' ? (
                            <button
                              onClick={() => setSelectedSyncedResume(app.resume.syncedDetails)}
                              className="px-4 py-2 bg-primary-avocado hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-2xs hover:shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              View Synced Resume
                            </button>
                          ) : (
                            <button
                              onClick={() => handleViewResume(app.resume)}
                              className="px-4 py-2 bg-primary-avocado hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-2xs hover:shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              View Resume
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Controls */}
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-border-divider/20 items-center justify-between">
                      <span className="text-[11px] text-muted-text flex items-center gap-1.5">
                        <Clock size={12} className="text-primary-avocado" />
                        Status updates notify candidate immediately.
                      </span>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(app.id, app.status, 'Rejected');
                          }}
                          disabled={app.status === 'Rejected'}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2 px-4 border border-red-200 hover:border-danger-reject text-danger-reject hover:bg-red-50 disabled:opacity-40 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                        >
                          <XCircle size={14} />
                          Reject Candidate
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(app.id, app.status, 'Shortlisted');
                          }}
                          disabled={app.status === 'Shortlisted'}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2 px-4 bg-primary-avocado hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
                        >
                          <CheckCircle size={14} />
                          Shortlist Candidate
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Synced Resume Viewer Modal */}
      {selectedSyncedResume && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in print:bg-white print:p-0">
          
          {/* Main Card */}
          <div className="relative w-full max-w-2xl bg-white border border-border-divider rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between animate-scale-up print:hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-divider/50 flex items-center justify-between bg-panel-bg/40 shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary-avocado" />
                <h3 className="text-sm font-bold text-body-text">Applicant Synced Resume Viewer</h3>
              </div>
              <button 
                onClick={() => setSelectedSyncedResume(null)}
                className="p-1 text-muted-text hover:text-body-text rounded-full hover:bg-page-bg transition-colors"
                aria-label="Close resume viewer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable content pane */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-100/35 flex justify-center min-h-0">
              <div 
                className={`w-full max-w-[520px] bg-white border border-zinc-200 shadow-md p-6 sm:p-8 text-left font-sans flex flex-col justify-between overflow-y-auto leading-normal ${
                  selectedSyncedResume.template === 'avocado' ? 'border-t-8 border-t-primary-avocado' : 
                  selectedSyncedResume.template === 'executive' ? 'border-l-8 border-l-stone-700' : ''
                }`}
              >
                <div>
                  {/* Name / Title */}
                  <div className="space-y-1 pb-4.5 border-b border-zinc-200">
                    <h1 className={`text-xl font-extrabold tracking-tight ${
                      selectedSyncedResume.template === 'avocado' ? 'text-primary-hover' : 'text-zinc-800'
                    }`}>
                      {selectedSyncedResume.name || 'Candidate Name'}
                    </h1>
                    <p className={`text-xs font-bold ${
                      selectedSyncedResume.template === 'avocado' ? 'text-primary-avocado' : 'text-zinc-650'
                    }`}>
                      {selectedSyncedResume.title || 'Professional Title'}
                    </p>
                    
                    {/* Contact info */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-500 font-semibold pt-1">
                      {selectedSyncedResume.email && <span className="flex items-center gap-0.5"><Mail size={10} /> {selectedSyncedResume.email}</span>}
                      {selectedSyncedResume.phone && <span className="flex items-center gap-0.5"><Phone size={10} /> {selectedSyncedResume.phone}</span>}
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    {/* Summary */}
                    {selectedSyncedResume.summary && (
                      <div className="space-y-1">
                        <h3 className={`text-[10px] font-bold uppercase tracking-wider ${
                          selectedSyncedResume.template === 'avocado' ? 'text-primary-hover' : 'text-zinc-855'
                        }`}>
                          Professional Summary
                        </h3>
                        <p className="text-[10px] text-zinc-650 leading-relaxed font-medium">
                          {selectedSyncedResume.summary}
                        </p>
                      </div>
                    )}

                    {/* Skills */}
                    {selectedSyncedResume.skills && (
                      <div className="space-y-1.5">
                        <h3 className={`text-[10px] font-bold uppercase tracking-wider ${
                          selectedSyncedResume.template === 'avocado' ? 'text-primary-hover' : 'text-zinc-855'
                        }`}>
                          Core Skills
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {selectedSyncedResume.skills.split(',').map((skill, idx) => (
                            <span key={idx} className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                              selectedSyncedResume.template === 'avocado' 
                                ? 'bg-primary-avocado/10 text-primary-hover' 
                                : 'bg-zinc-100 text-zinc-700'
                            }`}>
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {selectedSyncedResume.experience && selectedSyncedResume.experience.length > 0 && (
                      <div className="space-y-2">
                        <h3 className={`text-[10px] font-bold uppercase tracking-wider ${
                          selectedSyncedResume.template === 'avocado' ? 'text-primary-hover' : 'text-zinc-855'
                        }`}>
                          Professional Experience
                        </h3>
                        <div className="space-y-3">
                          {selectedSyncedResume.experience.map((exp, idx) => (
                            <div key={idx} className="space-y-0.5">
                              <div className="flex justify-between items-baseline">
                                <span className="text-[10px] font-bold text-zinc-800">{exp.role || 'Role'}</span>
                                <span className="text-[9px] text-zinc-500 font-semibold">{exp.duration}</span>
                              </div>
                              <div className="text-[9px] font-bold text-zinc-650">{exp.company || 'Company'}</div>
                              <p className="text-[9px] text-zinc-500 leading-relaxed font-medium">{exp.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {selectedSyncedResume.education && selectedSyncedResume.education.length > 0 && (
                      <div className="space-y-2">
                        <h3 className={`text-[10px] font-bold uppercase tracking-wider ${
                          selectedSyncedResume.template === 'avocado' ? 'text-primary-hover' : 'text-zinc-855'
                        }`}>
                          Education
                        </h3>
                        <div className="space-y-2">
                          {selectedSyncedResume.education.map((edu, idx) => (
                            <div key={idx} className="flex justify-between items-start">
                              <div className="text-[9px]">
                                <span className="font-bold text-zinc-800">{edu.degree || 'Degree'}</span>
                                <span className="text-zinc-400 mx-1">•</span>
                                <span className="text-zinc-600 font-semibold">{edu.school || 'School'}</span>
                              </div>
                              <span className="text-[9px] text-zinc-500 font-semibold">{edu.year}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Stamp */}
                <div className="text-[8px] text-center text-zinc-400 mt-6 pt-2 border-t border-zinc-100 flex items-center justify-between shrink-0 font-medium">
                  <span>TalentHub Synced Resume Submission</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4.5 border-t border-border-divider/40 bg-panel-bg/25 flex justify-end gap-2.5 shrink-0">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-border-divider hover:bg-white text-xs font-bold rounded-xl text-body-text transition-colors flex items-center gap-1 cursor-pointer shadow-3xs"
              >
                <Printer size={13} /> Export/Print
              </button>
              <button
                onClick={() => setSelectedSyncedResume(null)}
                className="px-5 py-2 bg-primary-avocado hover:bg-primary-hover text-xs font-bold rounded-xl text-white transition-colors cursor-pointer"
              >
                Close Viewer
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
