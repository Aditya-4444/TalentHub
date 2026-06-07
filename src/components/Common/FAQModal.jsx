import React, { useState } from 'react';
import { X, Search, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const FAQ_DATA = [
  {
    category: "Account & Profile",
    questions: [
      {
        q: "How do I switch between Seeker and Provider roles?",
        a: "Currently, roles are configured during your initial profile setup. If you want to hire candidates and apply for jobs under the same identity, we recommend registering two separate accounts with different emails to keep your applications and job postings cleanly organized."
      },
      {
        q: "How do I upgrade my plan and what are the benefits?",
        a: "To upgrade, open your profile dropdown and click 'View Profile' or click the 'Upgrade Plan' button in the navbar. Seekers with premium plans (Silver and Gold) get special glowing profile borders and priority visibility. Providers get higher job posting quotas."
      },
      {
        q: "How do I update my profile details?",
        a: "You can click on your profile picture in the top-right corner, select 'Edit Profile', and update your headline, bio, location, and links. Your changes will sync in real-time."
      }
    ]
  },
  {
    category: "Applications & AI Features",
    questions: [
      {
        q: "How does the 'Draft with AI' Cover Letter tool work?",
        a: "Inside the job application modal, click the 'Draft with AI' button. The assistant will read the job requirements alongside your seeker profile headline, bio, and interests to generate a highly personalized cover note. You can preview, edit, and insert the draft with a single click."
      },
      {
        q: "Can I upload a resume file when applying?",
        a: "Yes! The application form includes a dedicated resume upload section supporting PDF, DOC, and DOCX files up to 1MB. Resumes are converted to base64 strings and saved directly in Firestore, allowing employers to view or download them instantly."
      },
      {
        q: "Why does my dashboard feed only show certain jobs by default?",
        a: "To keep your feed personalized, we filter job openings based on the department interests you selected during your first login. You can easily click the 'Explore All Jobs' button at the top of your feed or search via keywords to query all openings."
      }
    ]
  },
  {
    category: "Recruitment & Job Posting",
    questions: [
      {
        q: "What are the job posting limits for employers?",
        a: "Employers on the Free plan can post up to 2 active listings. The Silver plan upgrades your quota to 5 active jobs, and the Gold plan offers unlimited active postings."
      },
      {
        q: "How does the AI Job Description Generator work?",
        a: "When posting a job, fill in the Job Title and select a Department, then click 'Draft with AI'. The tool analyzes your title keywords and drafts a comprehensive job description outlining the role overview, responsibilities, requirements, and benefits."
      },
      {
        q: "How do I review candidates who applied to my listings?",
        a: "Navigate to 'Applications' in the recruitment sidebar. Here, you can filter by job listing, review cover letters, download candidate resumes, and update application statuses (Reviewed, Shortlisted, Rejected) in real-time."
      }
    ]
  }
];

export default function FAQModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null); // format: "categoryIndex-questionIndex"

  if (!isOpen) return null;

  const handleToggle = (key) => {
    setExpandedIndex(expandedIndex === key ? null : key);
  };

  // Filter FAQs based on search query
  const filteredFAQ = FAQ_DATA.map((cat, catIdx) => {
    const questions = cat.questions.filter(
      item => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...cat, questions, catIdx };
  }).filter(cat => cat.questions.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white border border-border-divider rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between animate-scale-up">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-divider/50 flex items-center justify-between bg-panel-bg/40">
          <div className="flex items-center gap-2">
            <HelpCircle size={22} className="text-primary-avocado" />
            <h2 className="text-xl font-bold font-serif text-body-text">Help & FAQ Center</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-muted-text hover:text-body-text rounded-full hover:bg-page-bg transition-colors"
            aria-label="Close FAQ modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 bg-panel-bg/15 border-b border-border-divider/30">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-text">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search questions, answers, keywords..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setExpandedIndex(null); // Reset expand states during search
              }}
              className="w-full text-xs pl-9 pr-4 py-2.5 border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl bg-white shadow-3xs"
            />
          </div>
        </div>

        {/* FAQ Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {filteredFAQ.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-text">
              No matching questions found for "{searchQuery}".
            </div>
          ) : (
            filteredFAQ.map((category, catIdx) => (
              <div key={catIdx} className="space-y-3 text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary-avocado border-b border-border-divider/20 pb-1.5">
                  {category.category}
                </h3>
                
                <div className="divide-y divide-border-divider/20 border border-border-divider/40 rounded-xl overflow-hidden bg-white shadow-3xs">
                  {category.questions.map((item, qIdx) => {
                    const uniqueKey = `${category.catIdx}-${qIdx}`;
                    const isExpanded = expandedIndex === uniqueKey;
                    
                    return (
                      <div key={qIdx} className="transition-all duration-200">
                        {/* Question Selector Header */}
                        <button
                          onClick={() => handleToggle(uniqueKey)}
                          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-page-bg/40 font-semibold text-xs text-body-text transition-colors focus:outline-none"
                        >
                          <span className="pr-4 leading-tight">{item.q}</span>
                          {isExpanded ? (
                            <ChevronUp size={16} className="text-primary-avocado shrink-0" />
                          ) : (
                            <ChevronDown size={16} className="text-muted-text shrink-0" />
                          )}
                        </button>

                        {/* Answer Details Accordion */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-1 text-xs text-muted-text leading-relaxed font-medium bg-page-bg/15 animate-slide-in">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-divider/30 bg-panel-bg/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-border-divider hover:bg-white text-xs font-semibold rounded-xl text-body-text transition-colors cursor-pointer"
          >
            Close Help Center
          </button>
        </div>

      </div>
    </div>
  );
}
