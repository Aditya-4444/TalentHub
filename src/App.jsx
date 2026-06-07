import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { db, isFirebaseConfigured } from './services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import LandingPage from './components/Landing/LandingPage';
import AuthScreen from './components/Auth/AuthScreen';
import Navbar from './components/Common/Navbar';
import ProfileDrawer from './components/Common/ProfileDrawer';
import CheckoutModal from './components/Common/CheckoutModal';
import Toast from './components/Common/Toast';
import FAQModal from './components/Common/FAQModal';
import BlogModal from './components/Common/BlogModal';
import ServicesModal from './components/Common/ServicesModal';

import ProviderDashboard from './components/Provider/ProviderDashboard';
import SeekerDashboard from './components/Seeker/SeekerDashboard';

export default function App() {
  const { currentUser, userData, loading, profileLoaded, createProfileDocument, logout } = useAuth();
  
  // Local navigation states for unauthenticated users
  const [roleSelection, setRoleSelection] = useState(null); // 'provider' | 'seeker' | null

  // Local profile setup states for newly authenticated users missing Firestore docs
  const [setupRole, setSetupRole] = useState('seeker');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState('');

  const handleCreateProfile = async () => {
    setSetupLoading(true);
    setSetupError('');
    try {
      await createProfileDocument(setupRole);
    } catch (err) {
      console.error(err);
      setSetupError('Failed to initialize profile. Please verify database connection.');
      setSetupLoading(false);
    }
  };

  // Global overlay states for authenticated users
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerEditMode, setDrawerEditMode] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPlanType, setCheckoutPlanType] = useState(null); // 'silver' | 'gold'
  
  // FAQ and Blog Modal Open states
  const [faqOpen, setFaqOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  // Real-time search openings count state (for Seeker navbar center pill)
  const [seekerOpeningsCount, setSeekerOpeningsCount] = useState(null);

  // Global Toast Alert State
  const [toast, setToast] = useState(null); // { message: '', type: 'success' | 'error' }

  // Seeker data state lifted from SeekerDashboard
  const [seekerJobs, setSeekerJobs] = useState([]);
  const [seekerApplications, setSeekerApplications] = useState([]);
  const [seekerJobsLoading, setSeekerJobsLoading] = useState(true);
  const [seekerActiveTab, setSeekerActiveTab] = useState('find-jobs');
  const [selectedJobFromNotification, setSelectedJobFromNotification] = useState(null);

  // Notifications state
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    if (!currentUser) return [];
    try {
      const saved = localStorage.getItem(`read_notifications_${currentUser.uid}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Keep readNotificationIds in sync with localStorage when currentUser changes
  useEffect(() => {
    if (currentUser) {
      try {
        const saved = localStorage.getItem(`read_notifications_${currentUser.uid}`);
        setReadNotificationIds(saved ? JSON.parse(saved) : []);
      } catch (e) {
        setReadNotificationIds([]);
      }
    } else {
      setReadNotificationIds([]);
    }
  }, [currentUser]);

  // Sync back to localStorage
  const syncReadNotifications = (newReadIds) => {
    if (currentUser) {
      localStorage.setItem(`read_notifications_${currentUser.uid}`, JSON.stringify(newReadIds));
      setReadNotificationIds(newReadIds);
    }
  };

  // Subscribe to all jobs and applications for Seeker
  useEffect(() => {
    if (!currentUser || userData?.role !== 'seeker') {
      setSeekerJobs([]);
      setSeekerApplications([]);
      setSeekerJobsLoading(false);
      return;
    }

    setSeekerJobsLoading(true);

    // 1. Subscribe to all jobs
    const jobsCollection = collection(db, 'jobs');
    const unsubJobs = onSnapshot(jobsCollection, (snapshot) => {
      const jobsList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setSeekerJobs(jobsList);
      setSeekerJobsLoading(false);
    }, (error) => {
      console.error("Error listening to jobs in App.jsx:", error);
      setSeekerJobsLoading(false);
    });

    // 2. Subscribe to user's applications
    const appsQuery = query(
      collection(db, 'applications'),
      where('seekerId', '==', currentUser.uid)
    );
    const unsubApps = onSnapshot(appsQuery, (snapshot) => {
      const appsList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setSeekerApplications(appsList);
    }, (error) => {
      console.error("Error listening to applications in App.jsx:", error);
    });

    return () => {
      unsubJobs();
      unsubApps();
    };
  }, [currentUser, userData?.role]);

  // Build notifications list
  const getNotifications = () => {
    if (userData?.role !== 'seeker') return [];

    const list = [];
    const now = new Date();

    // A. Add new job notifications (from last 7 days)
    seekerJobs.forEach((job) => {
      const postedDate = job.postedAt?.toDate ? job.postedAt.toDate() : new Date(job.postedAt || 0);
      const diffTime = Math.abs(now - postedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        list.push({
          id: `new_job_${job.id}`,
          type: 'new_job',
          title: 'New Job Opening',
          message: `${job.title} at ${job.company}`,
          timestamp: postedDate,
          job: job
        });
      }
    });

    // B. Add shortlist notifications
    seekerApplications.forEach((app) => {
      if (app.status === 'Shortlisted') {
        const timestamp = app.appliedAt?.toDate ? app.appliedAt.toDate() : new Date(app.appliedAt || 0);
        list.push({
          id: `shortlist_${app.id}`,
          type: 'shortlist',
          title: 'Profile Shortlisted! 🎉',
          message: `You were shortlisted for ${app.jobTitle} by ${app.company}.`,
          timestamp: timestamp,
          app: app
        });
      }
    });

    // Sort newest first
    return list.sort((a, b) => b.timestamp - a.timestamp);
  };

  const seekerNotifications = getNotifications();
  const unreadCount = seekerNotifications.filter(n => !readNotificationIds.includes(n.id)).length;

  const handleMarkNotificationAsRead = (id) => {
    if (!readNotificationIds.includes(id)) {
      const updated = [...readNotificationIds, id];
      syncReadNotifications(updated);
    }
  };

  const handleMarkAllNotificationsAsRead = () => {
    const allIds = seekerNotifications.map(n => n.id);
    const updated = Array.from(new Set([...readNotificationIds, ...allIds]));
    syncReadNotifications(updated);
  };

  const handleNotificationClick = (notification) => {
    handleMarkNotificationAsRead(notification.id);
    if (notification.type === 'new_job') {
      setSeekerActiveTab('find-jobs');
      setSelectedJobFromNotification(notification.job);
    } else if (notification.type === 'shortlist') {
      setSeekerActiveTab('my-applications');
    }
  };

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleOpenProfile = () => {
    setDrawerEditMode(false);
    setDrawerOpen(true);
  };

  const handleOpenEditProfile = () => {
    setDrawerEditMode(true);
    setDrawerOpen(true);
  };

  // Graceful setup guide fallback
  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="bg-white border border-border-divider rounded-2xl p-8 max-w-md w-full shadow-lg space-y-6">
          <div className="w-12 h-12 rounded-full bg-badge-remote-bg text-badge-remote-text flex items-center justify-center mx-auto border border-amber-300">
            <span className="text-xl font-bold">!</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-serif text-body-text">Firebase Setup Required</h2>
            <p className="text-xs text-muted-text">
              TalentHub needs a Firebase configuration to authenticate users and persist listings.
            </p>
          </div>
          <div className="text-left text-xs bg-panel-bg p-4 rounded-xl border border-border-divider/50 space-y-3">
            <p className="font-semibold text-body-text">Follow these steps:</p>
            <ol className="list-decimal pl-4 space-y-1.5 text-muted-text">
              <li>Create a file named <code className="bg-white px-1.5 py-0.5 rounded border border-border-divider font-mono">.env.local</code> in the project root folder.</li>
              <li>Copy variables from the template <code className="bg-white px-1.5 py-0.5 rounded border border-border-divider font-mono">.env.example</code>.</li>
              <li>Provide your actual Firebase project settings.</li>
            </ol>
            <p className="text-[10px] text-amber-800 leading-tight">Note: Save the file and Vite will automatically reload the application.</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading gate
  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-avocado border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-muted-text">Connecting to TalentHub...</p>
        </div>
      </div>
    );
  }

  // UNAUTHENTICATED FLOW
  if (!currentUser) {
    if (!roleSelection) {
      return <LandingPage onSelectRole={setRoleSelection} />;
    }
    return (
      <AuthScreen 
        selectedRole={roleSelection} 
        onBackToLanding={() => setRoleSelection(null)} 
      />
    );
  }

  // 1. PROFILE LOADING STATE (Firestore query hasn't completed yet)
  if (!profileLoaded) {
    return (
      <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="bg-white border border-border-divider rounded-2xl p-8 max-w-md w-full shadow-lg space-y-6">
          <div className="w-10 h-10 border-4 border-primary-avocado border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-serif text-body-text">Loading Profile...</h2>
            <p className="text-xs text-muted-text leading-relaxed">
              We are retrieving your credentials from Firestore. This might take a moment if your database is not initialized.
            </p>
          </div>
          
          <div className="border-t border-border-divider/40 pt-4 flex flex-col items-center gap-3">
            <span className="text-[10px] text-muted-text leading-tight">
              Stuck here? Please make sure you have enabled **Firestore Database** in the Firebase Console.
            </span>
            <button
              onClick={() => logout()}
              className="text-xs font-semibold py-2 px-4 border border-red-200 hover:border-danger-reject text-danger-reject hover:bg-red-50 rounded-xl transition-all shadow-2xs hover:shadow-xs"
            >
              Sign Out & Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. MISSING USER DOCUMENT GATE (Auth exists, but no user document found in Firestore)
  if (profileLoaded && !userData) {
    return (
      <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="bg-white border border-border-divider rounded-2xl p-8 max-w-md w-full shadow-lg space-y-6">
          <div className="w-12 h-12 rounded-full bg-badge-dept-bg text-badge-dept-text flex items-center justify-center mx-auto border border-primary-avocado/30">
            <span className="text-lg font-bold">✓</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-serif text-body-text">Complete Your Setup</h2>
            <p className="text-xs text-muted-text">
              We found your login, but you don't have a profile role set up in our database yet.
            </p>
          </div>

          {setupError && (
            <div className="text-xs font-medium text-danger-reject bg-red-50 border border-red-200 p-2.5 rounded-xl">
              {setupError}
            </div>
          )}

          <div className="space-y-3 text-left">
            <label htmlFor="roleSetupSelect" className="block text-xs font-semibold text-muted-text mb-1">Select Your Profile Role:</label>
            <select
              id="roleSetupSelect"
              value={setupRole}
              onChange={(e) => setSetupRole(e.target.value)}
              disabled={setupLoading}
              className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-4 py-2.5 bg-white"
            >
              <option value="seeker">Job Seeker (Explore & Apply)</option>
              <option value="provider">Job Provider (Hire & Post Jobs)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleCreateProfile}
              disabled={setupLoading}
              className="w-full py-3 bg-primary-avocado hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {setupLoading ? 'Creating profile...' : 'Finish Setup'}
            </button>
            <button
              onClick={() => logout()}
              disabled={setupLoading}
              className="w-full py-2.5 border border-border-divider/50 hover:bg-page-bg text-muted-text hover:text-body-text text-xs font-semibold rounded-xl transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED FLOW (GATED BY ROLE)
  return (
    <div className="min-h-screen bg-page-bg text-body-text flex flex-col">
      {/* Sticky Persistent Navbar */}
      <Navbar 
        onOpenProfile={handleOpenProfile}
        onOpenEditProfile={handleOpenEditProfile}
        seekerOpeningsCount={seekerOpeningsCount} // Passed down to update seeker count pill
        notifications={seekerNotifications}
        unreadCount={unreadCount}
        onNotificationClick={handleNotificationClick}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        readNotificationIds={readNotificationIds}
        onOpenFAQ={() => setFaqOpen(true)}
        onOpenBlogs={() => setBlogOpen(true)}
        onOpenServices={() => setServicesOpen(true)}
        activeTab={seekerActiveTab}
        setActiveTab={setSeekerActiveTab}
        applicationsCount={seekerApplications.length}
      />

      {/* Role-based Dashboard Gating */}
      <div className="flex-1">
        {userData.role === 'provider' ? (
          <ProviderDashboard triggerToast={triggerToast} />
        ) : (
          <SeekerDashboard 
            triggerToast={triggerToast} 
            onFilteredCountChange={setSeekerOpeningsCount}
            onOpenProfile={handleOpenProfile}
            jobs={seekerJobs}
            applications={seekerApplications}
            loading={seekerJobsLoading}
            activeTab={seekerActiveTab}
            setActiveTab={setSeekerActiveTab}
            selectedJobFromNotification={selectedJobFromNotification}
            setSelectedJobFromNotification={setSelectedJobFromNotification}
          />
        )}
      </div>

      {/* Right Slide-in Profile Drawer Overlay */}
      <ProfileDrawer 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initialEditMode={drawerEditMode}
        onShowUpgrade={(planType) => {
          setDrawerOpen(false);
          setCheckoutPlanType(planType);
          setCheckoutOpen(true);
        }}
        onSaveSuccess={triggerToast}
      />

      {/* Subscription Upgrade Modal Overlay */}
      <CheckoutModal 
        isOpen={checkoutOpen}
        onClose={() => {
          setCheckoutOpen(false);
          setCheckoutPlanType(null);
        }}
        planType={checkoutPlanType}
        onUpgradeSuccess={triggerToast}
      />

      {/* Self-dismissing Toast Alert */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* FAQ Center Overlay */}
      <FAQModal 
        isOpen={faqOpen} 
        onClose={() => setFaqOpen(false)} 
      />

      {/* Blog Center Overlay */}
      <BlogModal 
        isOpen={blogOpen} 
        onClose={() => setBlogOpen(false)} 
      />

      {/* Services Center Overlay */}
      <ServicesModal 
        isOpen={servicesOpen} 
        onClose={() => setServicesOpen(false)} 
      />

    </div>
  );
}
