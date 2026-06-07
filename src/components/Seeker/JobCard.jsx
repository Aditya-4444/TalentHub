import React, { useState } from 'react';
import { MapPin, DollarSign, Clock, Briefcase, Sparkles } from 'lucide-react';

export default function JobCard({ job, hasApplied, onViewDetails }) {
  const [hovered, setHovered] = useState(false);

  const getTypeBadgeStyles = (type) => {
    switch (type) {
      case 'Full-time':
        return 'bg-badge-ft-bg text-badge-ft-text';
      case 'Remote':
        return 'bg-badge-remote-bg text-badge-remote-text';
      case 'Part-time':
        return 'bg-badge-pt-bg text-badge-pt-text';
      case 'Contract':
        return 'bg-badge-contract-bg text-badge-contract-text';
      default:
        return 'bg-badge-dept-bg text-badge-dept-text';
    }
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const postedDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - postedDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white border rounded-xl p-5 flex flex-col justify-between h-full transition-all duration-300 relative overflow-hidden"
      style={{ 
        boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.08)' : 'none', 
        borderColor: hovered ? '#B89A6A' : '#D4B896' 
      }}
    >
      {/* Sparkle badge for system seed premium jobs */}
      {job.providerId === 'system-seed' && (
        <div className="absolute top-0 right-0 bg-primary-avocado text-white pl-3 pr-2 py-0.5 rounded-bl-xl text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 select-none">
          <Sparkles size={8} className="fill-white" />
          Featured
        </div>
      )}

      {/* Main details */}
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-text uppercase tracking-wider truncate max-w-[120px]">
                {job.company}
              </span>
            </div>
            <h3 className="text-lg font-bold text-body-text font-serif leading-tight">
              {job.title}
            </h3>
          </div>
          {/* Logo initial circle */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm bg-panel-bg shrink-0 border border-border-divider/50 text-primary-avocado">
            {job.company ? job.company.substring(0, 2).toUpperCase() : 'CO'}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTypeBadgeStyles(job.type)}`}>
            {job.type}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-badge-dept-bg text-badge-dept-text border border-primary-avocado/10">
            {job.department}
          </span>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-text pt-1">
          <span className="flex items-center gap-1">
            <MapPin size={13} className="text-primary-avocado shrink-0" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign size={13} className="text-primary-avocado shrink-0" />
            {job.salary}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-primary-avocado shrink-0" />
            {getRelativeTime(job.postedAt)}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5 pt-4 border-t border-border-divider/20">
        {hasApplied ? (
          <div className="w-full text-center py-2.5 bg-badge-ft-bg border border-badge-ft-text/25 text-badge-ft-text font-bold text-xs rounded-lg select-none">
            Already Applied
          </div>
        ) : (
          <button
            onClick={() => onViewDetails(job)}
            className="w-full py-2.5 bg-primary-avocado hover:bg-primary-hover text-white font-semibold text-xs rounded-lg shadow-2xs hover:shadow-xs transition-shadow"
          >
            View Details & Apply
          </button>
        )}
      </div>
    </div>
  );
}

