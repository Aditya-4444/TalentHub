import React from 'react';
import { Calendar, Building, FileCheck, HelpCircle } from 'lucide-react';

export default function SeekerApplications({ applications }) {

  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-badge-remote-bg text-badge-remote-text border border-amber-300/20';
      case 'Reviewed':
        return 'bg-badge-dept-bg text-badge-dept-text border border-primary-avocado/15';
      case 'Shortlisted':
        return 'bg-badge-ft-bg text-badge-ft-text border border-primary-avocado/30';
      case 'Rejected':
        return 'bg-red-50 text-danger-reject border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold font-serif text-body-text">My Applications</h2>
        <p className="text-muted-text text-sm mt-1">Track the progress of your active career applications.</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white border border-border-divider rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs">
          <div className="p-4 bg-badge-dept-bg/40 text-primary-avocado rounded-full">
            <FileCheck size={40} className="stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-body-text">No applications yet</h3>
            <p className="text-sm text-muted-text max-w-sm">
              You haven't submitted any job applications. Browse the open listings to find your next move!
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-border-divider rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-panel-bg text-muted-text text-xs uppercase font-bold tracking-wider border-b border-border-divider/50">
                <tr>
                  <th scope="col" className="px-6 py-4">Position</th>
                  <th scope="col" className="px-6 py-4">Company</th>
                  <th scope="col" className="px-6 py-4">Date Applied</th>
                  <th scope="col" className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-divider/30">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-panel-bg/30 transition-colors">
                    {/* Position */}
                    <td className="px-6 py-4 font-semibold text-body-text">
                      {app.jobTitle}
                    </td>
                    
                    {/* Company */}
                    <td className="px-6 py-4 text-muted-text flex items-center gap-1.5 mt-0.5">
                      <Building size={14} className="text-primary-avocado" />
                      {app.company}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-muted-text">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-primary-avocado" />
                        {formatDate(app.appliedAt)}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeStyles(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
