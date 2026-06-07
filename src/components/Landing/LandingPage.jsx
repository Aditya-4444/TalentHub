import React from 'react';
import { Briefcase, Search } from 'lucide-react';

export default function LandingPage({ onSelectRole }) {
  return (
    <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center px-4 py-12">
      
      {/* Brand Header */}
      <div className="text-center mb-12 select-none">
        <h1 className="text-5xl font-black font-serif text-body-text tracking-tight flex items-center justify-center gap-1.5">
          TalentHub
          <span className="w-4 h-4 bg-primary-avocado rounded-full inline-block animate-pulse" />
        </h1>
        <p className="text-muted-text mt-4 max-w-md mx-auto text-sm sm:text-base font-medium">
          "Your next great hire — or your next great role — starts here"
        </p>
      </div>

      {/* Role Selection Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        {/* Card 1 — Job Provider */}
        <div className="bg-white border border-border-divider rounded-2xl p-8 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between items-center text-center space-y-6">
          <div className="p-4 bg-badge-dept-bg text-badge-dept-text rounded-2xl border border-primary-avocado/15">
            <Briefcase size={40} className="stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-body-text">I'm Hiring</h2>
            <p className="text-muted-text text-sm max-w-[280px]">
              Post jobs, manage listings, review applicants, and build your dream team.
            </p>
          </div>
          <button 
            onClick={() => onSelectRole('provider')}
            className="w-full py-3.5 bg-primary-avocado hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Login as Job Provider
          </button>
        </div>

        {/* Card 2 — Job Seeker */}
        <div className="bg-white border border-border-divider rounded-2xl p-8 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between items-center text-center space-y-6">
          <div className="p-4 bg-badge-remote-bg text-badge-remote-text rounded-2xl border border-amber-300/20">
            <Search size={40} className="stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-body-text">I'm Job Hunting</h2>
            <p className="text-muted-text text-sm max-w-[280px]">
              Browse openings, apply instantly with ease, and track your application status.
            </p>
          </div>
          <button 
            onClick={() => onSelectRole('seeker')}
            className="w-full py-3.5 bg-primary-avocado hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Login as Job Seeker
          </button>
        </div>

      </div>

      {/* Footer Branding */}
      <div className="mt-16 text-center text-[11px] text-muted-text">
        © {new Date().getFullYear()} TalentHub Inc. All rights reserved.
      </div>

    </div>
  );
}
