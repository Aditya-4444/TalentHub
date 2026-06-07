/**
 * AI Assistant Services Helper (Simulated Client-Side)
 */

export const generateCoverLetter = (job, userData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const name = userData?.displayName || "Jane Doe";
      const headline = userData?.headline || "Aspiring Specialist";
      const interests = userData?.interests ? userData.interests.join(", ") : "";

      const drafts = [
        `Dear Hiring Team at ${job.company},

I am writing to express my enthusiastic interest in the ${job.title} position at your company. With my background as a ${headline} and my deep interest in ${job.department}, I believe this role is a perfect match for my skills and career aspirations.

In my previous projects, I have focused on solving complex problems and delivering clean, efficient solutions. I was drawn to ${job.company} because of your commitment to excellence, and I am excited about the opportunity to contribute to projects like this one. Your job description outlines requirements that align closely with my experience, particularly in terms of collaboration, execution, and professional drive.

My interests in ${interests || job.department} have provided me with a robust foundation to hit the ground running. I am eager to bring my dedication, technical aptitude, and problem-solving mindset to the ${job.title} position.

Thank you for your time and consideration. I look forward to the possibility of discussing how my experience can add value to your team.

Best regards,
${name}`,

        `Dear hiring managers at ${job.company},

I was thrilled to see the opening for a ${job.title} position. As a dedicated ${headline} with direct interest in ${job.department}, I am confident that my skills and work ethic make me an exceptional fit for this role.

Having reviewed the job description, I am highly motivated by the responsibilities and tech stacks you outlined. My experience, combined with my professional interests in ${interests || 'building high-quality products'}, matches the core competencies you seek. I pride myself on being a fast learner, a proactive team player, and a dedicated contributor who thrives in fast-paced environments.

I would love to join ${job.company} and apply my skills to help drive the team's objectives. Thank you for reviewing my credentials, and I welcome the opportunity for an interview.

Sincerely,
${name}`
      ];

      // Pick a random draft
      const chosen = drafts[Math.floor(Math.random() * drafts.length)];
      resolve(chosen);
    }, 1200); // 1.2s delay to simulate analysis
  });
};

export const generateJobDescription = (title, department, company) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const cleanTitle = title.trim();
      const cleanCompany = company ? company.trim() : "our company";
      const cleanDept = department || "Engineering";

      // 1. Tech stack / developer match
      if (/react|frontend|front-end|developer|engineer|coder|programmer|javascript|web/i.test(cleanTitle)) {
        resolve(`### Role Overview
We are looking for an experienced and passionate Software Developer/Engineer to join our core product development team at ${cleanCompany}. In this role, you will help design, build, and maintain robust web applications, collaborate closely with cross-functional teams, and write clean, scalable code.

### Key Responsibilities
- Lead the architecture and implementation of user-facing features.
- Optimize web applications for maximum speed, security, and scalability.
- Collaborate with designers and product managers to translate mockups into fully functional products.
- Participate in code reviews, write unit tests, and maintain comprehensive technical documentation.

### Requirements
- Strong proficiency in modern JavaScript, HTML5, CSS3, and frontend libraries (e.g. React, Vue, or similar frameworks).
- Experience with state management, responsive designs, and cross-browser compatibility.
- Familiarity with version control systems (Git) and RESTful API integrations.
- Excellent communication skills and a team-first collaborative attitude.

### Benefits
- Competitive salary packages with performance-based bonuses.
- Comprehensive health, dental, and vision insurance plan.
- Flexible work hours and remote-friendly options.
- Annual learning stipend for professional development and training courses.`);
        return;
      }

      // 2. Product Management / Agile match
      if (/product|manager|pm|scrum|owner|agile/i.test(cleanTitle)) {
        resolve(`### Role Overview
${cleanCompany} is seeking a motivated and analytical Product Manager to own our product roadmap, lead sprint teams, and define product specifications. You will sit at the intersection of business, technology, and design to build products that our users love.

### Key Responsibilities
- Define and communicate product vision, roadmap, and core metrics to internal stakeholders.
- Author clear, detailed product requirements documents (PRDs) and user stories.
- Run agile scrum sprint planning, daily standups, and retrospective meetings.
- Analyze customer feedback, user behavior data, and market trends to identify new opportunities.

### Requirements
- Solid experience in product management, project management, or systems analysis in a technology firm.
- Outstanding analytical skills with a data-driven approach to product decisions.
- Strong leadership ability to influence cross-functional teams without direct authority.
- Experience working closely with software developers and UI/UX designers.

### Benefits
- Competitive compensation plan with equity/stock options.
- Premium medical coverage and retirement savings match.
- High-growth career path with mentoring opportunities.
- Collaborative, inclusive work culture with regular team events.`);
        return;
      }

      // 3. UI/UX / Design match
      if (/design|designer|creative|ux|ui|artist|illustrator/i.test(cleanTitle)) {
        resolve(`### Role Overview
We are seeking a talented and creative Designer to lead the UI/UX design of our primary platforms at ${cleanCompany}. You will craft elegant, user-centric experiences, build comprehensive design systems, and run user research validation tests.

### Key Responsibilities
- Create wireframes, user flows, interactive prototypes, and high-fidelity mockups.
- Develop and maintain unified design systems and style guides.
- Conduct user research, usability testing sessions, and translate insights into design refinements.
- Collaborate directly with frontend engineers to ensure design implementation matches specifications.

### Requirements
- A strong design portfolio demonstrating end-to-end user-centered design processes.
- High proficiency in modern design tools such as Figma, Sketch, or Adobe Creative Suite.
- Good understanding of human-computer interaction (HCI) principles and responsive layout design.
- Ability to articulate design decisions clearly and receive feedback constructively.

### Benefits
- Highly competitive pay scale.
- Flexible work arrangements (fully remote options available).
- Modern home-office gear setup allowance.
- Health insurance coverage and generous paid time off (PTO).`);
        return;
      }

      // 4. Marketing match
      if (/marketing|seo|growth|ads|sales|social|content|pr/i.test(cleanTitle)) {
        resolve(`### Role Overview
We are looking for a creative and result-driven Marketing & Growth Specialist to lead client acquisition, branding, and content campaigns at ${cleanCompany}. In this role, you will develop marketing strategies, run analytical ad tests, and drive brand awareness.

### Key Responsibilities
- Manage paid ads campaigns (Google, Meta, LinkedIn) and optimize conversion funnels.
- Research, write, and publish high-quality content across our company blog and social channels.
- Analyze marketing analytics data to measure campaign ROI and report key performance indicators.
- Collaborate with the design team to build landing pages and marketing assets.

### Requirements
- Proven experience running digital marketing, growth hacking, or content creation campaigns.
- High proficiency in Google Analytics, SEO tools, and social media platforms.
- Strong writing, editing, and verbal communication skills.
- Analytical mindset with the ability to draw insights from data.

### Benefits
- Competitive base salary with performance bonuses.
- Comprehensive health, dental, and vision insurance.
- Annual budget for books, online courses, and industry conferences.
- High-energy, supportive team environment.`);
        return;
      }

      // 5. Generic fallback
      resolve(`### Role Overview
We are looking for a dedicated professional to join our ${cleanDept} department at ${cleanCompany}. You will collaborate with our core team, streamline processes, and execute tasks necessary to drive company success in a fast-growing industry.

### Key Responsibilities
- Collaborate with team members to deliver key deliverables on time.
- Identify bottlenecks and execute strategic plans to optimize workflow.
- Draft reports, coordinate schedules, and maintain project documentation.
- Maintain top-tier standards of professional execution and quality.

### Requirements
- Proven experience in a related professional role.
- Strong communication, organization, and time-management skills.
- Ability to learn quickly and adapt to dynamic business needs.
- Collaborative spirit and positive team-oriented attitude.

### Benefits
- Competitive salary and performance incentives.
- Full health benefit package.
- Generous vacation policy.
- Dynamic career advancement opportunities.`);
    }, 1200);
  });
};
