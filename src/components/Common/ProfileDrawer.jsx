import React, { useState, useEffect } from 'react';
import { 
  X, User, Briefcase, MapPin, AlignLeft, Check, Edit2, 
  Sparkles, Globe, GraduationCap, Plus, Trash2, Link2 
} from 'lucide-react';

// Custom inline SVG icons for brands because they are not exported by this lucide version
const Github = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function ProfileDrawer({ isOpen, onClose, onShowUpgrade, onSaveSuccess, initialEditMode = false }) {
  const { currentUser, userData, updateProfileData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobsCount, setJobsCount] = useState(0);
  const [newSkill, setNewSkill] = useState('');

  const [formData, setFormData] = useState({
    displayName: '',
    headline: '',
    location: '',
    bio: '',
    skills: [],
    experience: [],
    education: [],
    github: '',
    linkedin: '',
    portfolio: ''
  });

  // Sync editing mode with initialEditMode when drawer opens
  useEffect(() => {
    if (isOpen) {
      setIsEditing(initialEditMode);
    }
  }, [isOpen, initialEditMode]);

  // Pre-fill form when user data loads
  useEffect(() => {
    if (userData) {
      setFormData({
        displayName: userData.displayName || '',
        headline: userData.headline || '',
        location: userData.location || '',
        bio: userData.bio || '',
        skills: userData.skills || [],
        experience: userData.experience || [],
        education: userData.education || [],
        github: userData.github || '',
        linkedin: userData.linkedin || '',
        portfolio: userData.portfolio || ''
      });
    }
  }, [userData, isOpen]);

  // Track provider's active job counts for subscription limits
  useEffect(() => {
    if (!currentUser || !userData || userData.role !== 'provider') return;

    const q = query(
      collection(db, 'jobs'),
      where('providerId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setJobsCount(snapshot.size);
    }, (error) => {
      console.error("Error listening to jobs for profile drawer:", error);
    });

    return () => unsubscribe();
  }, [currentUser, userData]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Skills handlers
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skillToRemove)
    });
  };

  // Experience handlers
  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    setFormData({ ...formData, experience: updatedExperience });
  };

  const handleAddExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        { title: '', company: '', duration: '', description: '' }
      ]
    });
  };

  const handleRemoveExperience = (index) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index)
    });
  };

  // Education handlers
  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setFormData({ ...formData, education: updatedEducation });
  };

  const handleAddEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { degree: '', school: '', year: '' }
      ]
    });
  };

  const handleRemoveEducation = (index) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfileData(formData);
      setIsEditing(false);
      onSaveSuccess('Profile updated successfully!');
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Semi-transparent Overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Slide-in Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white border-l border-border-divider shadow-2xl h-full flex flex-col justify-between animate-slide-in">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-border-divider/50 flex items-center justify-between bg-panel-bg/20">
            <h2 className="text-xl font-bold font-serif text-body-text">My Profile Workspace</h2>
            <button 
              onClick={onClose}
              className="p-1 text-muted-text hover:text-body-text rounded-full hover:bg-page-bg transition-colors"
              aria-label="Close drawer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Profile Form / Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            
            {/* Avatar & Basics */}
            <div className="flex flex-col items-center text-center space-y-3 pb-5 border-b border-border-divider/30">
              {userData?.photoURL ? (
                <img 
                  src={userData.photoURL} 
                  alt={userData.displayName} 
                  className={`w-20 h-20 rounded-full object-cover shadow-md ${
                    userData?.plan === 'gold' ? 'border-2 border-gold-glow' : 
                    userData?.plan === 'silver' ? 'border-2 border-silver-glow' : 
                    'border-2 border-primary-avocado'
                  }`}
                />
              ) : (
                <div className={`w-20 h-20 rounded-full bg-badge-dept-bg text-badge-dept-text flex items-center justify-center font-bold text-2xl shadow-sm ${
                  userData?.plan === 'gold' ? 'border-2 border-gold-glow' : 
                  userData?.plan === 'silver' ? 'border-2 border-silver-glow' : 
                  'border border-primary-avocado/30'
                }`}>
                  {getInitials(userData?.displayName)}
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-body-text">{userData?.displayName}</h3>
                <p className="text-xs text-primary-avocado font-semibold">{userData?.headline || 'Profession Profile'}</p>
                <p className="text-[10px] text-muted-text">{userData?.email}</p>
              </div>

              {/* Role Pill */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold bg-badge-dept-bg text-badge-dept-text border border-primary-avocado/20 capitalize">
                  {userData?.role === 'provider' ? 'Job Provider' : 'Job Seeker'}
                </span>
                {userData?.location && (
                  <span className="text-[10px] text-muted-text flex items-center gap-0.5">
                    <MapPin size={10} className="text-primary-avocado" />
                    {userData.location}
                  </span>
                )}
              </div>

              {/* Seeker View Social Links */}
              {!isEditing && userData?.role === 'seeker' && (userData.github || userData.linkedin || userData.portfolio) && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  {userData.github && (
                    <a href={userData.github.startsWith('http') ? userData.github : `https://${userData.github}`} target="_blank" rel="noreferrer" className="p-2 bg-panel-bg text-body-text hover:text-primary-avocado rounded-xl border border-border-divider/30 hover:border-primary-avocado transition-all" title="Github">
                      <Github size={16} />
                    </a>
                  )}
                  {userData.linkedin && (
                    <a href={userData.linkedin.startsWith('http') ? userData.linkedin : `https://${userData.linkedin}`} target="_blank" rel="noreferrer" className="p-2 bg-panel-bg text-body-text hover:text-primary-avocado rounded-xl border border-border-divider/30 hover:border-primary-avocado transition-all" title="LinkedIn">
                      <Linkedin size={16} />
                    </a>
                  )}
                  {userData.portfolio && (
                    <a href={userData.portfolio.startsWith('http') ? userData.portfolio : `https://${userData.portfolio}`} target="_blank" rel="noreferrer" className="p-2 bg-panel-bg text-body-text hover:text-primary-avocado rounded-xl border border-border-divider/30 hover:border-primary-avocado transition-all" title="Portfolio">
                      <Globe size={16} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Billing Info Section for BOTH Seeker and Provider */}
            <div className="bg-panel-bg border border-border-divider rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide uppercase text-muted-text">Billing Plan</span>
                {userData?.plan === 'gold' ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gold-metallic text-white border border-gold-glow shadow-sm">
                    <Sparkles size={12} className="fill-white animate-pulse" />
                    Gold {userData.role === 'provider' ? 'Partner' : 'Member'}
                  </span>
                ) : userData?.plan === 'silver' ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-silver-metallic text-body-text border border-silver-glow shadow-sm">
                    <Sparkles size={12} className="fill-body-text" />
                    Silver {userData.role === 'provider' ? 'Partner' : 'Member'}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-badge-remote-bg text-badge-remote-text border border-amber-300/30">
                    Free Plan
                  </span>
                )}
              </div>

              {/* Seeker Plans Flow */}
              {userData?.role === 'seeker' && (
                <div className="space-y-3">
                  {userData.plan !== 'silver' && userData.plan !== 'gold' && (
                    <>
                      <p className="text-xs text-muted-text">Upgrade your visibility and stand out to top companies.</p>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Silver Card */}
                        <div className="bg-white border border-border-divider/50 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-xs font-bold text-body-text">Silver Plan</span>
                            <p className="text-[10px] text-muted-text mt-1">Silver border, priority candidate list placement.</p>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-body-text mb-2">$19<span className="text-[10px] text-muted-text font-normal">/mo</span></div>
                            <button
                              type="button"
                              onClick={() => onShowUpgrade('silver')}
                              className="w-full py-1.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer"
                            >
                              Get Silver
                            </button>
                          </div>
                        </div>
                        {/* Gold Card */}
                        <div className="bg-white border border-gold-glow/50 rounded-xl p-3.5 flex flex-col justify-between space-y-2 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-yellow-400 text-[8px] font-bold text-yellow-950 px-1.5 py-0.2 rounded-bl-lg uppercase">Best</div>
                          <div>
                            <span className="text-xs font-bold text-yellow-700">Gold Plan</span>
                            <p className="text-[10px] text-muted-text mt-1">Glowing gold border, featured search tag placement.</p>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-body-text mb-2">$39<span className="text-[10px] text-muted-text font-normal">/mo</span></div>
                            <button
                              type="button"
                              onClick={() => onShowUpgrade('gold')}
                              className="w-full py-1.5 text-[10px] font-bold bg-primary-avocado hover:bg-primary-hover text-white rounded-lg cursor-pointer"
                            >
                              Get Gold
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {userData.plan === 'silver' && (
                    <div className="space-y-3">
                      <div className="text-xs text-muted-text flex items-center gap-2 bg-white/70 p-3 rounded-xl border border-border-divider/30">
                        <Sparkles size={16} className="text-slate-400 shrink-0" />
                        <span>You are on the <strong className="text-body-text">Silver Plan</strong>. Your profile pictures show a sleek silver border.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onShowUpgrade('gold')}
                        className="w-full text-xs font-semibold py-2 px-4 bg-primary-avocado hover:bg-primary-hover text-white rounded-xl shadow-xs transition-shadow flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles size={14} className="fill-white" />
                        Upgrade to Gold ($39/mo)
                      </button>
                    </div>
                  )}

                  {userData.plan === 'gold' && (
                    <div className="text-xs text-muted-text flex items-center gap-2 bg-white/70 p-3 rounded-xl border border-border-divider/30">
                      <Sparkles size={16} className="text-amber-500 animate-pulse shrink-0" />
                      <span>You are on the <strong className="text-body-text">Gold Plan</strong>. Enjoy your gold-glowing borders and priority recruiter search ranking!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Provider Plans Flow */}
              {userData?.role === 'provider' && (
                <div className="space-y-3">
                  {/* Quota Progress Bar for Free and Silver */}
                  {userData.plan !== 'gold' && (
                    <div>
                      <div className="flex justify-between text-[11px] text-muted-text mb-1">
                        <span>Job Postings Usage</span>
                        <span className="font-semibold text-body-text">
                          {jobsCount} / {userData.plan === 'silver' ? '5' : '2'} Jobs
                        </span>
                      </div>
                      <div className="w-full h-2 bg-border-divider/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-avocado rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((jobsCount / (userData.plan === 'silver' ? 5 : 2)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {userData.plan === 'free' && (
                    <>
                      <p className="text-xs text-muted-text">Upgrade your recruiting workspace to post more jobs and highlight listings.</p>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Silver Card */}
                        <div className="bg-white border border-border-divider/50 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-xs font-bold text-body-text">Silver Partner</span>
                            <p className="text-[10px] text-muted-text mt-1">Up to 5 jobs. Silver border & Silver Partner badge.</p>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-body-text mb-2">$29<span className="text-[10px] text-muted-text font-normal">/mo</span></div>
                            <button
                              type="button"
                              onClick={() => onShowUpgrade('silver')}
                              className="w-full py-1.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer"
                            >
                              Get Silver
                            </button>
                          </div>
                        </div>
                        {/* Gold Card */}
                        <div className="bg-white border border-gold-glow/50 rounded-xl p-3.5 flex flex-col justify-between space-y-2 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-yellow-400 text-[8px] font-bold text-yellow-950 px-1.5 py-0.2 rounded-bl-lg uppercase">Best</div>
                          <div>
                            <span className="text-xs font-bold text-yellow-700">Gold Partner</span>
                            <p className="text-[10px] text-muted-text mt-1">Unlimited jobs. Gold border & glowing Gold Partner badge on cards.</p>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-body-text mb-2">$59<span className="text-[10px] text-muted-text font-normal">/mo</span></div>
                            <button
                              type="button"
                              onClick={() => onShowUpgrade('gold')}
                              className="w-full py-1.5 text-[10px] font-bold bg-primary-avocado hover:bg-primary-hover text-white rounded-lg cursor-pointer"
                            >
                              Get Gold
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {userData.plan === 'silver' && (
                    <div className="space-y-3">
                      <div className="text-xs text-muted-text flex items-center gap-2 bg-white/70 p-3 rounded-xl border border-border-divider/30">
                        <Sparkles size={16} className="text-slate-400 shrink-0" />
                        <span>You are on the <strong className="text-body-text">Silver Partner Plan</strong>. You can post up to 5 jobs.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onShowUpgrade('gold')}
                        className="w-full text-xs font-semibold py-2 px-4 bg-primary-avocado hover:bg-primary-hover text-white rounded-xl shadow-xs transition-shadow flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles size={14} className="fill-white" />
                        Upgrade to Gold ($59/mo)
                      </button>
                    </div>
                  )}

                  {userData.plan === 'gold' && (
                    <div className="text-xs text-muted-text flex items-center gap-2 bg-white/70 p-3 rounded-xl border border-border-divider/30">
                      <Sparkles size={16} className="text-amber-500 animate-pulse shrink-0" />
                      <span>You have unlocked <strong className="text-body-text">Unlimited Job Postings</strong>, Gold Partner logo borders, and gold-glowing Job Cards!</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Drawer Editing and Viewing Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="flex items-center justify-between border-b border-border-divider/20 pb-2">
                <h4 className="text-sm font-bold text-body-text uppercase tracking-wider">Profile Details</h4>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-semibold text-primary-avocado hover:text-primary-hover flex items-center gap-1 border border-primary-avocado/30 hover:bg-badge-dept-bg/30 px-2.5 py-1 rounded-xl transition-all"
                  >
                    <Edit2 size={12} />
                    Edit Profile
                  </button>
                )}
              </div>

              {/* SECTION: BASIC INFO */}
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-muted-text block mb-1 flex items-center gap-1.5">
                    <User size={13} className="text-primary-avocado" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-3 py-2 bg-transparent"
                    />
                  ) : (
                    <p className="text-sm font-medium text-body-text bg-panel-bg px-3 py-2 rounded-xl border border-border-divider/20 min-h-[38px] flex items-center">
                      {userData?.displayName || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Headline */}
                <div>
                  <label className="text-xs font-bold text-muted-text block mb-1 flex items-center gap-1.5">
                    <Briefcase size={13} className="text-primary-avocado" />
                    Professional Headline
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="headline"
                      value={formData.headline}
                      onChange={handleInputChange}
                      placeholder="e.g. Senior React Developer"
                      className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-3 py-2 bg-transparent"
                    />
                  ) : (
                    <p className="text-sm text-body-text bg-panel-bg px-3 py-2 rounded-xl border border-border-divider/20 min-h-[38px] flex items-center">
                      {userData?.headline || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs font-bold text-muted-text block mb-1 flex items-center gap-1.5">
                    <MapPin size={13} className="text-primary-avocado" />
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Austin, TX"
                      className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-3 py-2 bg-transparent"
                    />
                  ) : (
                    <p className="text-sm text-body-text bg-panel-bg px-3 py-2 rounded-xl border border-border-divider/20 min-h-[38px] flex items-center">
                      {userData?.location || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="text-xs font-bold text-muted-text block mb-1 flex items-center gap-1.5">
                    <AlignLeft size={13} className="text-primary-avocado" />
                    Bio / Summary
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Describe background details or team hiring priorities..."
                      className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-3 py-2 bg-transparent resize-none"
                    />
                  ) : (
                    <p className="text-sm text-body-text bg-panel-bg px-3 py-2 rounded-xl border border-border-divider/20 min-h-[60px] py-2 whitespace-pre-wrap leading-relaxed">
                      {userData?.bio || 'No bio summary written.'}
                    </p>
                  )}
                </div>
              </div>

              {/* JOB SEEKER ROLE DETAILS */}
              {userData?.role === 'seeker' && (
                <div className="space-y-6 pt-2">
                  
                  {/* SUBSECTION: PROFESSIONAL LINKS (Edit only) */}
                  {isEditing && (
                    <div className="space-y-4 border-t border-border-divider/30 pt-4">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-primary-avocado flex items-center gap-1">
                        <Link2 size={12} />
                        Professional Links
                      </h5>
                      <div className="grid grid-cols-1 gap-3.5">
                        <div>
                          <label className="text-[10px] font-bold text-muted-text block mb-0.5">GitHub URL</label>
                          <input
                            type="text"
                            name="github"
                            value={formData.github}
                            onChange={handleInputChange}
                            placeholder="github.com/username"
                            className="w-full text-xs border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-text block mb-0.5">LinkedIn URL</label>
                          <input
                            type="text"
                            name="linkedin"
                            value={formData.linkedin}
                            onChange={handleInputChange}
                            placeholder="linkedin.com/in/username"
                            className="w-full text-xs border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-text block mb-0.5">Portfolio Website URL</label>
                          <input
                            type="text"
                            name="portfolio"
                            value={formData.portfolio}
                            onChange={handleInputChange}
                            placeholder="my-portfolio.com"
                            className="w-full text-xs border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-3 py-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBSECTION: SKILLS LIST */}
                  <div className="space-y-3 border-t border-border-divider/30 pt-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-primary-avocado flex items-center gap-1.5">
                      <Sparkles size={13} className="fill-primary-avocado" />
                      Skills & Core Competencies
                    </h5>

                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="e.g. React, Typescript, UI design"
                            className="flex-1 text-xs border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-3 py-2"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSkill(e);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddSkill}
                            className="bg-primary-avocado hover:bg-primary-hover text-white p-2 rounded-xl"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {formData.skills.map((skill, index) => (
                            <span key={index} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-badge-dept-bg text-badge-dept-text rounded-xl border border-primary-avocado/15">
                              {skill}
                              <button 
                                type="button" 
                                onClick={() => handleRemoveSkill(skill)}
                                className="text-danger-reject hover:bg-black/10 rounded-full p-0.5"
                              >
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {formData.skills.length === 0 ? (
                          <span className="text-xs text-muted-text italic">No skills listed yet.</span>
                        ) : (
                          formData.skills.map((skill, index) => (
                            <span key={index} className="px-2.5 py-1 text-xs font-semibold bg-badge-dept-bg text-badge-dept-text rounded-xl border border-primary-avocado/10">
                              {skill}
                            </span>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* SUBSECTION: EXPERIENCE TIMELINE */}
                  <div className="space-y-3 border-t border-border-divider/30 pt-4">
                    <div className="flex justify-between items-center">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-primary-avocado flex items-center gap-1.5">
                        <Briefcase size={13} />
                        Work History
                      </h5>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={handleAddExperience}
                          className="text-[10px] font-bold text-primary-avocado hover:text-primary-hover flex items-center gap-0.5 border border-primary-avocado/20 px-2 py-0.5 rounded-lg"
                        >
                          <Plus size={10} /> Add Experience
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-4">
                        {formData.experience.map((exp, idx) => (
                          <div key={idx} className="bg-panel-bg/30 p-3 rounded-xl border border-border-divider/30 relative space-y-3">
                            <button
                              type="button"
                              onClick={() => handleRemoveExperience(idx)}
                              className="absolute top-2 right-2 text-danger-reject hover:bg-red-50 p-1 rounded-lg transition-colors"
                              title="Delete Work Item"
                            >
                              <Trash2 size={12} />
                            </button>

                            <div className="grid grid-cols-2 gap-3.5 pt-4 sm:pt-0">
                              <div>
                                <label className="text-[10px] font-bold text-muted-text block mb-0.5">Role Title</label>
                                <input
                                  type="text"
                                  value={exp.title}
                                  onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)}
                                  placeholder="e.g. Senior Frontend Dev"
                                  className="w-full text-xs border border-border-divider outline-none rounded-lg p-1.5"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-muted-text block mb-0.5">Company Name</label>
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                                  placeholder="e.g. Stripe"
                                  className="w-full text-xs border border-border-divider outline-none rounded-lg p-1.5"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-[10px] font-bold text-muted-text block mb-0.5">Period (Years/Duration)</label>
                              <input
                                type="text"
                                value={exp.duration}
                                onChange={(e) => handleExperienceChange(idx, 'duration', e.target.value)}
                                placeholder="e.g. 2022 - Present or 6 months"
                                className="w-full text-xs border border-border-divider outline-none rounded-lg p-1.5"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-muted-text block mb-0.5">Job Description Summary</label>
                              <textarea
                                rows={2}
                                value={exp.description}
                                onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                                placeholder="Brief summary of duties and technologies used..."
                                className="w-full text-xs border border-border-divider outline-none rounded-lg p-1.5 resize-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="relative pl-3 space-y-4 border-l-2 border-border-divider/50 ml-1.5">
                        {formData.experience.length === 0 ? (
                          <span className="text-xs text-muted-text italic ml-[-12px] block">No experience records listed.</span>
                        ) : (
                          formData.experience.map((exp, idx) => (
                            <div key={idx} className="relative space-y-1">
                              {/* Bullet circle */}
                              <div className="absolute w-2.5 h-2.5 bg-primary-avocado rounded-full left-[-17px] top-1.5 border border-white" />
                              <strong className="text-xs font-bold text-body-text block leading-snug">{exp.title}</strong>
                              <span className="text-[11px] font-semibold text-primary-avocado block">{exp.company} • <span className="text-muted-text font-normal">{exp.duration}</span></span>
                              <p className="text-[11px] text-muted-text leading-relaxed pt-0.5">{exp.description}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* SUBSECTION: EDUCATION TIMELINE */}
                  <div className="space-y-3 border-t border-border-divider/30 pt-4">
                    <div className="flex justify-between items-center">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-primary-avocado flex items-center gap-1.5">
                        <GraduationCap size={14} />
                        Education & Qualifications
                      </h5>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={handleAddEducation}
                          className="text-[10px] font-bold text-primary-avocado hover:text-primary-hover flex items-center gap-0.5 border border-primary-avocado/20 px-2 py-0.5 rounded-lg"
                        >
                          <Plus size={10} /> Add Education
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-4">
                        {formData.education.map((edu, idx) => (
                          <div key={idx} className="bg-panel-bg/30 p-3 rounded-xl border border-border-divider/30 relative space-y-3">
                            <button
                              type="button"
                              onClick={() => handleRemoveEducation(idx)}
                              className="absolute top-2 right-2 text-danger-reject hover:bg-red-50 p-1 rounded-lg transition-colors"
                              title="Delete Education Item"
                            >
                              <Trash2 size={12} />
                            </button>

                            <div className="grid grid-cols-2 gap-3.5 pt-4 sm:pt-0">
                              <div>
                                <label className="text-[10px] font-bold text-muted-text block mb-0.5">Degree / Certification</label>
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                                  placeholder="e.g. B.S. Computer Science"
                                  className="w-full text-xs border border-border-divider outline-none rounded-lg p-1.5"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-muted-text block mb-0.5">School / University</label>
                                <input
                                  type="text"
                                  value={edu.school}
                                  onChange={(e) => handleEducationChange(idx, 'school', e.target.value)}
                                  placeholder="e.g. Stanford University"
                                  className="w-full text-xs border border-border-divider outline-none rounded-lg p-1.5"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-[10px] font-bold text-muted-text block mb-0.5">Graduation Year</label>
                              <input
                                type="text"
                                value={edu.year}
                                onChange={(e) => handleEducationChange(idx, 'year', e.target.value)}
                                placeholder="e.g. 2021"
                                className="w-full text-xs border border-border-divider outline-none rounded-lg p-1.5"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="relative pl-3 space-y-4 border-l-2 border-border-divider/50 ml-1.5">
                        {formData.education.length === 0 ? (
                          <span className="text-xs text-muted-text italic ml-[-12px] block">No education records listed.</span>
                        ) : (
                          formData.education.map((edu, idx) => (
                            <div key={idx} className="relative space-y-1">
                              {/* Bullet circle */}
                              <div className="absolute w-2.5 h-2.5 bg-primary-avocado rounded-full left-[-17px] top-1.5 border border-white" />
                              <strong className="text-xs font-bold text-body-text block leading-snug">{edu.degree}</strong>
                              <span className="text-[11px] font-semibold text-primary-avocado block">{edu.school} • <span className="text-muted-text font-normal">{edu.year}</span></span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Edit Controls */}
              {isEditing && (
                <div className="flex gap-2 pt-4 border-t border-border-divider/30">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 text-xs font-semibold py-2.5 bg-page-bg hover:bg-border-divider/30 text-body-text rounded-xl border border-border-divider/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 text-xs font-semibold py-2.5 bg-primary-avocado hover:bg-primary-hover text-white rounded-xl shadow-md flex items-center justify-center gap-1"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Footer / Info */}
          <div className="px-6 py-4 border-t border-border-divider/30 bg-panel-bg/50 text-[11px] text-muted-text flex items-center gap-1.5">
            <User size={12} className="text-primary-avocado" />
            <span>Profile values are updated instantly in Firestore.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
