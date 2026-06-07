import React from 'react';
import { Briefcase, FileText, Clock, UserCheck } from 'lucide-react';

export default function ProviderOverview({ jobs, applications }) {
  const activeJobsCount = jobs.length;
  const totalAppsCount = applications.length;
  
  const pendingAppsCount = applications.filter(app => app.status === 'Pending').length;
  const shortlistedAppsCount = applications.filter(app => app.status === 'Shortlisted').length;

  const statCards = [
    {
      id: 'active-jobs',
      label: 'My Active Jobs',
      value: activeJobsCount,
      icon: Briefcase,
      iconColor: 'text-primary-avocado',
      bgColor: 'bg-badge-dept-bg/40'
    },
    {
      id: 'total-apps',
      label: 'Total Applications',
      value: totalAppsCount,
      icon: FileText,
      iconColor: 'text-amber-600',
      bgColor: 'bg-badge-remote-bg/40'
    },
    {
      id: 'pending-review',
      label: 'Pending Review',
      value: pendingAppsCount,
      icon: Clock,
      iconColor: 'text-amber-800',
      bgColor: 'bg-badge-pt-bg/40'
    },
    {
      id: 'shortlisted',
      label: 'Shortlisted',
      value: shortlistedAppsCount,
      icon: UserCheck,
      iconColor: 'text-primary-avocado',
      bgColor: 'bg-badge-ft-bg/40'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold font-serif text-body-text">Dashboard Overview</h2>
        <p className="text-muted-text text-sm mt-1">Real-time metrics for your recruiting pipeline.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.id}
              className="bg-white border border-border-divider rounded-2xl p-6 flex items-center justify-between shadow-2xs hover:shadow-md transition-shadow"
            >
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-text block">{card.label}</span>
                <span className="text-4xl font-extrabold text-primary-avocado">{card.value}</span>
              </div>
              <div className={`p-4 rounded-xl ${card.bgColor} ${card.iconColor} border border-border-divider/10`}>
                <Icon size={24} className="stroke-[2]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
