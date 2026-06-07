import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, RefreshCw, XCircle, SearchCode, Sparkles, Briefcase, FileText, Code, Palette, Megaphone, DollarSign, Users, Globe, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

import JobCard from './JobCard';
import ApplicationModal from './ApplicationModal';
import SeekerApplications from './SeekerApplications';

const DEPARTMENTS = [
  { id: "Software & IT / Engineering", label: "Software & IT / Engineering", description: "Coding, systems, security, tech stack development", icon: Code },
  { id: "Management / Product", label: "Management / Product", description: "Product lifecycle, agile scrum, team coordination", icon: Briefcase },
  { id: "Design / Creative", label: "Design / Creative", description: "UI/UX design, visual identity, branding, prototyping", icon: Palette },
  { id: "Marketing & PR", label: "Marketing & PR", description: "Growth hacking, content creator, SEO, ads strategy", icon: Megaphone },
  { id: "Finance & Accounting", label: "Finance & Accounting", description: "Bookkeeping, budgeting, investment, compliance", icon: DollarSign },
  { id: "Human Resources (HR)", label: "Human Resources (HR)", description: "Talent acquisition, operations, culture development", icon: Users },
  { id: "Sales & Business Development", label: "Sales & Business Development", description: "Client relations, B2B sales, revenue acquisition", icon: Globe },
  { id: "Operations & Support", label: "Operations & Support", description: "Logistics, system operations, customer success", icon: Shield }
];

export default function SeekerDashboard({ 
  triggerToast, 
  onFilteredCountChange, 
  onOpenProfile,
  jobs = [],
  applications = [],
  loading = false,
  activeTab = 'find-jobs',
  setActiveTab,
  selectedJobFromNotification,
  setSelectedJobFromNotification
}) {
  const { currentUser, userData } = useAuth();
  
  const [shortlistedAppsToAlert, setShortlistedAppsToAlert] = useState([]);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState({
    'Full-time': false,
    'Remote': false,
    'Part-time': false,
    'Contract': false
  });
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  
  // Selected Job for Modal
  const [selectedJob, setSelectedJob] = useState(null);

  // Toggle flag to bypass interests filter
  const [showAllJobs, setShowAllJobs] = useState(false);

  // Onboarding interests selection state
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [savingInterests, setSavingInterests] = useState(false);

  // Check shortlist notifications
  useEffect(() => {
    if (!applications) return;
    const unnotified = applications.filter(app => app.status === 'Shortlisted' && app.shortlistNotified !== true);
    if (unnotified.length > 0) {
      setShortlistedAppsToAlert(unnotified);
    }
  }, [applications]);

  // Handle opening job modal via notification action
  useEffect(() => {
    if (selectedJobFromNotification) {
      setSelectedJob(selectedJobFromNotification);
      setSelectedJobFromNotification(null); // Clear after opening
    }
  }, [selectedJobFromNotification, setSelectedJobFromNotification]);

  const handleDismissShortlistAlert = async () => {
    const appsToUpdate = [...shortlistedAppsToAlert];
    setShortlistedAppsToAlert([]); // Close pop-up immediately
    
    for (const app of appsToUpdate) {
      try {
        const appRef = doc(db, 'applications', app.id);
        await updateDoc(appRef, { shortlistNotified: true });
      } catch (err) {
        console.error("Error updating application shortlistNotified:", err);
      }
    }
  };

  const handleToggleInterest = (deptId) => {
    if (selectedInterests.includes(deptId)) {
      setSelectedInterests(prev => prev.filter(id => id !== deptId));
    } else {
      setSelectedInterests(prev => [...prev, deptId]);
    }
  };

  const handleSaveInterests = async () => {
    if (selectedInterests.length === 0) return;
    setSavingInterests(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        interests: selectedInterests,
        interestsSelected: true
      });
      triggerToast('Welcome onboarding setup complete!');
    } catch (error) {
      console.error("Error saving interests:", error);
      alert("Error saving preferences. Please try again.");
    } finally {
      setSavingInterests(false);
    }
  };

  // Helper to map old and new department tags correctly
  const matchesInterest = (jobDept, userInterests) => {
    if (!userInterests || userInterests.length === 0) return true;
    return userInterests.some(interest => {
      if (interest === "Software & IT / Engineering" && (jobDept === "Engineering" || jobDept === "Software & IT / Engineering")) return true;
      if (interest === "Management / Product" && (jobDept === "Product" || jobDept === "Management / Product" || jobDept === "Management")) return true;
      if (interest === "Design / Creative" && (jobDept === "Design" || jobDept === "Design / Creative")) return true;
      if (interest === "Marketing & PR" && (jobDept === "Marketing" || jobDept === "Marketing & PR")) return true;
      return jobDept === interest;
    });
  };

  // Client-side filtering & search matching
  const filteredJobs = jobs.filter((job) => {
    // 1. Search term match (Title or Company name, case-insensitive)
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Job Type Match (selected types or none = all)
    const activeTypes = Object.keys(selectedTypes).filter(type => selectedTypes[type]);
    const matchesType = activeTypes.length === 0 || activeTypes.includes(job.type);

    // 3. Department Match
    let matchesDepartment;
    if (selectedDepartment !== 'All') {
      // Direct selected department match or mapping match
      matchesDepartment = (job.department === selectedDepartment) || 
        (selectedDepartment === "Software & IT / Engineering" && job.department === "Engineering") ||
        (selectedDepartment === "Management / Product" && job.department === "Product") ||
        (selectedDepartment === "Design / Creative" && job.department === "Design") ||
        (selectedDepartment === "Marketing & PR" && job.department === "Marketing");
    } else {
      // If no search term and they want to show matching interests (default)
      if (!showAllJobs && searchTerm === '') {
        matchesDepartment = matchesInterest(job.department, userData?.interests);
      } else {
        matchesDepartment = true;
      }
    }

    return matchesSearch && matchesType && matchesDepartment;
  });

  // Client-side sorting for jobs (newest first)
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const timeA = a.postedAt?.toDate ? a.postedAt.toDate() : new Date(a.postedAt || 0);
    const timeB = b.postedAt?.toDate ? b.postedAt.toDate() : new Date(b.postedAt || 0);
    return timeB - timeA;
  });

  // Client-side sorting for seeker's applications (newest first)
  const sortedApplications = [...applications].sort((a, b) => {
    const timeA = a.appliedAt?.toDate ? a.appliedAt.toDate() : new Date(a.appliedAt || 0);
    const timeB = b.appliedAt?.toDate ? b.appliedAt.toDate() : new Date(b.appliedAt || 0);
    return timeB - timeA;
  });

  // Update parent openings count for Navbar
  useEffect(() => {
    if (activeTab === 'find-jobs') {
      onFilteredCountChange(filteredJobs.length);
    } else {
      onFilteredCountChange(null); // Clear count if on applications page
    }
  }, [filteredJobs.length, activeTab, onFilteredCountChange]);

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const isFilterActive = 
    searchTerm !== '' || 
    Object.values(selectedTypes).some(val => val) || 
    selectedDepartment !== 'All';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedTypes({
      'Full-time': false,
      'Remote': false,
      'Part-time': false,
      'Contract': false
    });
    setSelectedDepartment('All');
  };

  // Onboarding Interests Selector
  if (userData?.role === 'seeker' && !userData?.interestsSelected) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-page-bg flex flex-col justify-center py-12 px-6">
        <div className="max-w-4xl mx-auto w-full space-y-8 animate-fade-in">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-2xs">
              <Sparkles size={11} className="fill-yellow-500 text-yellow-600 shrink-0" />
              Personalize Your Feed
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-body-text tracking-tight">
              Welcome to TalentHub! 👋
            </h1>
            <p className="text-muted-text text-sm sm:text-base max-w-xl mx-auto font-medium">
              Which fields are you interested in? Select at least one department, and we'll surface relevant job openings on your dashboard.
            </p>
          </div>

          {/* Grid of Interests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {DEPARTMENTS.map((dept) => {
              const Icon = dept.icon;
              const isSelected = selectedInterests.includes(dept.id);
              return (
                <div
                  key={dept.id}
                  onClick={() => handleToggleInterest(dept.id)}
                  className={`border rounded-2xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between h-44 hover:shadow-md select-none group relative ${
                    isSelected 
                      ? 'border-primary-avocado bg-primary-avocado/5 shadow-xs ring-1 ring-primary-avocado' 
                      : 'border-border-divider/70 bg-white hover:border-primary-avocado/50'
                  }`}
                >
                  {/* Icon and checkmark */}
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-xl transition-colors ${
                      isSelected 
                        ? 'bg-primary-avocado text-white' 
                        : 'bg-panel-bg text-muted-text group-hover:text-primary-avocado group-hover:bg-primary-avocado/10'
                    }`}>
                      <Icon size={20} />
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-primary-avocado text-white flex items-center justify-center text-[10px] font-bold animate-scale-up">
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-4 font-sans">
                    <h3 className="text-xs font-bold text-body-text">{dept.label}</h3>
                    <p className="text-[10px] text-muted-text leading-tight font-medium line-clamp-2">
                      {dept.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={handleSaveInterests}
              disabled={selectedInterests.length === 0 || savingInterests}
              className="px-8 py-3.5 bg-primary-avocado hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              {savingInterests ? 'Saving choices...' : 'Get Started'}
            </button>
          </div>

        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-avocado border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-muted-text">Scanning live positions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-page-bg flex flex-col">
      {activeTab === 'find-jobs' ? (
        <>
          {/* Seeker Dashboard Hero */}
          <section className="py-12 px-6 text-center space-y-4 max-w-4xl mx-auto">
            <h2 className="text-4xl font-extrabold font-serif text-body-text tracking-tight sm:text-5xl">
              Find your next career move
            </h2>
            <p className="text-muted-text text-sm sm:text-base font-medium max-w-xl mx-auto">
              Browse vacancies from premium companies, apply with a single cover note, and track your hiring pipeline.
            </p>
            
            {/* Search Input Box */}
            <div className="max-w-2xl mx-auto pt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-text">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search jobs by title, keyword, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm pl-11 pr-4 py-3.5 border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl bg-white shadow-xs focus:shadow-md transition-all"
              />
            </div>
          </section>

          {/* Core Search & Filters Grid */}
          <div className="px-6 pb-16 max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-8 items-start">
            
            {/* Left Filter Sidebar */}
            <aside className="w-full md:w-64 bg-panel-bg border border-border-divider rounded-xl p-5 space-y-6 md:sticky md:top-24">
              <div className="flex items-center justify-between border-b border-border-divider/40 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-body-text flex items-center gap-1.5">
                  <SlidersHorizontal size={14} className="text-primary-avocado" />
                  Filter Search
                </h3>
                {isFilterActive && (
                  <button 
                    onClick={handleResetFilters}
                    className="text-[10px] font-bold text-primary-avocado hover:text-primary-hover flex items-center gap-1 bg-white border border-border-divider/50 px-2 py-1 rounded-lg transition-colors"
                  >
                    <RefreshCw size={10} />
                    Reset
                  </button>
                )}
              </div>

              {/* Filter by Job Type */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-body-text">Job Type</h4>
                <div className="space-y-2">
                  {Object.keys(selectedTypes).map((type) => (
                    <label key={type} className="flex items-center gap-2.5 text-xs text-muted-text font-medium cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedTypes[type]}
                        onChange={() => handleTypeToggle(type)}
                        className="rounded border-border-divider text-primary-avocado focus:ring-primary-avocado w-3.5 h-3.5"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter by Department */}
              <div className="space-y-3">
                <label htmlFor="deptFilterSelect" className="text-xs font-bold text-body-text block">Department</label>
                <select
                  id="deptFilterSelect"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full text-xs font-medium border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-lg p-2 bg-white"
                >
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.label}</option>
                  ))}
                </select>
              </div>

              {/* Premium Plan Promotion Widget */}
              {userData?.plan !== 'silver' && userData?.plan !== 'gold' && (
                <div className="bg-yellow-50/50 border border-yellow-300/60 rounded-xl p-4 text-center space-y-2.5 shadow-2xs">
                  <div className="flex justify-center">
                    <Sparkles size={18} className="text-yellow-600 fill-yellow-400 animate-pulse" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-body-text">Get Premium Status</h4>
                    <p className="text-[10px] text-muted-text">Highlight your avatar and get prioritized by top companies.</p>
                  </div>
                  <button
                    onClick={onOpenProfile}
                    className="w-full py-1.5 bg-primary-avocado hover:bg-primary-hover text-white text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    View Subscription Plans
                  </button>
                </div>
              )}

            </aside>

            {/* Right Job listings feed */}
            <div className="flex-1 w-full">
              
              {/* Interests Filter Indicator Banner */}
              {selectedDepartment === 'All' && searchTerm === '' && !showAllJobs && userData?.interests?.length > 0 && (
                <div className="mb-6 p-4 bg-primary-avocado/5 border border-primary-avocado/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs animate-fade-in">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="p-2 bg-primary-avocado/10 rounded-xl text-primary-hover">
                      <Sparkles size={16} className="fill-primary-avocado/30" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-body-text">Showing jobs matching your preferences</h4>
                      <p className="text-[10px] text-muted-text font-medium leading-normal">
                        Based on your interest in: <span className="font-bold text-primary-hover">{userData.interests.join(', ')}</span>.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAllJobs(true)}
                    className="px-4 py-1.5 bg-white hover:bg-page-bg text-primary-avocado hover:text-primary-hover border border-border-divider hover:border-primary-avocado/30 text-xs font-bold rounded-xl shadow-2xs transition-colors shrink-0 cursor-pointer"
                  >
                    Explore All Jobs
                  </button>
                </div>
              )}

              {/* Banner when they have bypassed the filter */}
              {selectedDepartment === 'All' && searchTerm === '' && showAllJobs && userData?.interests?.length > 0 && (
                <div className="mb-6 p-4 bg-panel-bg border border-border-divider/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs animate-fade-in">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="p-2 bg-border-divider/25 rounded-xl text-muted-text">
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-body-text">Viewing all available positions</h4>
                      <p className="text-[10px] text-muted-text font-medium leading-normal">
                        You are currently exploring all listings in the system.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAllJobs(false)}
                    className="px-4 py-1.5 bg-primary-avocado hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Filter by My Interests
                  </button>
                </div>
              )}

              {sortedJobs.length === 0 ? (
                /* Empty state */
                <div className="pt-20 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="p-5 bg-white border border-border-divider text-border-divider rounded-full">
                    <SearchCode size={40} className="stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-body-text">No jobs found</h3>
                    <p className="text-sm text-muted-text max-w-xs mx-auto">
                      We couldn't find any job listings matching your search filter parameters.
                    </p>
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-semibold py-2 px-4 border border-primary-avocado text-primary-avocado hover:bg-badge-dept-bg/25 rounded-xl transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                /* Jobs Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedJobs.map((job) => {
                    const hasApplied = applications.some((app) => app.jobId === job.id);
                    return (
                      <JobCard
                        key={job.id}
                        job={job}
                        hasApplied={hasApplied}
                        onViewDetails={setSelectedJob}
                      />
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </>
      ) : (
        /* Applications History Tab */
        <div className="px-6 py-10 max-w-5xl mx-auto w-full">
          <SeekerApplications applications={sortedApplications} />
        </div>
      )}

      {/* Application Form Modal */}
      <ApplicationModal
        isOpen={selectedJob !== null}
        onClose={() => setSelectedJob(null)}
        job={selectedJob}
        onApplySuccess={triggerToast}
      />

      {/* Shortlist Congratulations Popup Modal */}
      {shortlistedAppsToAlert.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden bg-white border border-gold-glow rounded-2xl shadow-2xl animate-scale-up p-8 text-center space-y-6">
            
            {/* Sparkles effect icon */}
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto border border-yellow-300 animate-bounce-short">
              <Sparkles size={32} className="text-yellow-600 fill-yellow-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold font-serif text-body-text tracking-tight">Congratulations!</h2>
              <p className="text-sm text-muted-text">
                Your profile has been shortlisted by hiring managers!
              </p>
            </div>

            <div className="bg-panel-bg border border-border-divider/50 rounded-xl p-4 text-left space-y-3 max-h-48 overflow-y-auto">
              <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block mb-1">New Shortlistings ({shortlistedAppsToAlert.length})</span>
              {shortlistedAppsToAlert.map((app) => (
                <div key={app.id} className="border-b border-border-divider/20 last:border-none pb-2 last:pb-0 pt-1">
                  <div className="font-bold text-sm text-body-text">{app.jobTitle}</div>
                  <div className="text-xs text-primary-avocado font-semibold">{app.company}</div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-text leading-tight">
              The hiring team will reach out to you at <strong className="text-body-text">{currentUser?.email}</strong> shortly.
            </p>

            <button
              onClick={handleDismissShortlistAlert}
              className="w-full py-3 bg-primary-avocado hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Great, Let's Check it!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
