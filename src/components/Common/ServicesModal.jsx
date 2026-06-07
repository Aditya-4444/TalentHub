import { useState, useEffect } from 'react';
import { 
  X, Sparkles, FileText, Brain, TrendingUp, MessageSquare, Send, 
  Plus, Trash2, Printer, Check, Award, Mail, 
  Phone, ArrowRight, ShieldAlert, CheckCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const RESUME_TEMPLATES = [
  { id: 'classic', label: 'Classic Corporate', desc: 'Elegant, traditional black & white layout for corporate roles.' },
  { id: 'avocado', label: 'Creative Avocado', desc: 'Stylish green highlights and modern typography for creative/tech roles.' },
  { id: 'executive', label: 'Modern Executive', desc: 'Premium two-column layout with visual section divides.' }
];

const MOCK_INTERVIEW_QUESTIONS = {
  software: [
    "Explain the concept of closures in JavaScript, and why they are useful.",
    "How do you optimize a webpage to achieve a sub-second load time? Discuss caching, assets, and rendering.",
    "Describe a complex technical challenge you faced. How did you diagnose, debug, and resolve it?"
  ],
  design: [
    "What is your process for establishing a design system for a complex SaaS application?",
    "How do you handle negative stakeholder feedback on a design layout you strongly believe in?",
    "Discuss the difference between UX and UI. Give an example of a great UX decision that had simple UI."
  ],
  product: [
    "How do you prioritize a product roadmap when engineering resources are tight and sales has urgent requests?",
    "Describe a product launch that failed. What did you learn and how did you adapt?",
    "What metrics would you track to evaluate the success of a new onboarding funnel?"
  ]
};

const MOCK_INTERVIEW_EVALUATION = {
  software: {
    score: 88,
    grade: 'A-',
    strengths: [
      "Excellent technical vocabulary and deep understanding of browser operations.",
      "Clear articulation of optimization concepts like rendering pipelines and CDN distribution."
    ],
    gaps: [
      "Could have elaborated on memory leak concerns with closures.",
      "Omitted security considerations like CORS or Content Security Policies."
    ],
    summary: "Strong candidacy. Demonstrates technical leadership ability and advanced core systems design awareness."
  },
  design: {
    score: 84,
    grade: 'B+',
    strengths: [
      "Empathetic research-oriented mindset.",
      "Excellent conflict resolution strategy regarding stakeholder feedback."
    ],
    gaps: [
      "Did not detail design-to-development handoff workflows.",
      "Lacked mention of accessibility standards (WCAG guidelines)."
    ],
    summary: "Highly creative candidate with solid behavioral maturity. Needs refinement in technical handoff guidelines."
  },
  product: {
    score: 91,
    grade: 'A',
    strengths: [
      "Highly quantitative approach to prioritization (using frameworks like RICE).",
      "Exceptional recovery story showing high accountability."
    ],
    gaps: [
      "Did not mention qualitative feedback loops (user interviews) in metrics analysis."
    ],
    summary: "Outstanding leadership profile. Shows excellent commercial acumen and execution ownership."
  }
};

export default function ServicesModal({ isOpen, onClose }) {
  const { currentUser, userData, updateProfileDocument } = useAuth();
  const [activeService, setActiveService] = useState('resume'); // 'resume' | 'interview' | 'optimizer' | 'support'
  
  // RESUME BUILDER STATE
  const [resumeTemplate, setResumeTemplate] = useState('classic');
  const [resumeData, setResumeData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    summary: '',
    skills: '',
    experience: [
      { role: 'Software Engineer', company: 'Innovation Labs', duration: '2023 - Present', desc: 'Designed modern responsive dashboards and led API integration teams.' }
    ],
    education: [
      { degree: 'B.S. Computer Science', school: 'Tech State University', year: '2022' }
    ]
  });

  // Sync current auth profile name & email if blank
  useEffect(() => {
    if (userData && isOpen) {
      setResumeData(prev => ({
        ...prev,
        name: prev.name || userData.displayName || '',
        email: prev.email || userData.email || '',
        phone: prev.phone || userData.phone || ''
      }));
    }
  }, [userData, isOpen]);

  const handleUpdateResumeField = (sec, field, val, idx = null) => {
    if (idx !== null) {
      setResumeData(prev => {
        const list = [...prev[sec]];
        list[idx] = { ...list[idx], [field]: val };
        return { ...prev, [sec]: list };
      });
    } else {
      setResumeData(prev => ({ ...prev, [field]: val }));
    }
  };

  const handleAddResumeItem = (sec) => {
    const defaultObj = sec === 'experience' 
      ? { role: '', company: '', duration: '', desc: '' }
      : { degree: '', school: '', year: '' };
    setResumeData(prev => ({ ...prev, [sec]: [...prev[sec], defaultObj] }));
  };

  const handleRemoveResumeItem = (sec, idx) => {
    setResumeData(prev => ({
      ...prev,
      [sec]: prev[sec].filter((_, i) => i !== idx)
    }));
  };

  const [savingResume, setSavingResume] = useState(false);
  const handleSaveResumeToProfile = async () => {
    setSavingResume(true);
    try {
      // Simulate build PDF representation or store structured data in user profile
      const resumeFormattedText = `
${resumeData.name} | ${resumeData.title}
Email: ${resumeData.email} | Phone: ${resumeData.phone}
Summary: ${resumeData.summary}
Skills: ${resumeData.skills}

EXPERIENCE:
${resumeData.experience.map(exp => `- ${exp.role} at ${exp.company} (${exp.duration}): ${exp.desc}`).join('\n')}

EDUCATION:
${resumeData.education.map(edu => `- ${edu.degree}, ${edu.school} (${edu.year})`).join('\n')}
      `;

      // Save structured resume to user profile in Firestore
      await updateProfileDocument({
        skills: resumeData.skills.split(',').map(s => s.trim()).filter(Boolean),
        headline: resumeData.title,
        bio: resumeData.summary,
        phone: resumeData.phone,
        // Save the raw details as a resume object
        savedResumeDetails: resumeData,
        // Also save formatted text resume so they can directly use it
        defaultResumeText: resumeFormattedText
      });
      
      alert("Success! Your profile and built resume have been synchronized. You can now use this information when applying.");
    } catch (err) {
      console.error(err);
      alert("Failed to sync resume to profile.");
    } finally {
      setSavingResume(false);
    }
  };

  const handlePrintResume = () => {
    window.print();
  };

  // INTERVIEW SIMULATOR STATE
  const [interviewRole, setInterviewRole] = useState('software');
  const [interviewStep, setInterviewStep] = useState(0); // 0 = intro, 1 = q1, 2 = q2, 3 = q3, 4 = grading
  const [interviewAnswers, setInterviewAnswers] = useState(['', '', '']);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [interviewReport, setInterviewReport] = useState(null);
  const [interviewSessionId, setInterviewSessionId] = useState(null);

  const startInterview = () => {
    setInterviewAnswers(['', '', '']);
    setCurrentAnswer('');
    setInterviewStep(1);
    setInterviewReport(null);
    setInterviewSessionId(Math.floor(1000 + Math.random() * 9000));
  };

  const submitAnswer = () => {
    if (!currentAnswer.trim()) return;
    const updated = [...interviewAnswers];
    updated[interviewStep - 1] = currentAnswer;
    setInterviewAnswers(updated);
    setCurrentAnswer('');

    if (interviewStep < 3) {
      setInterviewStep(prev => prev + 1);
    } else {
      // Analyze and show grading
      setInterviewStep(4);
      setInterviewReport(MOCK_INTERVIEW_EVALUATION[interviewRole]);
    }
  };

  // RESUME MATCH OPTIMIZER STATE
  const [optimizerResume, setOptimizerResume] = useState('');
  const [optimizerJD, setOptimizerJD] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState(null);

  const runOptimizer = () => {
    if (!optimizerResume.trim() || !optimizerJD.trim()) {
      alert("Please fill in both fields.");
      return;
    }
    setOptimizing(true);
    setOptimizeResult(null);

    setTimeout(() => {
      setOptimizing(false);
      // Calculate scores dynamically based on actual overlapping words
      
      // Keywords to check
      const keywordsToCheck = [
        'react', 'vue', 'angular', 'node', 'express', 'python', 'django', 'fastapi',
        'sql', 'nosql', 'postgres', 'mongodb', 'docker', 'kubernetes', 'aws', 'cloud',
        'typescript', 'javascript', 'html', 'css', 'tailwind', 'redux', 'graphql',
        'agile', 'scrum', 'jira', 'figma', 'analytics', 'testing', 'jest', 'git', 'ci/cd'
      ];
      
      const missing = [];
      const matching = [];
      let matchCount = 0;
      let checkCount = 0;

      keywordsToCheck.forEach(kw => {
        const inJD = optimizerJD.toLowerCase().includes(kw);
        const inResume = optimizerResume.toLowerCase().includes(kw);
        if (inJD) {
          checkCount++;
          if (inResume) {
            matchCount++;
            matching.push(kw.toUpperCase());
          } else {
            missing.push(kw.toUpperCase());
          }
        }
      });

      // Default score calculations
      const basePercentage = checkCount > 0 ? Math.round((matchCount / checkCount) * 100) : 55;
      const finalScore = Math.max(30, Math.min(95, basePercentage + Math.floor(Math.random() * 10)));
      
      setOptimizeResult({
        score: finalScore,
        matching: matching.slice(0, 8),
        missing: missing.length > 0 ? missing.slice(0, 5) : ['TYPESCRIPT', 'DOCKER', 'CI/CD'],
        suggestions: [
          "Incorporate missing core skills directly in your summary and experience bullet points.",
          "Describe achievements with numbers (e.g. 'Improved efficiency by 25%').",
          "Ensure resume headings match standard ATS scanning sections."
        ]
      });
    }, 1200);
  };

  // SUPPORT DESK STATE
  const [supportCategory, setSupportCategory] = useState('General');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [supportTickets, setSupportTickets] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your TalentHub Support Assistant. How can I help you today?', time: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [supportActiveSubTab, setSupportActiveSubTab] = useState('ticket'); // 'ticket' | 'chat' | 'history'

  const fetchTickets = async () => {
    if (!currentUser) return;
    try {
      const ticketsRef = collection(db, 'support_tickets');
      const q = query(ticketsRef, where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      // sort client-side by date
      list.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setSupportTickets(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen && activeService === 'support') {
      fetchTickets();
    }
  }, [isOpen, activeService]);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) return;
    setSubmittingTicket(true);
    try {
      await addDoc(collection(db, 'support_tickets'), {
        userId: currentUser.uid,
        userName: userData?.displayName || 'User',
        userEmail: currentUser.email,
        category: supportCategory,
        subject: supportSubject,
        message: supportMessage,
        status: 'Open',
        createdAt: new Date()
      });
      
      setSupportSubject('');
      setSupportMessage('');
      alert("Ticket submitted successfully! A support agent will review your ticket and reach out via email shortly.");
      fetchTickets();
      setSupportActiveSubTab('history');
    } catch (err) {
      console.error(err);
      alert("Failed to submit support ticket.");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { sender: 'user', text: chatInput, time: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    const queryText = chatInput.toLowerCase();
    setChatInput('');

    // Simulate chatbot replies
    setTimeout(() => {
      let reply = "I'm sorry, I didn't quite catch that. For complex account or billing issues, please submit a ticket in the 'Submit Ticket' tab.";
      if (queryText.includes('role') || queryText.includes('provider') || queryText.includes('seeker')) {
        reply = "To change your profile role, you can edit your profile from the user dropdown. Note that settings are partitioned by roles.";
      } else if (queryText.includes('gold') || queryText.includes('silver') || queryText.includes('plan') || queryText.includes('upgrade')) {
        reply = "You can upgrade to Silver or Gold tiers by clicking 'Upgrade Plan' in the Navbar or profile drawer to gain premium AI cover letters and additional listings.";
      } else if (queryText.includes('apply') || queryText.includes('resume') || queryText.includes('upload')) {
        reply = "When applying for a job, you can use the 'Upload Resume' file selector (< 1MB PDF/Word) or use our built-in Resume Builder tool to sync details.";
      } else if (queryText.includes('ai') || queryText.includes('draft')) {
        reply = "Our AI tools ('Draft with AI') help you write cover letters during application and compose job descriptions when posting roles. Look for the sparkles button!";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: reply, time: new Date() }]);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/45 backdrop-blur-sm animate-fade-in print:bg-white print:p-0">
      
      {/* Dynamic inline print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #root, .fixed, .modal-backdrop, header, aside, button, nav {
            display: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          #resume-print-target {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 20px !important;
            margin: 0 !important;
          }
        }
      `}} />

      {/* Main Modal Card */}
      <div className="relative w-full max-w-6xl bg-white border border-border-divider rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden h-[95vh] sm:h-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col justify-between animate-scale-up print:hidden">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-border-divider/50 flex items-center justify-between bg-panel-bg/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <Sparkles size={20} className="text-primary-avocado fill-primary-avocado/15 animate-pulse" />
            <h2 className="text-lg font-bold font-serif text-body-text">TalentHub Services & Career Tools</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-muted-text hover:text-body-text rounded-full hover:bg-page-bg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Outer Split Pane Layout: Sidebar + Main Content */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* Left Navigation Sidebar */}
          <aside className="w-56 border-r border-border-divider/50 bg-panel-bg/25 py-4 flex flex-col gap-1 overflow-y-auto shrink-0 hidden md:flex">
            <button
              onClick={() => setActiveService('resume')}
              className={`mx-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2.5 ${
                activeService === 'resume'
                  ? 'bg-primary-avocado text-white shadow-sm'
                  : 'text-muted-text hover:text-body-text hover:bg-page-bg'
              }`}
            >
              <FileText size={16} />
              Resume Builder
            </button>
            <button
              onClick={() => setActiveService('interview')}
              className={`mx-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2.5 ${
                activeService === 'interview'
                  ? 'bg-primary-avocado text-white shadow-sm'
                  : 'text-muted-text hover:text-body-text hover:bg-page-bg'
              }`}
            >
              <Brain size={16} />
              AI Mock Interview
            </button>
            <button
              onClick={() => setActiveService('optimizer')}
              className={`mx-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2.5 ${
                activeService === 'optimizer'
                  ? 'bg-primary-avocado text-white shadow-sm'
                  : 'text-muted-text hover:text-body-text hover:bg-page-bg'
              }`}
            >
              <TrendingUp size={16} />
              AI Resume Scorer
            </button>
            <button
              onClick={() => setActiveService('support')}
              className={`mx-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2.5 ${
                activeService === 'support'
                  ? 'bg-primary-avocado text-white shadow-sm'
                  : 'text-muted-text hover:text-body-text hover:bg-page-bg'
              }`}
            >
              <MessageSquare size={16} />
              Help & Support Desk
            </button>
          </aside>

          {/* Main Service Panel Content */}
          <main className="flex-1 flex flex-col overflow-hidden bg-white">
            
            {/* Mobile Horizontal Navigation Header */}
            <div className="flex md:hidden border-b border-border-divider/40 p-2.5 gap-1.5 overflow-x-auto scrollbar-none shrink-0 bg-panel-bg/10">
              <button
                onClick={() => setActiveService('resume')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                  activeService === 'resume' ? 'bg-primary-avocado text-white' : 'text-muted-text bg-white border border-border-divider/60'
                }`}
              >
                Resume Builder
              </button>
              <button
                onClick={() => setActiveService('interview')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                  activeService === 'interview' ? 'bg-primary-avocado text-white' : 'text-muted-text bg-white border border-border-divider/60'
                }`}
              >
                Mock Interview
              </button>
              <button
                onClick={() => setActiveService('optimizer')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                  activeService === 'optimizer' ? 'bg-primary-avocado text-white' : 'text-muted-text bg-white border border-border-divider/60'
                }`}
              >
                Resume Scorer
              </button>
              <button
                onClick={() => setActiveService('support')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                  activeService === 'support' ? 'bg-primary-avocado text-white' : 'text-muted-text bg-white border border-border-divider/60'
                }`}
              >
                Support Desk
              </button>
            </div>

            {/* Service View Selector */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 min-h-0">
              
              {/* TAB 1: RESUME BUILDER */}
              {activeService === 'resume' && (
                <div className="flex flex-col lg:flex-row gap-6 h-full items-stretch">
                  
                  {/* Left Column: Input Panel */}
                  <div className="w-full lg:w-1/2 space-y-6 lg:overflow-y-auto lg:pr-2 scrollbar-thin">
                    <div className="space-y-1 text-left">
                      <h3 className="text-sm font-bold text-body-text">Resume Details</h3>
                      <p className="text-[11px] text-muted-text">Fill in your information to compile a formatted modern resume.</p>
                    </div>

                    {/* Template Selection */}
                    <div className="space-y-2.5 text-left bg-panel-bg/15 p-4 rounded-2xl border border-border-divider/40">
                      <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider">Select Style Template</span>
                      <div className="grid grid-cols-3 gap-2">
                        {RESUME_TEMPLATES.map(t => (
                          <button
                            key={t.id}
                            onClick={() => setResumeTemplate(t.id)}
                            className={`p-2.5 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${
                              resumeTemplate === t.id
                                ? 'border-primary-avocado bg-white ring-1 ring-primary-avocado/30'
                                : 'border-border-divider bg-white/50 hover:border-border-divider-hover'
                            }`}
                          >
                            <span className="text-[11px] font-bold text-body-text">{t.label}</span>
                            <span className="text-[9px] text-muted-text mt-0.5 leading-tight line-clamp-2">{t.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Personal Info fields */}
                    <div className="space-y-3.5 text-left">
                      <h4 className="text-[11px] font-bold text-body-text uppercase tracking-wide border-b border-border-divider/30 pb-1">Personal Details</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-text">Full Name</label>
                          <input 
                            type="text" 
                            value={resumeData.name} 
                            onChange={(e) => handleUpdateResumeField(null, 'name', e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-border-divider focus:border-primary-avocado outline-none rounded-lg bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-text">Professional Headline</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Frontend developer | React | UI/UX"
                            value={resumeData.title} 
                            onChange={(e) => handleUpdateResumeField(null, 'title', e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-border-divider focus:border-primary-avocado outline-none rounded-lg bg-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-text">Email Address</label>
                          <input 
                            type="email" 
                            value={resumeData.email} 
                            onChange={(e) => handleUpdateResumeField(null, 'email', e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-border-divider focus:border-primary-avocado outline-none rounded-lg bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-text">Phone Number</label>
                          <input 
                            type="text" 
                            value={resumeData.phone} 
                            onChange={(e) => handleUpdateResumeField(null, 'phone', e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-border-divider focus:border-primary-avocado outline-none rounded-lg bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-text">Professional Summary</label>
                        <textarea 
                          rows={3}
                          value={resumeData.summary} 
                          onChange={(e) => handleUpdateResumeField(null, 'summary', e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-border-divider focus:border-primary-avocado outline-none rounded-lg bg-white resize-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-text">Technical Skills (Comma separated)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. React, Node.js, TypeScript, SQL, Figma"
                          value={resumeData.skills} 
                          onChange={(e) => handleUpdateResumeField(null, 'skills', e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-border-divider focus:border-primary-avocado outline-none rounded-lg bg-white"
                        />
                      </div>
                    </div>

                    {/* Experience List fields */}
                    <div className="space-y-3.5 text-left">
                      <div className="flex items-center justify-between border-b border-border-divider/30 pb-1">
                        <h4 className="text-[11px] font-bold text-body-text uppercase tracking-wide">Work History</h4>
                        <button
                          onClick={() => handleAddResumeItem('experience')}
                          className="text-[10px] font-bold text-primary-avocado hover:text-primary-hover flex items-center gap-0.5 bg-transparent"
                        >
                          <Plus size={12} /> Add Experience
                        </button>
                      </div>
                      {resumeData.experience.map((exp, idx) => (
                        <div key={idx} className="p-3 bg-panel-bg/10 rounded-xl border border-border-divider/30 space-y-2 relative">
                          <button
                            onClick={() => handleRemoveResumeItem('experience', idx)}
                            className="absolute top-2 right-2 text-danger-reject hover:bg-red-50 p-1 rounded-lg"
                            title="Remove item"
                          >
                            <Trash2 size={12} />
                          </button>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-muted-text">Job Role / Title</label>
                              <input 
                                type="text" 
                                value={exp.role} 
                                onChange={(e) => handleUpdateResumeField('experience', 'role', e.target.value, idx)}
                                className="w-full text-[11px] px-2.5 py-1.5 border border-border-divider focus:border-primary-avocado outline-none rounded-lg bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-muted-text">Company Name</label>
                              <input 
                                type="text" 
                                value={exp.company} 
                                onChange={(e) => handleUpdateResumeField('experience', 'company', e.target.value, idx)}
                                className="w-full text-[11px] px-2.5 py-1.5 border border-border-divider focus:border-primary-avocado outline-none rounded-lg bg-white"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-1 space-y-1">
                              <label className="text-[9px] font-bold text-muted-text">Duration (e.g. 2021-2023)</label>
                              <input 
                                type="text" 
                                value={exp.duration} 
                                onChange={(e) => handleUpdateResumeField('experience', 'duration', e.target.value, idx)}
                                className="w-full text-[11px] px-2.5 py-1.5 border border-border-divider focus:border-primary-avocado outline-none rounded-lg bg-white"
                              />
                            </div>
                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[9px] font-bold text-muted-text">Key Contributions</label>
                              <input 
                                type="text" 
                                value={exp.desc} 
                                onChange={(e) => handleUpdateResumeField('experience', 'desc', e.target.value, idx)}
                                className="w-full text-[11px] px-2.5 py-1.5 border border-border-divider focus:border-primary-avocado outline-none rounded-lg bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Education List fields */}
                    <div className="space-y-3.5 text-left">
                      <div className="flex items-center justify-between border-b border-border-divider/30 pb-1">
                        <h4 className="text-[11px] font-bold text-body-text uppercase tracking-wide">Education</h4>
                        <button
                          onClick={() => handleAddResumeItem('education')}
                          className="text-[10px] font-bold text-primary-avocado hover:text-primary-hover flex items-center gap-0.5 bg-transparent"
                        >
                          <Plus size={12} /> Add Education
                        </button>
                      </div>
                      {resumeData.education.map((edu, idx) => (
                        <div key={idx} className="p-3 bg-panel-bg/10 rounded-xl border border-border-divider/30 space-y-2 relative">
                          <button
                            onClick={() => handleRemoveResumeItem('education', idx)}
                            className="absolute top-2 right-2 text-danger-reject hover:bg-red-50 p-1 rounded-lg"
                            title="Remove item"
                          >
                            <Trash2 size={12} />
                          </button>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-muted-text">Degree</label>
                              <input 
                                type="text" 
                                value={edu.degree} 
                                onChange={(e) => handleUpdateResumeField('education', 'degree', e.target.value, idx)}
                                className="w-full text-[11px] px-2.5 py-1.5 border border-border-divider focus:border-primary-avocado outline-none rounded-lg bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-muted-text">School</label>
                              <input 
                                type="text" 
                                value={edu.school} 
                                onChange={(e) => handleUpdateResumeField('education', 'school', e.target.value, idx)}
                                className="w-full text-[11px] px-2.5 py-1.5 border border-border-divider focus:border-primary-avocado outline-none rounded-lg bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-muted-text">Year</label>
                              <input 
                                type="text" 
                                value={edu.year} 
                                onChange={(e) => handleUpdateResumeField('education', 'year', e.target.value, idx)}
                                className="w-full text-[11px] px-2.5 py-1.5 border border-border-divider focus:border-primary-avocado outline-none rounded-lg bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Live Premium Preview */}
                  <div className="w-full lg:w-1/2 flex flex-col overflow-hidden bg-panel-bg/25 border border-border-divider/60 rounded-2xl p-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border-divider/40 shrink-0">
                      <span className="text-xs font-bold text-body-text">Resume Preview</span>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveResumeToProfile}
                          disabled={savingResume}
                          className="px-3 py-1.5 bg-primary-avocado hover:bg-primary-hover text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs hover:shadow-xs cursor-pointer"
                        >
                          <Check size={12} /> {savingResume ? 'Syncing...' : 'Sync to Profile'}
                        </button>
                        <button
                          onClick={handlePrintResume}
                          className="px-3 py-1.5 border border-border-divider hover:bg-white text-body-text text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-3xs cursor-pointer"
                        >
                          <Printer size={12} /> Export/Print
                        </button>
                      </div>
                    </div>

                    {/* Printable Target Resume Sheet */}
                    <div className="flex-1 lg:overflow-y-auto py-6 flex justify-center bg-zinc-100/40 rounded-xl mt-3">
                      <div 
                        id="resume-print-target"
                        className={`w-full max-w-[550px] aspect-[1/1.41] bg-white border border-zinc-200/80 shadow-md p-7 text-left font-sans flex flex-col justify-between overflow-y-auto leading-normal ${
                          resumeTemplate === 'avocado' ? 'border-t-8 border-t-primary-avocado' : 
                          resumeTemplate === 'executive' ? 'border-l-8 border-l-stone-700' : ''
                        }`}
                      >
                        <div>
                          {/* Name / Title */}
                          <div className="space-y-1 pb-4.5 border-b border-zinc-200">
                            <h1 className={`text-xl font-extrabold tracking-tight ${
                              resumeTemplate === 'avocado' ? 'text-primary-hover' : 'text-zinc-800'
                            }`}>
                              {resumeData.name || 'Your Name'}
                            </h1>
                            <p className={`text-xs font-bold ${
                              resumeTemplate === 'avocado' ? 'text-primary-avocado' : 'text-zinc-600'
                            }`}>
                              {resumeData.title || 'Professional Title'}
                            </p>
                            
                            {/* Contact items */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-500 font-semibold pt-1">
                              {resumeData.email && <span className="flex items-center gap-0.5"><Mail size={10} /> {resumeData.email}</span>}
                              {resumeData.phone && <span className="flex items-center gap-0.5"><Phone size={10} /> {resumeData.phone}</span>}
                            </div>
                          </div>

                          {/* Split/Double Column for Executive, or simple blocks for others */}
                          <div className="pt-4.5 space-y-4.5">
                            
                            {/* Summary */}
                            {resumeData.summary && (
                              <div className="space-y-1">
                                <h3 className={`text-[10px] font-bold uppercase tracking-wider ${
                                  resumeTemplate === 'avocado' ? 'text-primary-hover' : 'text-zinc-800'
                                }`}>
                                  Professional Summary
                                </h3>
                                <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">
                                  {resumeData.summary}
                                </p>
                              </div>
                            )}

                            {/* Skills */}
                            {resumeData.skills && (
                              <div className="space-y-1.5">
                                <h3 className={`text-[10px] font-bold uppercase tracking-wider ${
                                  resumeTemplate === 'avocado' ? 'text-primary-hover' : 'text-zinc-800'
                                }`}>
                                  Core Skills
                                </h3>
                                <div className="flex flex-wrap gap-1">
                                  {resumeData.skills.split(',').map((skill, idx) => (
                                    <span key={idx} className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                      resumeTemplate === 'avocado' 
                                        ? 'bg-primary-avocado/10 text-primary-hover' 
                                        : 'bg-zinc-100 text-zinc-700'
                                    }`}>
                                      {skill.trim()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Experience */}
                            <div className="space-y-2">
                              <h3 className={`text-[10px] font-bold uppercase tracking-wider ${
                                resumeTemplate === 'avocado' ? 'text-primary-hover' : 'text-zinc-800'
                              }`}>
                                Professional Experience
                              </h3>
                              <div className="space-y-3">
                                {resumeData.experience.map((exp, idx) => (
                                  <div key={idx} className="space-y-0.5">
                                    <div className="flex justify-between items-baseline">
                                      <span className="text-[10px] font-bold text-zinc-800">{exp.role || 'Role'}</span>
                                      <span className="text-[9px] text-zinc-500 font-semibold">{exp.duration}</span>
                                    </div>
                                    <div className="text-[9px] font-bold text-zinc-600">{exp.company || 'Company'}</div>
                                    <p className="text-[9px] text-zinc-500 leading-relaxed font-medium">{exp.desc}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Education */}
                            <div className="space-y-2">
                              <h3 className={`text-[10px] font-bold uppercase tracking-wider ${
                                resumeTemplate === 'avocado' ? 'text-primary-hover' : 'text-zinc-800'
                              }`}>
                                Education
                              </h3>
                              <div className="space-y-2">
                                {resumeData.education.map((edu, idx) => (
                                  <div key={idx} className="flex justify-between items-start">
                                    <div className="text-[9px]">
                                      <span className="font-bold text-zinc-800">{edu.degree || 'Degree'}</span>
                                      <span className="text-zinc-400 mx-1">•</span>
                                      <span className="text-zinc-600 font-semibold">{edu.school || 'School'}</span>
                                    </div>
                                    <span className="text-[9px] text-zinc-500 font-semibold">{edu.year}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* Printable stamp */}
                        <div className="text-[8px] text-center text-zinc-400 mt-6 pt-2 border-t border-zinc-100 flex items-center justify-between shrink-0 font-medium font-sans">
                          <span>Created via TalentHub Career Center</span>
                          <span>{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: AI MOCK INTERVIEW */}
              {activeService === 'interview' && (
                <div className="max-w-2xl mx-auto space-y-6 text-left">
                  
                  {/* Banner */}
                  <div className="flex items-start gap-4 p-4.5 bg-badge-dept-bg text-badge-dept-text border border-primary-avocado/20 rounded-2xl">
                    <Award size={24} className="text-primary-hover shrink-0 animate-bounce-short" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold">AI Interactive Mock Interview Prep</h4>
                      <p className="text-[11px] opacity-90 leading-relaxed font-medium">
                        Simulate an interview environment. Answer core technical/behavioral questions and receive automated evaluation feedback.
                      </p>
                    </div>
                  </div>

                  {/* STEP 0: SET UP INTERVIEW */}
                  {interviewStep === 0 && (
                    <div className="bg-white border border-border-divider/60 rounded-2xl p-6 space-y-5 shadow-2xs">
                      <h3 className="text-sm font-bold text-body-text">Configure Mock Session</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-text uppercase">Target Job Field</label>
                          <select
                            value={interviewRole}
                            onChange={(e) => setInterviewRole(e.target.value)}
                            className="w-full text-xs px-3.5 py-2.5 border border-border-divider focus:border-primary-avocado outline-none rounded-xl bg-white font-medium"
                          >
                            <option value="software">Software Engineering / Development</option>
                            <option value="design">Product / UI UX Design</option>
                            <option value="product">Product Management (PM)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-text uppercase">Experience Level</label>
                          <select
                            className="w-full text-xs px-3.5 py-2.5 border border-border-divider focus:border-primary-avocado outline-none rounded-xl bg-white font-medium"
                          >
                            <option value="jr">Junior / Associate (0 - 2 years)</option>
                            <option value="mid">Mid-Level Professional (2 - 5 years)</option>
                            <option value="sr">Senior Lead / Manager (5+ years)</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2 text-right">
                        <button
                          onClick={startInterview}
                          className="px-6 py-3 bg-primary-avocado hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          Start Mock Interview <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEPS 1-3: LIVE QUESTION CHAT */}
                  {interviewStep >= 1 && interviewStep <= 3 && (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col h-[380px] text-zinc-100 font-mono shadow-2xl relative overflow-hidden">
                      {/* Terminal header */}
                      <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          <span className="ml-2 font-bold font-sans">AI_INTERVIEW_TERMINAL_V1</span>
                        </div>
                        <span className="font-sans font-bold">Question {interviewStep} of 3</span>
                      </div>

                      {/* Terminal screen logger */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin">
                        <div className="text-zinc-500">&gt; Connection established with TalentHub interviewer bot.</div>
                        <div className="text-zinc-500">&gt; Starting evaluation protocol for role: {interviewRole.toUpperCase()}</div>
                        
                        {/* Render past questions & answers */}
                        {Array.from({ length: interviewStep }).map((_, idx) => {
                          const qNum = idx + 1;
                          const question = MOCK_INTERVIEW_QUESTIONS[interviewRole][idx];
                          const answer = interviewAnswers[idx];
                          const isActive = qNum === interviewStep;
                          
                          return (
                            <div key={idx} className="space-y-2.5">
                              <div className="text-primary-avocado flex gap-1 items-start">
                                <span className="text-primary-avocado font-extrabold shrink-0">[AI]:</span>
                                <span>{question}</span>
                              </div>
                              
                              {!isActive && (
                                <div className="text-zinc-300 pl-4 flex gap-1 items-start border-l border-zinc-800">
                                  <span className="text-zinc-500 font-extrabold shrink-0">[YOU]:</span>
                                  <span>{answer}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Input panel */}
                      <div className="p-3 bg-zinc-900 border-t border-zinc-850 flex gap-2 items-center">
                        <span className="text-zinc-500 font-bold font-mono text-xs pl-2">&gt;</span>
                        <input
                          type="text"
                          placeholder="Type your answer here..."
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                          className="flex-1 bg-transparent text-xs text-zinc-100 outline-none border-none ring-0 placeholder-zinc-600 font-mono"
                        />
                        <button
                          onClick={submitAnswer}
                          disabled={!currentAnswer.trim()}
                          className="px-4 py-2 bg-primary-avocado hover:bg-primary-hover disabled:opacity-30 text-white font-sans text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          Submit <Send size={11} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: INTERVIEW EVALUATION REPORT */}
                  {interviewStep === 4 && interviewReport && (
                    <div className="bg-white border border-border-divider/70 rounded-2xl p-6 space-y-6 shadow-md animate-scale-up">
                      <div className="flex items-center justify-between border-b border-border-divider/30 pb-3">
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-bold text-body-text">Mock Evaluation Report</h3>
                          <p className="text-[10px] text-muted-text font-medium">Session code: #INT-{interviewSessionId || 1000}</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {/* Score Badge */}
                          <div className="text-right">
                            <span className="block text-xl font-black text-primary-hover leading-none">{interviewReport.score}%</span>
                            <span className="text-[9px] text-muted-text font-bold uppercase tracking-wider">Overall Score</span>
                          </div>
                          {/* Grade Badge */}
                          <div className="w-12 h-12 rounded-xl bg-badge-dept-bg text-badge-dept-text flex items-center justify-center font-black text-lg border border-primary-avocado/20 shadow-2xs">
                            {interviewReport.grade}
                          </div>
                        </div>
                      </div>

                      {/* Summary text */}
                      <div className="bg-panel-bg/20 border border-border-divider/30 p-4 rounded-xl text-xs text-body-text font-medium leading-relaxed">
                        <strong className="text-primary-hover">AI Feedback: </strong>
                        {interviewReport.summary}
                      </div>

                      {/* Strengths & Gaps lists */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle size={12} className="text-green-600" /> Key Strengths
                          </span>
                          <ul className="list-disc pl-4 text-[10px] text-muted-text font-semibold space-y-1">
                            {interviewReport.strengths.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                            <ShieldAlert size={12} className="text-amber-600" /> Improvement Gaps
                          </span>
                          <ul className="list-disc pl-4 text-[10px] text-muted-text font-semibold space-y-1">
                            {interviewReport.gaps.map((g, i) => <li key={i}>{g}</li>)}
                          </ul>
                        </div>
                      </div>

                      {/* Reset button */}
                      <div className="pt-2 text-right border-t border-border-divider/20 flex justify-between items-center">
                        <span className="text-[10px] text-muted-text font-semibold">Tip: Review missing items and try again!</span>
                        <button
                          onClick={() => setInterviewStep(0)}
                          className="px-5 py-2 border border-border-divider hover:bg-page-bg text-body-text text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          New Session
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: RESUME MATCH OPTIMIZER */}
              {activeService === 'optimizer' && (
                <div className="max-w-2xl mx-auto space-y-6 text-left">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-body-text">AI Profile Optimizer</h3>
                    <p className="text-[11px] text-muted-text">
                      Compare your resume copy against any target job posting to scan for applicant screening compatibility.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Resume Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-text uppercase">Paste Resume Text</label>
                      <textarea
                        rows={8}
                        placeholder="Paste your skills, experience details, and profile summaries here..."
                        value={optimizerResume}
                        onChange={(e) => setOptimizerResume(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 border border-border-divider focus:border-primary-avocado outline-none rounded-xl bg-white font-medium resize-none"
                      />
                      <button
                        onClick={() => {
                          const resumeFormattedText = `
${resumeData.name} | ${resumeData.title}
Skills: ${resumeData.skills}
Summary: ${resumeData.summary}
                          `;
                          setOptimizerResume(resumeFormattedText);
                        }}
                        className="text-[9px] font-bold text-primary-avocado hover:underline bg-transparent"
                      >
                        Auto-populate from Resume Builder above
                      </button>
                    </div>

                    {/* Job Description Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-text uppercase">Paste Job Description</label>
                      <textarea
                        rows={8}
                        placeholder="Paste the target job requirements and duties description here..."
                        value={optimizerJD}
                        onChange={(e) => setOptimizerJD(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 border border-border-divider focus:border-primary-avocado outline-none rounded-xl bg-white font-medium resize-none"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="text-right">
                    <button
                      onClick={runOptimizer}
                      disabled={optimizing}
                      className="px-6 py-2.5 bg-primary-avocado hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      {optimizing ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" /> Analyzing Match...
                        </>
                      ) : (
                        <>
                          Analyze Match Score <TrendingUp size={13} />
                        </>
                      )}
                    </button>
                  </div>

                  {/* RESULTS SHOW */}
                  {optimizeResult && (
                    <div className="bg-white border border-border-divider rounded-2xl p-5 shadow-sm space-y-5 animate-scale-up">
                      <div className="flex items-center justify-between border-b border-border-divider/30 pb-3">
                        <span className="text-xs font-bold text-body-text">Analysis Report</span>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="block text-xl font-black text-amber-600 leading-none">{optimizeResult.score}%</span>
                            <span className="text-[9px] text-muted-text font-bold uppercase tracking-wider">ATS Score Match</span>
                          </div>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${
                            optimizeResult.score >= 80 ? 'bg-green-50 text-green-700 border-green-200' :
                            optimizeResult.score >= 65 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {optimizeResult.score >= 80 ? 'GOOD' : optimizeResult.score >= 65 ? 'MID' : 'LOW'}
                          </div>
                        </div>
                      </div>

                      {/* Keyword tags matches */}
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-muted-text uppercase">Identified Keyword Matches</span>
                          <div className="flex flex-wrap gap-1">
                            {optimizeResult.matching.map((kw, i) => (
                              <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded bg-green-50 border border-green-200 text-green-700">
                                ✓ {kw}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Missing keywords */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-muted-text uppercase">Missing Critical Keywords (Recommended additions)</span>
                          <div className="flex flex-wrap gap-1">
                            {optimizeResult.missing.map((kw, i) => (
                              <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700">
                                + {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions suggestions list */}
                      <div className="space-y-2 bg-panel-bg/25 p-4 rounded-xl border border-border-divider/40">
                        <span className="text-[9px] font-bold text-body-text uppercase tracking-wider">Next Optimization Steps</span>
                        <ul className="list-decimal pl-4 text-[10px] text-muted-text font-semibold space-y-1.5">
                          {optimizeResult.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 4: HELP & SUPPORT DESK */}
              {activeService === 'support' && (
                <div className="max-w-2xl mx-auto space-y-6 text-left">
                  
                  {/* Support category tabs navigation */}
                  <div className="flex border-b border-border-divider/50 pb-2 gap-4">
                    <button
                      onClick={() => setSupportActiveSubTab('ticket')}
                      className={`text-xs font-bold pb-2 border-b-2 transition-all cursor-pointer ${
                        supportActiveSubTab === 'ticket' 
                          ? 'border-primary-avocado text-primary-hover' 
                          : 'border-transparent text-muted-text hover:text-body-text'
                      }`}
                    >
                      Submit Ticket
                    </button>
                    <button
                      onClick={() => setSupportActiveSubTab('chat')}
                      className={`text-xs font-bold pb-2 border-b-2 transition-all cursor-pointer ${
                        supportActiveSubTab === 'chat' 
                          ? 'border-primary-avocado text-primary-hover' 
                          : 'border-transparent text-muted-text hover:text-body-text'
                      }`}
                    >
                      Live Helper Chat
                    </button>
                    <button
                      onClick={() => {
                        setSupportActiveSubTab('history');
                        fetchTickets();
                      }}
                      className={`text-xs font-bold pb-2 border-b-2 transition-all cursor-pointer ${
                        supportActiveSubTab === 'history' 
                          ? 'border-primary-avocado text-primary-hover' 
                          : 'border-transparent text-muted-text hover:text-body-text'
                      }`}
                    >
                      Ticket History ({supportTickets.length})
                    </button>
                  </div>

                  {/* SUBTAB 1: TICKET FORM */}
                  {supportActiveSubTab === 'ticket' && (
                    <form onSubmit={handleSubmitTicket} className="space-y-4 bg-white border border-border-divider/60 rounded-2xl p-6 shadow-2xs">
                      <h3 className="text-sm font-bold text-body-text">Open Support Ticket</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1 space-y-1">
                          <label className="text-[10px] font-bold text-muted-text">Category</label>
                          <select
                            value={supportCategory}
                            onChange={(e) => setSupportCategory(e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-border-divider focus:border-primary-avocado outline-none rounded-lg bg-white font-medium"
                          >
                            <option value="General">General Inquiry</option>
                            <option value="Technical">Technical Bug</option>
                            <option value="Billing">Billing / Plans</option>
                            <option value="Profile">Profile Settings</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-muted-text">Subject Headline</label>
                          <input
                            type="text"
                            placeholder="e.g. Cannot edit profile details"
                            value={supportSubject}
                            onChange={(e) => setSupportSubject(e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-border-divider focus:border-primary-avocado outline-none rounded-lg bg-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-text">Explain Details</label>
                        <textarea
                          rows={4}
                          placeholder="Provide all relevant details to resolve your query faster..."
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-border-divider focus:border-primary-avocado outline-none rounded-lg bg-white resize-none"
                          required
                        />
                      </div>

                      <div className="text-right pt-1">
                        <button
                          type="submit"
                          disabled={submittingTicket}
                          className="px-6 py-2.5 bg-primary-avocado hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          {submittingTicket ? 'Submitting...' : 'Submit Support Ticket'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* SUBTAB 2: HELPER CHAT */}
                  {supportActiveSubTab === 'chat' && (
                    <div className="border border-border-divider rounded-2xl flex flex-col h-[380px] bg-page-bg overflow-hidden shadow-2xs">
                      
                      {/* Chat Messages */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 min-h-0 scrollbar-thin">
                        {chatMessages.map((msg, idx) => {
                          const isBot = msg.sender === 'bot';
                          return (
                            <div 
                              key={idx} 
                              className={`flex flex-col max-w-[80%] ${
                                isBot ? 'self-start text-left' : 'self-end text-right ml-auto'
                              }`}
                            >
                              <div className={`px-4 py-2.5 rounded-2xl text-[11px] font-medium leading-relaxed ${
                                isBot 
                                  ? 'bg-white border border-border-divider/50 text-body-text' 
                                  : 'bg-primary-avocado text-white'
                              }`}>
                                {msg.text}
                              </div>
                              <span className="text-[8px] text-muted-text mt-1 px-1 font-semibold">
                                {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Chat Input */}
                      <div className="p-3 bg-white border-t border-border-divider/60 flex gap-2 shrink-0">
                        <input
                          type="text"
                          placeholder="Ask chatbot a question (e.g. 'how to upgrade', 'sync resume')..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                          className="flex-1 text-xs px-3.5 py-2 border border-border-divider focus:border-primary-avocado outline-none rounded-xl bg-page-bg/30"
                        />
                        <button
                          onClick={handleSendChatMessage}
                          className="px-4 py-2 bg-primary-avocado hover:bg-primary-hover text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 3: TICKET HISTORY */}
                  {supportActiveSubTab === 'history' && (
                    <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
                      {supportTickets.length === 0 ? (
                        <div className="py-12 bg-white rounded-2xl border border-border-divider/60 text-center text-xs text-muted-text">
                          You have not submitted any support tickets yet.
                        </div>
                      ) : (
                        supportTickets.map((ticket) => (
                          <div key={ticket.id} className="bg-white border border-border-divider/60 p-4 rounded-xl space-y-2.5 shadow-3xs flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  ticket.status === 'Open' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-green-100 text-green-800 border border-green-200'
                                }`}>
                                  {ticket.status}
                                </span>
                                <span className="text-[10px] text-muted-text font-bold uppercase">
                                  {ticket.category}
                                </span>
                              </div>
                              <span className="text-[9px] text-muted-text font-semibold">
                                {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleDateString() : new Date(ticket.createdAt || 0).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="text-left space-y-1">
                              <h4 className="text-xs font-bold text-body-text">{ticket.subject}</h4>
                              <p className="text-[10px] text-muted-text font-medium leading-relaxed line-clamp-2">{ticket.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4.5 border-t border-border-divider/30 bg-panel-bg/25 flex justify-end shrink-0">
              <button
                onClick={onClose}
                className="px-5 py-2 border border-border-divider hover:bg-white text-xs font-semibold rounded-xl text-body-text transition-colors cursor-pointer"
              >
                Close Services
              </button>
            </div>

          </main>
        </div>

      </div>
    </div>
  );
}
