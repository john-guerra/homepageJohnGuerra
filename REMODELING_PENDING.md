# Website Remodeling — Progress & Pending Tasks

## Goal
Reframe johnguerra.co around three pillars — **Information Visualization**, **AI-Assisted Development & Education**, and **Accessibility** — to appeal to industry roles with a research component.

Full improvement plan: `.improvements/improvementPlan.md`

## Completed (branch: `website-improvements`)

### Identity & Tagline (Tasks 1, 3)
- Kept original nutshell paragraph, added two new paragraphs: Vibe Coding/IRIS/BTactile highlights + career trajectory
- Added "By the numbers" section with dynamic EJS year counts (computed at build time from start years: research 2008, engineering 2003, teaching 2005, speaking 2005)
- Fixed title to "Associate Teaching Professor" everywhere
- Fixed "Creator" → "Co-creator" for IRIS and BTactile
- Corrected Yahoo description: "built internal visualization tools" (not "shipped Flickr features")

### Skills Visualization (Task 4)
- D3 satellite charts live on homepage with two charts: "My Skills" + "Tools & Techniques"
- forceRadial for circular layout, mouse repulsion via phantom node
- Separated circles and labels into SVG layers (labels never occluded)
- Semitransparent category centroid labels (Roboto Condensed) with drop shadow
- Shared color scale across both charts (Research, Engineering, Education)
- Roboto Condensed font added to headers partial

### Featured Course (Task 7)
- Prominent dark card for "CS 7180: Vibe Coding" between intro and experience
- Topic badges (Claude Code, Prompt Engineering, Agent Architectures, MCP, Evals)

### Projects by Theme (Task 2)
- Reorganized into 5 categories:
  - **Information Visualization** (6): Navio, Network Explorer, Reactive Widgets (+npm), VisPub Network, TreeVersity v2, Phototreemap
  - **Elections & Civic Data** (7): US Elections 2024 storytelling, US Elections 2020/2016, Colombian Senate, Presidential Elections 2018, Peace Agreement, Anti-corruption Referendum, Tweetometro
  - **Open Source Libraries** (4): force-in-a-box, d3-force-boundary, netClustering.js, revealVizScroll + link to /oss/ analytics
  - **AI & Developer Education** (3): Paper Explorers (8 conferences), UMAP Playground, Vibe Coding course
  - **Accessibility** (2): IRIS, BTactile
- Screenshots captured for Paper Explorer, UMAP Playground, Vibe Coding, US Elections 2024

### Experience Bullets (Tasks 8, 9)
- Northeastern: courses taught including Vibe Coding, Khoury Viz Lab
- Uniandes: course delivery scale (8 semesters)
- Berkeley: MIDS curriculum design, hundreds of remote students, 7 semesters
- Yahoo: built internal visualization tools (corrected)
- PARC: Network Explorer deployed in Xerox fraud detection product
- DUTO: co-founded accessibility startup, CTO for 10 years, 10+ awards
- projectsComb made sticky with scrollHeight matching

### Infrastructure
- Fixed `build.sh` to use `npx` for `ejs` and `prettier`
- Created `CLAUDE.md` with project conventions

---

## Pending

### Medium Priority — CV Page Sync
`cv.ejs.html` needs to be updated to match the homepage changes:
- New nutshell text with three paragraphs + "By the numbers"
- Dynamic year counts
- Text-based skills list (D3 charts don't make sense for PDF export)
- Corrected Yahoo description

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
- Teaching and publications each summarized in one line
- Link to full academic CV

### Lower Priority — Navigation Restructure (Task 10)
Consider restructuring navigation to: About | Projects | Writing | Teaching | Publications | Resume
- Depends on blog and industry resume existing first

### Lower Priority — Industry Experience Framing (Task 9)
Add visual distinction between industry roles (PARC, Yahoo, DUTO) and academic roles (Northeastern, Berkeley, Uniandes) in the experience section.
