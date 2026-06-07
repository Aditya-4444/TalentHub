import React, { useState } from 'react';
import { X, Briefcase, MapPin, DollarSign, AlignLeft, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateJobDescription } from '../../services/ai';

export default function PostJobModal({ isOpen, onClose, onPostSuccess, onShowUpgrade, activeJobsCount }) {
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    department: 'Software & IT / Engineering',
    salary: '',
    description: ''
  });

  // AI Assistant States
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  if (!isOpen) return null;

  // Check plan limits
  const getJobLimit = (plan) => {
    if (plan === 'silver') return 5;
    if (plan === 'gold') return Infinity;
    return 2; // Default to free plan
  };
  const limit = getJobLimit(userData?.plan);
  const isLimitReached = activeJobsCount >= limit;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const triggerAIDescription = async () => {
    const { title, department, company } = formData;
    if (!title) {
      setError('Please enter a Job Title first so the AI can tailor the description.');
      return;
    }
    setAiGenerating(true);
    setAiResult('');
    setError('');
    try {
      const result = await generateJobDescription(title, department, company);
      setAiGenerating(false);
      
      // Typewriter typing animation
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
      }, 3); // Fast 3ms interval for long job descriptions
    } catch (err) {
      console.error(err);
      setError('AI job description drafting failed. Please try again.');
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, company, location, type, department, salary, description } = formData;

    if (!title || !company || !location || !salary || !description) {
      setError('All fields are required.');
      return;
    }

    if (isLimitReached) {
      setError('Upgrade required to post more jobs.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Write to Firestore jobs collection
      await addDoc(collection(db, 'jobs'), {
        title,
        company,
        location,
        type,
        department,
        salary,
        description,
        providerId: currentUser.uid,
        postedAt: serverTimestamp()
      });

      setLoading(false);
      // Reset form
      setFormData({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        department: 'Software & IT / Engineering',
        salary: '',
        description: ''
      });
      
      onPostSuccess('Job listing posted successfully!');
      onClose();
    } catch (err) {
      console.error("Error creating job:", err);
      setError('Failed to create job listing. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-border-divider rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between animate-scale-up">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-divider/50 flex items-center justify-between bg-panel-bg/40">
          <div className="flex items-center gap-2">
            <Briefcase size={20} className="text-primary-avocado" />
            <h2 className="text-xl font-bold font-serif text-body-text">Post a New Job</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-muted-text hover:text-body-text rounded-full hover:bg-page-bg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {error && (
            <div className="text-xs font-medium text-danger-reject bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-left">
              <AlertTriangle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Plan Limit Block */}
          {isLimitReached && (
            <div className="bg-badge-remote-bg/40 border border-amber-300 rounded-2xl p-5 space-y-3 flex flex-col items-center text-center">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-full">
                <Sparkles size={24} className="fill-amber-400 text-amber-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-body-text">Posting Limit Reached</h3>
                <p className="text-xs text-muted-text max-w-md">
                  You have active listings representing your {userData?.plan || 'Free'} Plan quota ({activeJobsCount}/{limit} jobs). 
                  Upgrade your plan to post additional job listings.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onShowUpgrade(userData?.plan === 'silver' ? 'gold' : 'silver');
                }}
                className="text-xs font-semibold py-2.5 px-4 bg-primary-avocado hover:bg-primary-hover text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={14} className="fill-white" />
                Upgrade Subscription
              </button>
            </div>
          )}

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isLimitReached ? 'opacity-40 pointer-events-none' : ''}`}>
            
            {/* Title */}
            <div className="text-left">
              <label htmlFor="title" className="block text-xs font-semibold text-muted-text mb-1">Job Title</label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Developer"
                disabled={loading || isLimitReached}
                className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-4 py-2.5 bg-transparent"
              />
            </div>

            {/* Company */}
            <div className="text-left">
              <label htmlFor="company" className="block text-xs font-semibold text-muted-text mb-1">Company Name</label>
              <input
                id="company"
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. Acme Corp"
                disabled={loading || isLimitReached}
                className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-4 py-2.5 bg-transparent"
              />
            </div>

            {/* Location */}
            <div className="text-left">
              <label htmlFor="location" className="block text-xs font-semibold text-muted-text mb-1 flex items-center gap-1">
                <MapPin size={13} className="text-primary-avocado" />
                Location
              </label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Austin, TX or Remote"
                disabled={loading || isLimitReached}
                className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-4 py-2.5 bg-transparent"
              />
            </div>

            {/* Salary */}
            <div className="text-left">
              <label htmlFor="salary" className="block text-xs font-semibold text-muted-text mb-1 flex items-center gap-1">
                <DollarSign size={13} className="text-primary-avocado" />
                Salary Range
              </label>
              <input
                id="salary"
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. $120,000 - $140,000"
                disabled={loading || isLimitReached}
                className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-4 py-2.5 bg-transparent"
              />
            </div>

            {/* Type */}
            <div className="text-left">
              <label htmlFor="type" className="block text-xs font-semibold text-muted-text mb-1">Job Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={loading || isLimitReached}
                className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-4 py-2.5 bg-white"
              >
                <option value="Full-time">Full-time</option>
                <option value="Remote">Remote</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            {/* Department */}
            <div className="text-left">
              <label htmlFor="department" className="block text-xs font-semibold text-muted-text mb-1">Department</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={loading || isLimitReached}
                className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-4 py-2.5 bg-white"
              >
                <option value="Software & IT / Engineering">Software & IT / Engineering</option>
                <option value="Management / Product">Management / Product</option>
                <option value="Design / Creative">Design / Creative</option>
                <option value="Marketing & PR">Marketing & PR</option>
                <option value="Finance & Accounting">Finance & Accounting</option>
                <option value="Human Resources (HR)">Human Resources (HR)</option>
                <option value="Sales & Business Development">Sales & Business Development</option>
                <option value="Operations & Support">Operations & Support</option>
              </select>
            </div>
          </div>

          {/* Description Section with AI Assistant */}
          <div className={`space-y-2 text-left ${isLimitReached ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between">
              <label htmlFor="description" className="block text-xs font-semibold text-muted-text flex items-center gap-1">
                <AlignLeft size={13} className="text-primary-avocado" />
                Job Description
              </label>
              <button
                type="button"
                onClick={triggerAIDescription}
                disabled={aiGenerating || aiTyping || loading || isLimitReached}
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
                    <p className="text-[10px] text-muted-text font-semibold">AI is drafting a tailored job description...</p>
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
                          setFormData(prev => ({ ...prev, description: aiResult }));
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
              id="description"
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe role requirements, benefits, and tech stack details..."
              disabled={loading || isLimitReached}
              className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-4 py-2.5 bg-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
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
              disabled={loading || isLimitReached}
              className="flex-1 text-sm font-semibold text-white bg-primary-avocado hover:bg-primary-hover disabled:opacity-40 rounded-xl py-3 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
