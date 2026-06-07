import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Briefcase, FileText, Sparkles, FolderOpen, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

import ProviderOverview from './ProviderOverview';
import MyJobListings from './MyJobListings';
import ProviderApplications from './ProviderApplications';
import PostJobModal from './PostJobModal';
import CheckoutModal from '../Common/CheckoutModal';

export default function ProviderDashboard({ triggerToast }) {
  const { currentUser, userData } = useAuth();
  const [activeSection, setActiveSection] = useState('Overview');
  const [filterJobId, setFilterJobId] = useState('All');
  
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPlanType, setCheckoutPlanType] = useState(null);
  const [seekerProfiles, setSeekerProfiles] = useState({});

  // Set up real-time listener for provider's jobs
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'jobs'),
      where('providerId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setJobs(jobsList);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to jobs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Set up real-time listener for provider's received applications
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'applications'),
      where('providerId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appsList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setApplications(appsList);
    }, (error) => {
      console.error("Error listening to applications:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Set up real-time listener for seeker profiles to fetch their avatars & plan tiers
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'users'),
      where('role', '==', 'seeker')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const profiles = {};
      snapshot.docs.forEach((docSnap) => {
        profiles[docSnap.id] = docSnap.data();
      });
      setSeekerProfiles(profiles);
    }, (error) => {
      console.error("Error listening to seeker profiles:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Client-side sorting: newest listings first
  const sortedJobs = [...jobs].sort((a, b) => {
    const timeA = a.postedAt?.toDate ? a.postedAt.toDate() : new Date(a.postedAt || 0);
    const timeB = b.postedAt?.toDate ? b.postedAt.toDate() : new Date(b.postedAt || 0);
    return timeB - timeA;
  });

  const sortedApplications = [...applications].sort((a, b) => {
    const timeA = a.appliedAt?.toDate ? a.appliedAt.toDate() : new Date(a.appliedAt || 0);
    const timeB = b.appliedAt?.toDate ? b.appliedAt.toDate() : new Date(b.appliedAt || 0);
    return timeB - timeA;
  });

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      triggerToast('Job listing deleted successfully.');
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Error deleting job listing. Please try again.");
    }
  };

  const handleViewApplicants = (jobId) => {
    setFilterJobId(jobId);
    setActiveSection('Applications');
  };

  const sidebarItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'My Job Listings', icon: Briefcase },
    { name: 'Applications', icon: FileText }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-avocado border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-muted-text">Loading dashboard workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg flex flex-col md:flex-row">
      
      {/* Left Sidebar */}
      <aside className="w-full md:w-64 bg-panel-bg border-b md:border-b-0 md:border-r border-border-divider flex flex-col justify-between p-5 md:min-h-[calc(100vh-64px)]">
        <div className="space-y-6">
          
          <div className="hidden md:block">
            <span className="text-[10px] font-bold tracking-wider uppercase text-muted-text select-none">
              Recruitment Center
            </span>
          </div>

          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveSection(item.name);
                    if (item.name !== 'Applications') setFilterJobId('All');
                  }}
                  className={`flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive 
                      ? 'bg-badge-dept-bg text-badge-dept-text border-l-[3px] border-primary-avocado rounded-l-none pl-3.5 shadow-2xs' 
                      : 'text-muted-text hover:text-body-text hover:bg-border-divider/10'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-primary-avocado' : 'text-muted-text'} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Billing Footer */}
        {userData?.role === 'provider' && (
          <div className="border-t border-border-divider/50 pt-4 mt-6 md:mt-0 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-text">Plan quota</span>
              {userData.plan === 'gold' ? (
                <span className="font-bold text-yellow-700 flex items-center gap-1 bg-yellow-100 border border-yellow-300 px-2 py-0.5 rounded-full select-none">
                  <Sparkles size={11} className="fill-yellow-600 text-yellow-600" /> Gold
                </span>
              ) : userData.plan === 'silver' ? (
                <span className="font-bold text-slate-600 flex items-center gap-1 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-full select-none">
                  <Sparkles size={11} className="fill-slate-500 text-slate-500" /> Silver ({jobs.length}/5)
                </span>
              ) : (
                <span className="font-medium text-amber-800 bg-badge-remote-bg px-2 py-0.5 rounded-full border border-amber-300/20 select-none">
                  Free ({jobs.length}/2)
                </span>
              )}
            </div>

            {userData.plan === 'free' && (
              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  onClick={() => {
                    setCheckoutPlanType('silver');
                    setCheckoutOpen(true);
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-body-text text-[11px] font-bold rounded-xl border border-slate-300 shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles size={11} />
                  Get Silver ($29)
                </button>
                <button
                  onClick={() => {
                    setCheckoutPlanType('gold');
                    setCheckoutOpen(true);
                  }}
                  className="w-full py-2 bg-primary-avocado hover:bg-primary-hover text-white text-[11px] font-bold rounded-xl shadow-xs transition-shadow flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles size={11} className="fill-white" />
                  Get Gold ($59)
                </button>
              </div>
            )}

            {userData.plan === 'silver' && (
              <button
                onClick={() => {
                  setCheckoutPlanType('gold');
                  setCheckoutOpen(true);
                }}
                className="w-full py-2 bg-primary-avocado hover:bg-primary-hover text-white text-[11px] font-bold rounded-xl shadow-xs transition-shadow flex items-center justify-center gap-1 cursor-pointer"
              >
                <Sparkles size={11} className="fill-white" />
                Upgrade to Gold ($59)
              </button>
            )}
          </div>
        )}

      </aside>

      {/* Right Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {activeSection === 'Overview' && (
          <ProviderOverview 
            jobs={sortedJobs} 
            applications={sortedApplications} 
          />
        )}
        
        {activeSection === 'My Job Listings' && (
          <MyJobListings 
            jobs={sortedJobs} 
            applications={sortedApplications} 
            onDeleteJob={handleDeleteJob} 
            onViewApplicants={handleViewApplicants}
            onOpenPostJob={() => setPostJobOpen(true)}
          />
        )}
        
        {activeSection === 'Applications' && (
          <ProviderApplications 
            jobs={sortedJobs} 
            applications={sortedApplications} 
            filterJobId={filterJobId} 
            setFilterJobId={setFilterJobId}
            onStatusChangeSuccess={triggerToast}
            seekerProfiles={seekerProfiles}
          />
        )}
      </main>

      {/* Modals */}
      <PostJobModal 
        isOpen={postJobOpen} 
        onClose={() => setPostJobOpen(false)} 
        onPostSuccess={triggerToast} 
        onShowUpgrade={() => setCheckoutOpen(true)}
        activeJobsCount={jobs.length}
      />

      <CheckoutModal 
        isOpen={checkoutOpen} 
        onClose={() => {
          setCheckoutOpen(false);
          setCheckoutPlanType(null);
        }} 
        planType={checkoutPlanType}
        onUpgradeSuccess={triggerToast} 
      />

    </div>
  );
}
