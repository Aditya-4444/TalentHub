import React, { useState, useEffect } from 'react';
import { X, Send, Mail, User, Loader2, Sparkles, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateCoverLetter } from '../../services/ai';

export default function ApplicationModal({ isOpen, onClose, job, onApplySuccess }) {
  const { currentUser, userData } = useAuth();
  const [coverNote, setCoverNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Resume Source Selection State
  const [resumeSource, setResumeSource] = useState('upload'); // 'synced' | 'upload'
  
  // Resume File Attachment State
  const [resumeFile, setResumeFile] = useState(null);

  // AI Assistant States
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  // Pre-fill name and determine initial resume source
  useEffect(() => {
    if (userData && isOpen) {
      setDisplayName(userData.displayName || '');
      if (userData.savedResumeDetails) {
        setResumeSource('synced');
      } else {
        setResumeSource('upload');
      }
    }
  }, [userData, isOpen]);

  if (!isOpen || !job) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for Firestore doc size
        setError('Resume file size must be under 1MB.');
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setResumeFile({
          name: file.name,
          type: file.type,
          data: reader.result // Base64 string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAICoverLetter = async () => {
    setAiGenerating(true);
    setAiResult('');
    setError('');
    try {
      const result = await generateCoverLetter(job, userData);
      setAiGenerating(false);
      
      // Typewriter effect
      let currentLength = 0;
      setAiTyping(true);
      const timer = setInterval(() => {
        if (currentLength < result.length) {
          setAiResult(prev => prev + result[currentLength]);
          currentLength++;
        } else {
          clearInterval(timer);
          setAiTyping(false);
        }
      }, 5); // 5ms per character for natural fast typing
    } catch (err) {
      console.error(err);
      setError('AI cover letter generation failed. Please try again.');
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName) {
      setError('Please provide your name.');
      return;
    }
    if (resumeSource === 'upload' && !resumeFile) {
      setError('Please upload a resume file.');
      return;
    }
    if (resumeSource === 'synced' && (!userData || !userData.savedResumeDetails)) {
      setError('No synced resume found. Please build one in Career Services first or upload a file.');
      return;
    }
    if (!coverNote) {
      setError('Please write a short cover note for the hiring team.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedResume = resumeSource === 'synced' ? {
        type: 'synced',
        name: `${userData.savedResumeDetails.name || userData.displayName || 'Built'}_Resume.pdf`,
        syncedDetails: userData.savedResumeDetails,
        defaultResumeText: userData.defaultResumeText || ''
      } : resumeFile;

      // Create application document in Firestore
      await addDoc(collection(db, 'applications'), {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        seekerId: currentUser.uid,
        seekerName: displayName,
        seekerEmail: currentUser.email,
        coverNote,
        resume: selectedResume,
        appliedAt: serverTimestamp(),
        status: 'Pending',
        providerId: job.providerId // We carry providerId for optimized querying
      });

      setLoading(false);
      setCoverNote('');
      setResumeFile(null);
      onApplySuccess('Application submitted successfully!');
      onClose();
    } catch (err) {
      console.error("Error submitting application:", err);
      setError('Failed to submit application. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white border border-border-divider rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between animate-scale-up">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-divider/50 flex items-center justify-between bg-panel-bg/40">
          <div className="text-left">
            <h2 className="text-xl font-bold font-serif text-body-text">{job.title}</h2>
            <span className="text-xs text-muted-text">{job.company} • {job.location}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-muted-text hover:text-body-text rounded-full hover:bg-page-bg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-panel-bg border border-border-divider/40 rounded-xl text-xs text-muted-text text-left">
            <div>
              <strong className="block text-body-text font-bold uppercase tracking-wider mb-1 text-[10px]">Department</strong>
              {job.department}
            </div>
            <div>
              <strong className="block text-body-text font-bold uppercase tracking-wider mb-1 text-[10px]">Job Type</strong>
              {job.type}
            </div>
            <div>
              <strong className="block text-body-text font-bold uppercase tracking-wider mb-1 text-[10px]">Salary Offer</strong>
              {job.salary}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 text-left">
            <h3 className="text-sm font-bold text-body-text uppercase tracking-wider">About this role</h3>
            <p className="text-sm text-muted-text leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          <div className="border-t border-border-divider my-4"></div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-bold text-body-text uppercase tracking-wider text-left">Apply for this opening</h3>

            {error && (
              <p className="text-xs font-medium text-danger-reject bg-red-50 border border-red-200 p-2.5 rounded-lg text-left animate-fade-in">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label htmlFor="seekerNameInput" className="block text-xs font-semibold text-muted-text mb-1 flex items-center gap-1">
                  <User size={13} className="text-primary-avocado" />
                  Your Name
                </label>
                <input
                  id="seekerNameInput"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Jane Doe"
                  disabled={loading}
                  className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-3.5 py-2 bg-transparent"
                />
              </div>

              {/* Email (Read only) */}
              <div>
                <label htmlFor="seekerEmailInput" className="block text-xs font-semibold text-muted-text mb-1 flex items-center gap-1">
                  <Mail size={13} className="text-primary-avocado" />
                  Email Address
                </label>
                <input
                  id="seekerEmailInput"
                  type="email"
                  value={currentUser.email}
                  readOnly
                  className="w-full text-sm border border-border-divider/50 bg-panel-bg text-muted-text outline-none rounded-xl px-3.5 py-2 select-none"
                />
              </div>
            </div>

            {/* Resume Selection / Upload Box */}
            <div className="space-y-3.5 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-divider/30 pb-2">
                <span className="text-xs font-bold text-body-text uppercase tracking-wider">Select Resume Submission</span>
                {userData?.savedResumeDetails && (
                  <div className="flex gap-1.5 bg-page-bg/85 p-1 rounded-xl border border-border-divider/50 self-start sm:self-auto shrink-0 select-none">
                    <button
                      type="button"
                      onClick={() => setResumeSource('synced')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        resumeSource === 'synced'
                          ? 'bg-white text-primary-hover shadow-3xs border border-border-divider/50'
                          : 'text-muted-text hover:text-body-text'
                      }`}
                    >
                      Use Built Resume
                    </button>
                    <button
                      type="button"
                      onClick={() => setResumeSource('upload')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        resumeSource === 'upload'
                          ? 'bg-white text-primary-hover shadow-3xs border border-border-divider/50'
                          : 'text-muted-text hover:text-body-text'
                      }`}
                    >
                      Upload File
                    </button>
                  </div>
                )}
              </div>

              {resumeSource === 'synced' && userData?.savedResumeDetails ? (
                /* Synced built resume info card */
                <div className="bg-primary-avocado/5 border border-primary-avocado/25 rounded-2xl p-4 text-left space-y-3 shadow-3xs animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[9.5px] font-bold bg-badge-dept-bg text-badge-dept-text border border-primary-avocado/20">
                      <Sparkles size={11} className="fill-primary-avocado/30 shrink-0" />
                      TalentHub Synced Resume Active
                    </span>
                    <span className="text-[10px] text-muted-text font-bold capitalize">
                      Template: {userData.savedResumeDetails.template || 'Classic'}
                    </span>
                  </div>
                  
                  <div className="border-t border-border-divider/25 pt-2.5 flex items-start gap-3">
                    <div className="p-2.5 bg-primary-avocado/10 text-primary-hover rounded-xl border border-primary-avocado/15 shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-body-text">{userData.savedResumeDetails.name || userData.displayName}</h4>
                      <p className="text-[10px] font-semibold text-primary-avocado truncate mt-0.5">{userData.savedResumeDetails.title || 'Professional Title'}</p>
                      
                      <div className="flex gap-3 text-[9.5px] text-muted-text mt-1.5 font-medium">
                        <span>{userData.savedResumeDetails.experience?.length || 0} Work History items</span>
                        <span>•</span>
                        <span>{userData.savedResumeDetails.education?.length || 0} Education items</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-muted-text leading-snug border-t border-border-divider/25 pt-2 font-medium">
                    Your synced built resume will be sent directly to the hiring team. Update it anytime in Services.
                  </p>
                </div>
              ) : (
                /* Standard Upload Selector */
                <div className="space-y-2.5">
                  {!userData?.savedResumeDetails && (
                    <div className="text-[10.5px] font-semibold text-muted-text bg-panel-bg/45 border border-border-divider/30 p-2.5 rounded-xl flex items-center justify-between">
                      <span>💡 Pro-tip: Build and sync your resume in Services to apply instantly with one click next time!</span>
                    </div>
                  )}

                  {resumeFile ? (
                    <div className="bg-primary-avocado/5 border border-primary-avocado/20 rounded-xl p-3.5 flex items-center justify-between shadow-2xs animate-fade-in">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 bg-primary-avocado/10 rounded-lg text-primary-hover shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-xs font-bold text-body-text truncate max-w-xs">{resumeFile.name}</p>
                          <p className="text-[9px] text-muted-text">Resume file attached</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setResumeFile(null)}
                        className="p-1 text-danger-reject hover:bg-red-50 rounded-lg transition-colors text-xs font-semibold cursor-pointer shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="relative group border border-dashed border-border-divider/80 hover:border-primary-avocado/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-panel-bg/10 hover:bg-primary-avocado/5 animate-fade-in">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-1">
                        <div className="mx-auto w-8 h-8 rounded-full bg-border-divider/30 text-muted-text flex items-center justify-center group-hover:text-primary-avocado group-hover:bg-primary-avocado/10 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                          </svg>
                        </div>
                        <p className="text-xs font-bold text-body-text">Drag and drop or click to upload</p>
                        <p className="text-[9px] text-muted-text">Supported formats: PDF, DOC, DOCX up to 1MB</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cover Note Section with AI Assistant */}
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <label htmlFor="coverNoteInput" className="block text-xs font-semibold text-muted-text">Cover Letter / Note</label>
                <button
                  type="button"
                  onClick={triggerAICoverLetter}
                  disabled={aiGenerating || aiTyping}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-avocado/10 hover:bg-primary-avocado/25 border border-primary-avocado/20 text-primary-hover text-[10px] font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={11} className="fill-primary-avocado text-primary-hover shrink-0" />
                  ✨ Draft with AI
                </button>
              </div>

              {/* AI Assistant Preview Panel */}
              {(aiGenerating || aiResult) && (
                <div className="border border-primary-avocado/20 rounded-xl p-4 bg-primary-avocado/5 space-y-3 animate-fade-in relative text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={12} className="text-primary-hover fill-primary-avocado/30 shrink-0" />
                      <span className="text-[10px] font-bold text-primary-hover uppercase tracking-wider">AI Assistant Draft</span>
                    </div>
                    {aiTyping && (
                      <span className="text-[9px] font-semibold text-primary-avocado animate-pulse">Typing...</span>
                    )}
                  </div>
                  
                  {aiGenerating ? (
                    <div className="py-4 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-primary-avocado w-5 h-5" />
                      <p className="text-[10px] text-muted-text font-semibold">AI is tailoring Cover Note to your profile...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-body-text whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-mono bg-white p-3 rounded-lg border border-border-divider/30 text-left">
                        {aiResult}
                      </p>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setAiResult('')}
                          className="px-2.5 py-1 text-[10px] border border-border-divider hover:bg-white text-muted-text rounded-md font-semibold cursor-pointer"
                        >
                          Discard
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCoverNote(aiResult);
                            setAiResult('');
                          }}
                          disabled={aiTyping}
                          className="px-2.5 py-1 text-[10px] bg-primary-avocado hover:bg-primary-hover disabled:opacity-40 text-white rounded-md font-semibold cursor-pointer"
                        >
                          Insert Draft
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <textarea
                id="coverNoteInput"
                rows={5}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Introduce yourself to the hiring team and highlight why you are a fit for this position..."
                disabled={loading}
                className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-4 py-2.5 bg-transparent resize-none"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 text-sm font-semibold border border-border-divider hover:bg-page-bg text-body-text rounded-xl py-3 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 text-sm font-semibold text-white bg-primary-avocado hover:bg-primary-hover rounded-xl py-3 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Apply Now
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
