import React, { useState } from 'react';
import { X, Search, Calendar, Clock, BookOpen, User } from 'lucide-react';

const BLOG_DATA = [
  {
    id: "blog1",
    title: "How to Ace Your Tech Interview in 2026",
    excerpt: "Learn core data structure tips, behavioral preparation strategies, and live coding exercises from industry engineering leaders.",
    category: "Career Advice",
    readTime: "6 min read",
    author: "Elena Rostova",
    authorTitle: "Tech Lead @ TalentHub",
    date: "Jun 5, 2026",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: [
      { type: "p", text: "Navigating technical interviews in today's market requires more than just knowing how to write code. It demands a holistic approach combining technical execution, system design maturity, and polished communication." },
      { type: "h3", text: "1. Focus on Coding Patterns, Not Memorization" },
      { type: "p", text: "Instead of memorizing specific solutions, focus on patterns. Patterns like Sliding Window, Two Pointers, and Breadth-First Search apply across hundreds of different problems. When presented with a question:" },
      { type: "list", items: [
        "Talk through your thought process before writing a single line of code.",
        "Discuss space and time complexities (Big O notation) upfront.",
        "Proactively write test cases and dry-run your code with edge cases."
      ]},
      { type: "h3", text: "2. Practice System Design Foundations" },
      { type: "p", text: "For mid-to-senior engineering roles, system design is key. Ensure you can discuss scaling database operations, selecting database paradigms (SQL vs. NoSQL), load balancers, caching layers (Redis/Memcached), and content delivery networks (CDNs) confidently." },
      { type: "h3", text: "3. Use the STAR Method for Behavioral Questions" },
      { type: "p", text: "Structure your behavioral answers using the STAR format: Situation, Task, Action, and Result. Make sure to clearly state what YOU accomplished and back it up with numbers (e.g., 'improved server response times by 35%')." }
    ]
  },
  {
    id: "blog2",
    title: "Writing a Winning Resume for Software Roles",
    excerpt: "Step-by-step instructions on structuring your headline, summarizing projects, and using keywords to beat recruitment screeners.",
    category: "Resume Tips",
    readTime: "4 min read",
    author: "Mark Harrison",
    authorTitle: "Head of Talent @ TalentHub",
    date: "Jun 4, 2026",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: [
      { type: "p", text: "Your resume is your ticket to the first interview. In software engineering, recruiters spend less than 10 seconds reviewing a resume before making a decision. Here is how to structure yours for maximum impact." },
      { type: "h3", text: "1. The Headline & Summary" },
      { type: "p", text: "Keep it short. State your role title and core stack (e.g., 'Full Stack Engineer | React, Node.js, AWS'). Follow it with a brief two-sentence summary detailing your years of experience and your specialty." },
      { type: "h3", text: "2. Quantify Your Experience (The X-Y-Z Formula)" },
      { type: "p", text: "Do not just list your daily tasks. Use Google's X-Y-Z formula: 'Accomplished [X] as measured by [Y], by doing [Z]'. For example: 'Redesigned the data-loading engine [Z] to reduce latency by 45% [Y], leading to 10% higher user retention [X].'" },
      { type: "h3", text: "3. Optimize for ATS Filters" },
      { type: "p", text: "Many large firms use Applicant Tracking Systems (ATS) to filter resumes. Ensure your resume contains exact keyword matches for technologies listed in the job description. Avoid double-column layouts and tables, as ATS scanners often miss them." }
    ]
  },
  {
    id: "blog3",
    title: "Employer Guide: How to Find & Attract Top Talent",
    excerpt: "For providers: tips on drafting descriptions, structuring agile interviews, and establishing attractive workspace cultures.",
    category: "For Employers",
    readTime: "8 min read",
    author: "Sarah Jenkins",
    authorTitle: "HR Director @ TalentHub",
    date: "Jun 2, 2026",
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: [
      { type: "p", text: "The competition for premium technical talent is fierce. To attract high-performing engineers, designer, and managers, companies must refine their hiring process and work culture." },
      { type: "h3", text: "1. Write Compelling Job Descriptions" },
      { type: "p", text: "Generic job postings get ignored. Write descriptions that describe the actual projects the candidate will work on. Explain the stack, the mission, and provide a realistic salary range upfront to build trust." },
      { type: "h3", text: "2. Optimize and Speed Up Your Interview Loop" },
      { type: "p", text: "Top candidates receive multiple offers quickly. Avoid having 6-7 rounds of interviews. Streamline your loop into 3 stages: a quick screening, a technical assessment (ideally a practical pair-programming session rather than abstract puzzles), and a culture-fit round." },
      { type: "h3", text: "3. Leverage AI Assistant Tools" },
      { type: "p", text: "Utilize tools like our built-in AI Job Description Assistant to write structured, engaging role outlines. This saves time and ensures your requirements align with current industry standards." }
    ]
  },
  {
    id: "blog4",
    title: "Getting the Most Out of TalentHub's AI Services",
    excerpt: "A comprehensive walk-through of the new AI Cover Note drafting engine, resume attachment upload, and listing tools.",
    category: "TalentHub Guide",
    readTime: "5 min read",
    author: "Aditya",
    authorTitle: "Founder @ TalentHub",
    date: "Jun 1, 2026",
    thumbnail: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: [
      { type: "p", text: "TalentHub is built to make recruitment fast and simple. We have integrated smart AI tools to help both candidates apply faster and employers write better listings." },
      { type: "h3", text: "1. For Seekers: Personalized AI Cover Notes" },
      { type: "p", text: "When you apply for a job, click 'Draft with AI'. Our tool automatically reads your profile headlines, bio, and selected interests to construct a cover note tailored exactly to the job's requirements. This saves you hours of writing customized applications." },
      { type: "h3", text: "2. For Seekers: Resume Upload & Preview" },
      { type: "p", text: "Attach your resume in PDF or Word format directly on the application screen. We store this metadata securely in Firestore, allowing employers to instantly download and review it alongside your profile. This gives you a massive advantage." },
      { type: "h3", text: "3. For Providers: AI Job Description Builder" },
      { type: "p", text: "Stuck writing a posting? Just enter the Job Title and click 'Draft with AI'. The builder drafts a complete structured template outlining the role details, responsibilities, requirements, and benefits. You can modify it or insert it instantly." }
    ]
  }
];

const CATEGORIES = ["All", "Career Advice", "Resume Tips", "For Employers", "TalentHub Guide"];

export default function BlogModal({ isOpen, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState(null); // stores blog object when reading

  if (!isOpen) return null;

  const filteredBlogs = BLOG_DATA.filter((blog) => {
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white border border-border-divider rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between animate-scale-up">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-divider/50 flex items-center justify-between bg-panel-bg/40">
          <div className="flex items-center gap-2">
            <BookOpen size={22} className="text-primary-avocado" />
            <h2 className="text-xl font-bold font-serif text-body-text">TalentHub Blog & Career Center</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-muted-text hover:text-body-text rounded-full hover:bg-page-bg transition-colors"
            aria-label="Close Blog modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search and Filters Bar */}
        <div className="px-6 py-4 bg-panel-bg/15 border-b border-border-divider/30 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto pb-1 sm:pb-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-primary-avocado text-white border border-primary-avocado shadow-2xs'
                    : 'bg-white border border-border-divider/60 text-muted-text hover:text-body-text hover:border-border-divider'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-text">
              <Search size={14} />
            </div>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-4 py-2 border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl bg-white shadow-3xs"
            />
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredBlogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-text">
              No articles found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBlogs.map(blog => (
                <div 
                  key={blog.id}
                  onClick={() => setActiveArticle(blog)}
                  className="group border border-border-divider/50 bg-white rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  {/* Thumbnail Cover image */}
                  <div className="relative aspect-[2/1] overflow-hidden bg-black flex items-center justify-center">
                    <img 
                      src={blog.thumbnail} 
                      alt={blog.title} 
                      className="w-full h-full object-cover opacity-95 group-hover:scale-103 transition-transform duration-500"
                    />
                    
                    {/* Category Stamp */}
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/60 text-[9px] font-bold text-white uppercase tracking-wider">
                      {blog.category}
                    </span>
                  </div>

                  {/* Text Details Section */}
                  <div className="p-4 space-y-2 text-left flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-bold text-body-text group-hover:text-primary-avocado transition-colors leading-snug font-sans">
                        {blog.title}
                      </h3>
                      <p className="text-[10px] text-muted-text font-medium leading-relaxed line-clamp-2">
                        {blog.excerpt}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-[9px] text-muted-text font-semibold pt-2 border-t border-border-divider/20 mt-3 shrink-0">
                      <span className="flex items-center gap-1">
                        <User size={10} />
                        {blog.author}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5">
                          <Calendar size={10} />
                          {blog.date}
                        </span>
                        <span className="flex items-center gap-0.5 bg-badge-dept-bg text-badge-dept-text px-1 rounded">
                          <Clock size={10} />
                          {blog.readTime}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-divider/30 bg-panel-bg/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-border-divider hover:bg-white text-xs font-semibold rounded-xl text-body-text transition-colors cursor-pointer"
          >
            Close Blog
          </button>
        </div>

      </div>

      {/* Article Detail Reader Overlay Lightbox */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl bg-white border border-border-divider rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col justify-between animate-scale-up">
            
            {/* Lightbox Header */}
            <div className="px-6 py-4 border-b border-border-divider/40 flex items-center justify-between bg-panel-bg/20">
              <span className="text-[9px] font-bold uppercase tracking-wider bg-primary-avocado/10 text-primary-hover px-2 py-0.5 rounded-md">
                {activeArticle.category}
              </span>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1.5 hover:bg-page-bg text-muted-text hover:text-body-text rounded-full transition-colors z-20 focus:outline-none"
                aria-label="Close article reader"
              >
                <X size={16} />
              </button>
            </div>

            {/* Article Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
              {/* Cover Image */}
              <div className="w-full aspect-[21/9] rounded-xl overflow-hidden bg-panel-bg">
                <img 
                  src={activeArticle.thumbnail} 
                  alt={activeArticle.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Author */}
              <div className="space-y-3">
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-body-text leading-tight">
                  {activeArticle.title}
                </h1>
                
                <div className="flex items-center gap-3 pb-4 border-b border-border-divider/30">
                  <div className="w-8 h-8 rounded-full bg-primary-avocado/10 text-primary-hover flex items-center justify-center font-bold text-xs">
                    {activeArticle.author[0]}
                  </div>
                  <div className="text-left font-sans">
                    <p className="text-xs font-bold text-body-text">{activeArticle.author}</p>
                    <p className="text-[9px] text-muted-text font-medium">{activeArticle.authorTitle}</p>
                  </div>
                  <div className="ml-auto text-[10px] text-muted-text font-medium flex gap-3">
                    <span>{activeArticle.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={11} />
                      {activeArticle.readTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="space-y-4 font-sans text-xs text-muted-text leading-relaxed font-medium">
                {activeArticle.content.map((block, idx) => {
                  if (block.type === 'h3') {
                    return <h3 key={idx} className="text-sm font-bold text-body-text pt-2 font-sans">{block.text}</h3>;
                  }
                  if (block.type === 'list') {
                    return (
                      <ul key={idx} className="list-disc pl-5 space-y-1 text-muted-text font-medium">
                        {block.items.map((item, itemIdx) => (
                          <li key={itemIdx}>{item}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={idx}>{block.text}</p>;
                })}
              </div>

            </div>

            {/* Lightbox Footer */}
            <div className="px-6 py-4 border-t border-border-divider/30 bg-panel-bg/20 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-4 py-1.5 bg-primary-avocado hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Finished Reading
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
