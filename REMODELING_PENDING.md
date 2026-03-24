# Website Remodeling — Progress & Pending Tasks

## Goal
Reframe johnguerra.co around three pillars — **Information Visualization**, **AI-Assisted Development & Education**, and **Accessibility** — to appeal to industry roles with a research component.

Full improvement plan: `.improvements/improvementPlan.md`

## Completed (branch: `website-improvements`)

### Identity & Tagline (Tasks 1, 3)
- New tagline: "I build tools and teach developers at the intersection of information visualization, AI-assisted development, and accessibility."
- Rewrote "In a nutshell" to lead with impact: role, three pillars, Vibe Coding, IRIS/BTactile, career trajectory
- Added "By the numbers" section (20+ years engineer, 15+ teaching, 12+ research, 30+ publications, entrepreneur, speaker)
- Fixed title to "Associate Teaching Professor" everywhere
- Synced `cv.ejs.html` with updated `index.ejs.html` content
- Fixed "Creator" → "Co-creator" for IRIS and BTactile

### Skills Section (Task 4)
- Replaced static PNG skill diagrams with text-based categorized list
- Added new categories: AI & LLMs (Claude Code, Prompt Engineering, LLM APIs, MCP, Agent Architectures) and Accessibility (Tactile Interfaces, Assistive Technology, WCAG)
- D3 satellite chart code saved in `js/skillsChart.js` (disabled, to revisit — see pending)

### Featured Course (Task 7)
- Added prominent dark card for "CS 7180: Vibe Coding — AI-Assisted Software Engineering" between intro and experience sections
- Includes topic badges (Claude Code, Prompt Engineering, Agent Architectures, MCP, Evals) and CTA button

### Projects by Theme (Task 2)
- Reorganized from flat list into three themed sections with orange headers:
  - **Information Visualization**: Navio, Reactive Widgets (IEEEVIS 2024), Network Explorer, TreeVersity v2/v1, Phototreemap, LifeFlow, Tweetometro
  - **AI & Developer Education**: Vibe Coding course
  - **Accessibility**: IRIS (patented, 10+ awards), BTactile (5000+ tactile graphics)
- Rewrote descriptions to emphasize impact, users, and deployment

### Experience Bullets (Tasks 8, 9)
- Northeastern: courses taught including Vibe Coding, Khoury Viz Lab
- Uniandes: course delivery scale (8 semesters)
- Berkeley: MIDS curriculum design, hundreds of remote students, 7 semesters
- Yahoo: shipped Flickr features (millions of users), org-wide analytics tool
- PARC: Network Explorer deployed in Xerox fraud detection product
- DUTO: co-founded accessibility startup, CTO for 10 years, 10+ awards

### Infrastructure
- Fixed `build.sh` to use `npx` for `ejs` and `prettier`
- Created `CLAUDE.md` with project conventions

---

## Pending

### High Priority — Skills Visualization
The text-based skills list works but is not visually engaging. A D3 satellite chart is saved in `js/skillsChart.js` (commit `1ac55a2`) but needs work:
- Proportions: center circle size, bubble spacing, orbit radius
- Colors: closer to original `d3.schemeCategory10` palette
- Labels: legibility at small sizes
- Layout: two charts ("My Skills" areas + "Tools & Techniques") stacked in `col-md-3`
- The Observable notebook at `@john-guerra/skills` should also be updated with the new data

### Medium Priority — Blog/Writing Section (Task 5)
Create a `/blog` or `/writing` section. Suggested posts:
1. "What I've Learned Teaching AI-Assisted Coding"
2. "Accessibility in the Age of AI"
3. "How Developers Actually Build Skills"
4. "Information Visualization for AI Systems"

### Medium Priority — Industry Resume PDF (Task 6)
Create a 1-2 page industry-focused resume (separate from academic CV):
- Professional summary naming the three pillars
- "Selected Projects" with 4-6 highest-impact items
- Technical skills prominently listed
- Teaching summarized as one line
- Publications summarized as one line
- Link to full academic CV

### Lower Priority — Navigation Restructure (Task 10)
Consider restructuring navigation to: About | Projects | Writing | Teaching | Publications | Resume
- Depends on blog and industry resume existing first

### Lower Priority — Industry Experience Framing (Task 9)
Add visual distinction between industry roles (PARC, Yahoo, DUTO) and academic roles (Northeastern, Berkeley, Uniandes) in the experience section.
