import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, Bell, Edit3, ChevronDown, Sparkles, HelpCircle, BookOpen, Briefcase, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ 
  onOpenProfile, 
  onOpenEditProfile, 
  seekerOpeningsCount,
  notifications = [],
  unreadCount = 0,
  onNotificationClick,
  onMarkAllAsRead,
  readNotificationIds = [],
  onOpenFAQ,
  onOpenBlogs,
  onOpenServices,
  activeTab,
  setActiveTab,
  applicationsCount
}) {
  const { userData, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDay}d ago`;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border-divider shadow-xs h-16 flex items-center justify-between px-6">
      
      {/* Left: Brand Logo & Navigation Tabs */}
      <div className="flex items-center gap-6 select-none">
        <h1 className="text-xl font-bold font-serif text-body-text tracking-tight flex items-center">
          TalentHub
          <span className="w-2 h-2 bg-primary-avocado rounded-full ml-1 inline-block" />
        </h1>

        {/* Navigation Tabs for Seekers */}
        {userData?.role === 'seeker' && activeTab && (
          <div className="hidden sm:flex items-center gap-1 bg-page-bg/60 p-1 rounded-xl border border-border-divider/30">
            <button
              onClick={() => setActiveTab('find-jobs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeTab === 'find-jobs'
                  ? 'bg-white text-primary-hover shadow-3xs border border-border-divider/50'
                  : 'text-muted-text hover:text-body-text'
              }`}
            >
              <Briefcase size={12} />
              Explore Openings
            </button>
            <button
              onClick={() => setActiveTab('my-applications')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeTab === 'my-applications'
                  ? 'bg-white text-primary-hover shadow-3xs border border-border-divider/50'
                  : 'text-muted-text hover:text-body-text'
              }`}
            >
              <FileText size={12} />
              My Applications {applicationsCount !== undefined && `(${applicationsCount})`}
            </button>
          </div>
        )}
      </div>

      {/* Center: Role Pill Badge */}
      <div className="hidden lg:flex items-center">
        <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold bg-badge-dept-bg text-badge-dept-text border border-primary-avocado/20 shadow-2xs">
          {userData?.plan === 'gold' && (
            <Sparkles size={12} className="fill-amber-500 text-amber-600 shrink-0 mr-0.5 animate-pulse" />
          )}
          {userData?.plan === 'silver' && (
            <Sparkles size={12} className="fill-slate-400 text-slate-500 shrink-0 mr-0.5" />
          )}
          {userData?.role === 'provider' ? 'Job Provider' : (
            seekerOpeningsCount !== null 
              ? `Job Seeker • ${seekerOpeningsCount} Live Openings` 
              : 'Job Seeker'
          )}
          <span className="text-[10px] opacity-75 font-normal uppercase ml-1">
            ({userData?.plan || 'free'})
          </span>
        </span>
      </div>

      {/* Right Actions: Notification Bell, Profile Dropdown, Logout */}
      <div className="flex items-center gap-4">
        
        {/* Upgrade Button for Free Users */}
        {userData?.plan !== 'silver' && userData?.plan !== 'gold' && (
          <button 
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 text-yellow-800 text-xs font-bold rounded-xl shadow-2xs hover:shadow-xs transition-all animate-bounce-short cursor-pointer"
          >
            <Sparkles size={13} className="fill-yellow-500 text-yellow-600" />
            Upgrade Plan
          </button>
        )}

        {/* Services Button */}
        {userData && (
          <button 
            onClick={onOpenServices}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-primary-avocado/30 hover:bg-primary-avocado/5 text-xs font-bold text-body-text rounded-xl transition-all shadow-3xs hover:shadow-2xs cursor-pointer"
          >
            <Sparkles size={13} className="text-primary-avocado fill-primary-avocado/20 animate-pulse" />
            Services
          </button>
        )}

        {/* Bell Icon with Interactive Dropdown (Seekers only) */}
        {userData?.role === 'seeker' ? (
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-2 text-muted-text hover:text-body-text hover:bg-page-bg rounded-xl transition-colors relative focus:outline-none"
              aria-label="Notifications"
              aria-expanded={notifDropdownOpen}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4.5 h-4.5 px-1 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-[9px] border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-border-divider rounded-2xl shadow-xl py-2 z-50 animate-scale-up max-h-[420px] flex flex-col">
                <div className="px-4 py-2.5 border-b border-border-divider/40 flex items-center justify-between bg-panel-bg/20">
                  <h3 className="text-xs font-bold text-body-text uppercase tracking-wider">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => {
                        onMarkAllAsRead();
                      }}
                      className="text-[10px] font-bold text-primary-avocado hover:text-primary-hover hover:underline bg-transparent"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto flex-1 divide-y divide-border-divider/20 scrollbar-thin max-h-[320px]">
                  {notifications.length === 0 ? (
                    <div className="py-8 px-4 text-center text-xs text-muted-text space-y-1">
                      <p className="font-semibold text-body-text">All caught up! 🎉</p>
                      <p className="text-[10px]">No new job openings or shortlists in the last 7 days.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const isUnread = !readNotificationIds.includes(notif.id);
                      return (
                        <div 
                          key={notif.id}
                          onClick={() => {
                            onNotificationClick(notif);
                            setNotifDropdownOpen(false);
                          }}
                          className={`p-3.5 hover:bg-page-bg transition-colors cursor-pointer flex gap-3 text-left relative items-start ${
                            isUnread ? 'bg-primary-avocado/5' : ''
                          }`}
                        >
                          {/* Unread indicator dot */}
                          {isUnread && (
                            <span className="absolute top-4.5 left-2.5 w-1.5 h-1.5 bg-primary-avocado rounded-full" />
                          )}
                          
                          <div className="flex-1 space-y-1 pl-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${
                                notif.type === 'shortlist' 
                                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                                  : 'bg-primary-avocado/10 text-primary-hover border border-primary-avocado/20'
                              }`}>
                                {notif.type === 'shortlist' ? 'Shortlist' : 'New Job'}
                              </span>
                              <span className="text-[9px] text-muted-text font-medium">
                                {formatTimeAgo(notif.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-body-text leading-snug">{notif.title}</p>
                            <p className="text-[11px] text-muted-text font-medium leading-relaxed">{notif.message}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Decorative/Simple Bell for Job Providers */
          <button 
            className="p-2 text-muted-text hover:text-body-text hover:bg-page-bg rounded-xl transition-colors relative cursor-not-allowed opacity-60"
            title="Provider notifications arriving soon!"
            disabled
          >
            <Bell size={20} />
          </button>
        )}

        {/* Divider */}
        <div className="w-[1px] h-6 bg-border-divider/50" />

        {/* Profile Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 p-1 hover:bg-page-bg rounded-xl transition-colors focus:outline-none"
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            {userData?.photoURL ? (
              <img 
                src={userData.photoURL} 
                alt={userData.displayName} 
                className={`w-8 h-8 rounded-full object-cover ${
                  userData?.plan === 'gold' ? 'border-2 border-gold-glow' : 
                  userData?.plan === 'silver' ? 'border-2 border-silver-glow' : 
                  'border border-primary-avocado/30'
                }`}
              />
            ) : (
              <div className={`w-8 h-8 rounded-full bg-badge-dept-bg text-badge-dept-text flex items-center justify-center font-bold text-xs ${
                userData?.plan === 'gold' ? 'border-2 border-gold-glow' : 
                userData?.plan === 'silver' ? 'border-2 border-silver-glow' : 
                'border border-primary-avocado/20'
              }`}>
                {getInitials(userData?.displayName)}
              </div>
            )}
            <ChevronDown size={14} className={`text-muted-text transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-border-divider rounded-xl shadow-xl py-1.5 z-50 animate-scale-up">
              <div className="px-4 py-2 border-b border-border-divider/30 text-left">
                <p className="text-sm font-semibold text-body-text truncate">{userData?.displayName}</p>
                <p className="text-[10px] text-muted-text truncate">{userData?.email}</p>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenProfile();
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-body-text hover:bg-page-bg flex items-center gap-2 transition-colors cursor-pointer"
              >
                <User size={14} className="text-primary-avocado" />
                View Profile
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenEditProfile();
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-body-text hover:bg-page-bg flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Edit3 size={14} className="text-primary-avocado" />
                Edit Profile
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenFAQ();
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-body-text hover:bg-page-bg flex items-center gap-2 transition-colors cursor-pointer"
              >
                <HelpCircle size={14} className="text-primary-avocado" />
                Help & FAQ
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenBlogs();
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-body-text hover:bg-page-bg flex items-center gap-2 transition-colors cursor-pointer"
              >
                <BookOpen size={14} className="text-primary-avocado" />
                Blogs & Guides
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenServices();
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-body-text hover:bg-page-bg flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles size={14} className="text-primary-avocado" />
                Career Services
              </button>

              <div className="w-full border-t border-border-divider/30 my-1" />

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-danger-reject hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
