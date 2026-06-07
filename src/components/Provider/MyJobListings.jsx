import React from 'react';
import { Plus, Users, Trash2, ArrowUpRight, FolderOpen } from 'lucide-react';

export default function MyJobListings({ jobs, applications, onDeleteJob, onViewApplicants, onOpenPostJob }) {
  
  // Helper to count applicants for a specific job
  const getApplicantCount = (jobId) => {
    return applications.filter(app => app.jobId === jobId).length;
  };

  const getTypeBadgeStyles = (type) => {
    switch (type) {
      case 'Full-time':
        return 'bg-badge-ft-bg text-badge-ft-text border border-badge-ft-text/10';
      case 'Remote':
        return 'bg-badge-remote-bg text-badge-remote-text border border-badge-remote-text/10';
      case 'Part-time':
        return 'bg-badge-pt-bg text-badge-pt-text border border-badge-pt-text/10';
      case 'Contract':
        return 'bg-badge-contract-bg text-badge-contract-text border border-badge-contract-text/10';
      default:
        return 'bg-badge-dept-bg text-badge-dept-text';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-body-text">My Job Listings</h2>
          <p className="text-muted-text text-sm mt-1">Manage and track your active job advertisements.</p>
        </div>
        <button
          onClick={onOpenPostJob}
          className="flex items-center gap-2 py-3 px-5 bg-primary-avocado hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={16} />
          Post a New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white border border-border-divider rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs">
          <div className="p-4 bg-badge-dept-bg/40 text-primary-avocado rounded-full">
            <FolderOpen size={40} className="stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-body-text">No active job listings</h3>
            <p className="text-sm text-muted-text max-w-sm">
              Get started by creating your first job listing to receive applications from top talent.
            </p>
          </div>
          <button
            onClick={onOpenPostJob}
            className="text-xs font-semibold py-2.5 px-4 bg-primary-avocado hover:bg-primary-hover text-white rounded-xl shadow-sm transition-all"
          >
            Post a New Job
          </button>
        </div>
      ) : (
        <div className="bg-white border border-border-divider rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-panel-bg text-muted-text text-xs uppercase font-bold tracking-wider border-b border-border-divider/50">
                <tr>
                  <th scope="col" className="px-6 py-4">Job Details</th>
                  <th scope="col" className="px-6 py-4">Department</th>
                  <th scope="col" className="px-6 py-4">Type</th>
                  <th scope="col" className="px-6 py-4 text-center">Applicants</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-divider/30">
                {jobs.map((job) => {
                  const appCount = getApplicantCount(job.id);
                  return (
                    <tr key={job.id} className="hover:bg-panel-bg/30 transition-colors">
                      {/* Job details */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <strong className="font-semibold text-body-text text-base block">{job.title}</strong>
                          <span className="text-xs text-muted-text flex items-center gap-1.5">
                            {job.company} • 📍 {job.location} • 💰 {job.salary}
                          </span>
                        </div>
                      </td>
                      
                      {/* Department */}
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-badge-dept-bg text-badge-dept-text border border-primary-avocado/10">
                          {job.department}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getTypeBadgeStyles(job.type)}`}>
                          {job.type}
                        </span>
                      </td>

                      {/* Applicants count */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-primary-avocado bg-badge-dept-bg/35 border border-primary-avocado/10 px-2.5 py-0.5 rounded-full">
                          <Users size={13} />
                          {appCount}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2.5">
                          <button
                            onClick={() => onViewApplicants(job.id)}
                            className="p-2 border border-border-divider/60 hover:border-primary-avocado text-primary-avocado hover:bg-badge-dept-bg/20 rounded-xl transition-all flex items-center gap-1 font-semibold text-xs"
                            title="View Applicants"
                          >
                            <ArrowUpRight size={14} />
                            Applicants
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete the job listing "${job.title}"? This will not delete historical applications.`)) {
                                onDeleteJob(job.id);
                              }
                            }}
                            className="p-2 border border-red-200 hover:border-danger-reject text-danger-reject hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Listing"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
