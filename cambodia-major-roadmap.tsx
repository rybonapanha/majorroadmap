import React, { useState, useMemo, useEffect, useRef, useContext, createContext } from "react";
import {
  Search, Heart, Moon, Sun, ChevronRight, ChevronLeft, ChevronDown, X, Menu,
  GraduationCap, Briefcase, Code, TrendingUp, MapPin, DollarSign, Award, Users,
  BookOpen, Target, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Building2,
  Globe, MessageCircle, Send, Bookmark, Filter, Star, Palette, Stethoscope,
  Scale, Wheat, Landmark, UtensilsCrossed, Cpu, Clock, Calendar, ExternalLink,
  Loader2, Home, SlidersHorizontal, Percent, Flag, School, HardHat, Leaf,
  Gavel, PenTool, Compass, Route, Milestone, ThumbsUp, Quote, PlayCircle,
  FileText, Plus, Minus, AlertCircle, Info, Mail, Phone, Bot, Sparkle,
  Waypoints, Signpost, BarChart3, ClipboardList, UserRound, Building, RotateCcw
} from "lucide-react";

/* ============================================================
   CAMBODIA MAJOR ROADMAP — interactive prototype
   Design language: "wayfinding" — a route line with numbered
   waypoints, drawn from Cambodia's river-delta geography, used
   ONLY where the content is genuinely sequential (Roadmap, Quiz
   progress). Everything else stays quiet so that motif reads as
   a signature rather than decoration.

   NOTE ON DATA: all university/major figures (tuition, salary,
   rankings, program lists) are ILLUSTRATIVE SAMPLE DATA for this
   prototype's UI/UX — not verified current figures. A production
   build would replace this file's data with a real database (see
   the note at the bottom of the Roadmap page).
   ============================================================ */

/* ---------------- Theme tokens ---------------- */
const PALETTE = {
  light: {
    bg: "#F4F7F2", bgAlt: "#EAF0E6", surface: "#FFFFFF", surfaceAlt: "#F0F4EE",
    text: "#12231C", muted: "#5B6B62", border: "#DEE6DC", borderStrong: "#C6D2C2",
    ink: "#0F3D2E", navBg: "rgba(244,247,242,0.85)",
  },
  dark: {
    bg: "#0A1912", bgAlt: "#0E2118", surface: "#12261C", surfaceAlt: "#173023",
    text: "#EAF3ED", muted: "#93AA9E", border: "#1F3B2C", borderStrong: "#2B4E3A",
    ink: "#EAF3ED", navBg: "rgba(10,25,18,0.82)",
  },
};
const ACCENT = {
  saffron: "#E8A33D", saffronDark: "#C4841F", saffronSoft: "#FBEBD1",
  mekong: "#2C6E8E", mekongSoft: "#DCEBF1",
  laterite: "#C0392E", lateriteSoft: "#F6DEDB",
  paddy: "#1F6E4C", paddySoft: "#DDEFE4",
};
const FONT_DISPLAY = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
const FONT_BODY = "'Inter', ui-sans-serif, system-ui, sans-serif";
const FONT_MONO = "'IBM Plex Mono', ui-monospace, monospace";

/* ---------------- tiny utils ---------------- */
function cx(...a) { return a.filter(Boolean).join(" "); }
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

/* Very small EN/KM label dictionary for nav + core chrome only.
   Longer copy stays in English; see the "draft" note on the toggle. */
const DICT = {
  en: {
    home: "Home", majors: "Majors", universities: "Universities", compare: "Compare",
    roadmap: "Roadmap", scholarships: "Scholarships", careers: "Careers", favorites: "Saved",
    search: "Search", takeQuiz: "Take Career Quiz", exploreMajors: "Explore Majors",
  },
  km: {
    home: "ទំព័រដើម", majors: "ជំនាញ", universities: "សាកលវិទ្យាល័យ", compare: "ប្រៀបធៀប",
    roadmap: "ផែនទីផ្លូវ", scholarships: "អាហារូបករណ៍", careers: "អាជីព", favorites: "បានរក្សាទុក",
    search: "ស្វែងរក", takeQuiz: "ធ្វើតេស្តអាជីព", exploreMajors: "រុករកជំនាញ",
  },
};

/* ---------------- App-wide context ---------------- */
const AppContext = createContext(null);
function useApp() { return useContext(AppContext); }

/* ---------------- Categories ---------------- */
const CATEGORIES = [
  { id: "tech", name: "Technology", icon: "Cpu", tint: ACCENT.mekong, tintSoft: ACCENT.mekongSoft, blurb: "Software, data, and systems" },
  { id: "business", name: "Business", icon: "Briefcase", tint: ACCENT.saffronDark, tintSoft: ACCENT.saffronSoft, blurb: "Management, finance, and trade" },
  { id: "engineering", name: "Engineering", icon: "HardHat", tint: "#7A5230", tintSoft: "#EEE2D2", blurb: "Building the physical world" },
  { id: "health", name: "Health Sciences", icon: "Stethoscope", tint: ACCENT.laterite, tintSoft: ACCENT.lateriteSoft, blurb: "Medicine, nursing, and care" },
  { id: "education", name: "Education", icon: "GraduationCap", tint: ACCENT.paddy, tintSoft: ACCENT.paddySoft, blurb: "Teaching and curriculum" },
  { id: "law", name: "Law", icon: "Gavel", tint: "#4A4E69", tintSoft: "#E4E3EE", blurb: "Justice, policy, and rights" },
  { id: "arts", name: "Arts & Design", icon: "Palette", tint: "#A2447A", tintSoft: "#F3DEEA", blurb: "Visual and creative craft" },
  { id: "hospitality", name: "Hospitality & Tourism", icon: "UtensilsCrossed", tint: "#B5602A", tintSoft: "#F1DFCC", blurb: "Travel, hotels, and events" },
  { id: "agriculture", name: "Agriculture", icon: "Wheat", tint: "#6E7E1F", tintSoft: "#E7ECC9", blurb: "Farming, food, and land" },
  { id: "social", name: "Social Sciences", icon: "Users", tint: "#2C6E8E", tintSoft: ACCENT.mekongSoft, blurb: "People, policy, and society" },
];
function getCategory(id) { return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0]; }

/* ---------------- Majors ---------------- */
const MAJORS = [
  {
    id: "cs", name: "Computer Science", categoryId: "tech",
    shortDesc: "The theory and practice of building software and computing systems.",
    overview: "Computer Science covers how software, data, and hardware work together — from algorithms to AI. It suits people who like solving abstract problems in a logical, structured way.",
    difficulty: 4, mathLevel: 4, duration: "4 yrs", tuition: "$900–$2,800/yr (est.)",
    englishReq: "IELTS 5.5 or equivalent", programmingRequired: true,
    communicationLevel: 3, creativityLevel: 3, problemSolvingLevel: 5,
    demand: 5, growth: 5, remote: 5, intl: 5, worklife: 3,
    salary: "$350–$900/mo entry · $1,500+/mo senior (est.)",
    profile: { math: 4, tech: 5, business: 1, creative: 2, people: 1, science: 2, handson: 1 },
    whatYoullStudy: ["Algorithms & data structures", "Programming languages", "Operating systems", "Artificial intelligence basics"],
    coreSubjects: ["Discrete mathematics", "Data structures", "Databases", "Computer networks", "Software engineering"],
    skillsRequired: ["Logical reasoning", "Pattern recognition", "Independent debugging", "Continuous self-learning"],
    suitablePersonality: ["Enjoys puzzles", "Comfortable working alone", "Detail-oriented"],
    notRecommendedIf: ["You dislike abstract math", "You need constant social interaction to stay engaged"],
    handsOn: ["Weekly coding assignments", "A capstone software project", "Hackathons and coding competitions"],
    internship: "Most programs arrange a 2–4 month internship at a local tech firm in year 3 or 4.",
    careerPaths: ["Software Developer", "Data Engineer", "Machine Learning Engineer", "Systems Analyst", "IT Consultant"],
    industries: ["Tech startups", "Banking & fintech", "NGOs & development", "Outsourced software (remote teams)"],
    intlOpportunities: "High — remote and overseas roles are common once you have a strong portfolio.",
    futureDemand: "Growing quickly as Cambodian businesses digitize and outsourcing demand rises.",
    pros: ["High starting demand", "Remote-work friendly", "Skills transfer globally"],
    cons: ["Steep early learning curve", "Requires constant upskilling", "Long screen-time hours"],
    relatedMajors: ["se", "mis", "cyber"],
    universities: ["rupp", "itc", "aupp", "paragon", "num"],
    faqs: [
      { q: "Do I need to already know how to code?", a: "No — most programs start from the basics in year one." },
      { q: "Is this the same as Software Engineering?", a: "They overlap heavily; CS leans more theoretical, SE leans more team/process." },
    ],
    testimonial: { name: "Sreymom K.", role: "3rd-year CS student, ITC", text: "The math was harder than I expected, but building my first working app made it click." },
  },
  {
    id: "se", name: "Software Engineering", categoryId: "tech",
    shortDesc: "Applying engineering discipline to design, build, and ship real software.",
    overview: "Software Engineering focuses on how software gets built in teams — planning, testing, shipping, and maintaining products, not just writing code.",
    difficulty: 4, mathLevel: 3, duration: "4 yrs", tuition: "$1,000–$3,000/yr (est.)",
    englishReq: "IELTS 5.5 or equivalent", programmingRequired: true,
    communicationLevel: 4, creativityLevel: 3, problemSolvingLevel: 5,
    demand: 5, growth: 5, remote: 5, intl: 4, worklife: 3,
    salary: "$350–$950/mo entry · $1,600+/mo senior (est.)",
    profile: { math: 3, tech: 5, business: 2, creative: 2, people: 2, science: 1, handson: 2 },
    whatYoullStudy: ["Software design patterns", "Testing & quality assurance", "Version control & teamwork", "Project/product management basics"],
    coreSubjects: ["Data structures", "Software architecture", "Databases", "Agile project management"],
    skillsRequired: ["Collaboration", "Systematic testing habits", "Clear technical writing", "Debugging under deadlines"],
    suitablePersonality: ["Likes structured teamwork", "Comfortable with feedback and code review"],
    notRecommendedIf: ["You strongly prefer solo, unstructured work"],
    handsOn: ["Team-based sprint projects", "A shipped group capstone app", "Code review practice"],
    internship: "Group-based internships with local software houses are common in the final year.",
    careerPaths: ["Full-Stack Developer", "QA/Test Engineer", "DevOps Engineer", "Mobile App Developer", "Engineering Team Lead"],
    industries: ["Software agencies", "Fintech", "E-commerce", "Outsourced/remote dev teams"],
    intlOpportunities: "High for remote contracting once you can show shipped projects.",
    futureDemand: "Strong — most Cambodian tech job postings ask for practical SE skills over pure theory.",
    pros: ["Team-friendly path into tech", "Strong portfolio-driven hiring", "Many entry routes (bootcamp overlap)"],
    cons: ["Can involve tight deadlines", "Tooling changes fast", "Interview processes are competitive"],
    relatedMajors: ["cs", "mis"],
    universities: ["itc", "aupp", "paragon"],
    faqs: [
      { q: "Is a portfolio really necessary?", a: "Yes — most employers weigh a portfolio of real projects above GPA." },
      { q: "Can I freelance while studying?", a: "Many students take small freelance web projects from year 2 onward." },
    ],
    testimonial: { name: "Panha S.", role: "Graduate, freelance developer", text: "Group projects were frustrating at times, but they're exactly what client work feels like now." },
  },
  {
    id: "mis", name: "Management Information Systems", categoryId: "tech",
    shortDesc: "The bridge between business strategy and information technology.",
    overview: "MIS trains you to design and manage the systems businesses run on — part technology, part management. Ideal if you like tech but also enjoy business thinking.",
    difficulty: 3, mathLevel: 3, duration: "4 yrs", tuition: "$700–$2,200/yr (est.)",
    englishReq: "IELTS 5.0–5.5 or equivalent", programmingRequired: true,
    communicationLevel: 4, creativityLevel: 2, problemSolvingLevel: 4,
    demand: 4, growth: 4, remote: 3, intl: 3, worklife: 4,
    salary: "$300–$700/mo entry · $1,200+/mo senior (est.)",
    profile: { math: 3, tech: 4, business: 4, creative: 2, people: 3, science: 1, handson: 1 },
    whatYoullStudy: ["Database & ERP systems", "Business process analysis", "IT project management", "Systems design"],
    coreSubjects: ["Database management", "Business analysis", "Networking basics", "Management principles"],
    skillsRequired: ["Translating business needs into systems", "Basic programming/SQL", "Stakeholder communication"],
    suitablePersonality: ["Enjoys both people and systems", "Practical problem-solver"],
    notRecommendedIf: ["You want to avoid business/management coursework entirely"],
    handsOn: ["ERP simulation projects", "A systems-analysis case study", "Database design assignments"],
    internship: "Common placements in bank IT departments, telcos, and NGOs.",
    careerPaths: ["IT Business Analyst", "Systems Administrator", "ERP Consultant", "Database Administrator", "IT Project Coordinator"],
    industries: ["Banking", "Telecom", "NGOs", "Manufacturing & logistics"],
    intlOpportunities: "Moderate — strongest with regional companies expanding into Cambodia.",
    futureDemand: "Steady growth as more Cambodian organizations adopt ERP and digital systems.",
    pros: ["Blends tech with business", "Broad job market", "Good stepping stone into management"],
    cons: ["Less specialized than pure CS", "Some roles are process-heavy"],
    relatedMajors: ["cs", "ba"],
    universities: ["num", "rupp", "aupp"],
    faqs: [
      { q: "Is this easier than Computer Science?", a: "It's less math/theory-heavy but still requires solid technical literacy." },
      { q: "Can MIS grads become developers?", a: "Some do, usually by building extra coding skills independently." },
    ],
    testimonial: { name: "Vibol C.", role: "IT Business Analyst, bank sector", text: "I get to talk to both the tech team and management — that mix is exactly what I wanted." },
  },
  {
    id: "cyber", name: "Cybersecurity", categoryId: "tech",
    shortDesc: "Defending systems, networks, and data from digital threats.",
    overview: "Cybersecurity focuses on finding and closing security gaps before attackers do. It suits methodical, curious people who enjoy thinking like both defender and attacker.",
    difficulty: 4, mathLevel: 3, duration: "4 yrs", tuition: "$1,000–$2,900/yr (est.)",
    englishReq: "IELTS 5.5 or equivalent", programmingRequired: true,
    communicationLevel: 3, creativityLevel: 2, problemSolvingLevel: 5,
    demand: 4, growth: 5, remote: 4, intl: 4, worklife: 3,
    salary: "$400–$1,000/mo entry · $1,700+/mo senior (est.)",
    profile: { math: 3, tech: 5, business: 2, creative: 1, people: 1, science: 2, handson: 2 },
    whatYoullStudy: ["Network security", "Ethical hacking fundamentals", "Cryptography basics", "Security policy & compliance"],
    coreSubjects: ["Networking", "Operating systems", "Cryptography", "Digital forensics"],
    skillsRequired: ["Methodical thinking", "Comfort with constant new threats", "Strong ethics"],
    suitablePersonality: ["Curious and persistent", "Comfortable with rules and compliance work"],
    notRecommendedIf: ["You're not interested in security ethics/legal boundaries"],
    handsOn: ["Capture-the-flag competitions", "A security audit project", "Lab-based penetration testing exercises"],
    internship: "Placements with banks, telcos, and regional security firms are the most common route.",
    careerPaths: ["Security Analyst", "Penetration Tester", "SOC Analyst", "Network Security Engineer"],
    industries: ["Banking", "Telecom", "Government IT", "Regional security consultancies"],
    intlOpportunities: "Growing — certifications (CompTIA, CEH) travel well internationally.",
    futureDemand: "Rising fast as more institutions digitize and face more attacks.",
    pros: ["Strong salary premium for certified roles", "Constantly intellectually engaging"],
    cons: ["High-stakes, high-pressure incidents", "Requires ongoing certification"],
    relatedMajors: ["cs", "se"],
    universities: ["itc", "aupp"],
    faqs: [
      { q: "Do I need Computer Science first?", a: "No, but a strong CS foundation is built into most cybersecurity programs." },
      { q: "Are certifications required after graduating?", a: "Most employers expect at least one industry certification within your first year or two." },
    ],
    testimonial: { name: "Bunthoeun R.", role: "SOC Analyst", text: "Every shift is different — that unpredictability is what keeps me interested." },
  },
  {
    id: "ba", name: "Business Administration", categoryId: "business",
    shortDesc: "A broad foundation in managing people, operations, and organizations.",
    overview: "Business Administration gives you a generalist toolkit — management, operations, HR, and strategy — useful across almost any industry or your own venture.",
    difficulty: 2, mathLevel: 2, duration: "4 yrs", tuition: "$600–$1,800/yr (est.)",
    englishReq: "IELTS 5.0 or equivalent", programmingRequired: false,
    communicationLevel: 5, creativityLevel: 3, problemSolvingLevel: 3,
    demand: 4, growth: 3, remote: 2, intl: 3, worklife: 4,
    salary: "$250–$600/mo entry · $1,000+/mo senior (est.)",
    profile: { math: 2, tech: 2, business: 5, creative: 2, people: 4, science: 0, handson: 1 },
    whatYoullStudy: ["Management principles", "Operations & supply chain", "Human resources", "Business strategy"],
    coreSubjects: ["Microeconomics", "Organizational behavior", "Marketing basics", "Business law"],
    skillsRequired: ["Communication", "Organization", "Adaptability across functions"],
    suitablePersonality: ["Enjoys coordinating people and projects", "Comfortable with ambiguity"],
    notRecommendedIf: ["You want deep technical specialization from day one"],
    handsOn: ["Business plan competitions", "Group case-study presentations", "A small-business consulting project"],
    internship: "Rotational internships across departments are common at mid-size firms.",
    careerPaths: ["Operations Manager", "HR Officer", "Business Consultant", "Entrepreneur", "Sales Manager"],
    industries: ["Retail & FMCG", "Manufacturing", "NGOs", "Startups"],
    intlOpportunities: "Moderate — strongest through regional companies and MBA study abroad later.",
    futureDemand: "Stable, broad demand across nearly every sector.",
    pros: ["Very flexible career paths", "Useful for entrepreneurship", "Wide alumni network"],
    cons: ["Less differentiated than a specialist degree", "Entry salaries can be modest without a specialization"],
    relatedMajors: ["marketing", "accounting"],
    universities: ["num", "aupp", "paragon", "camed", "rupp"],
    faqs: [
      { q: "Should I specialize later?", a: "Many students add a minor or certificate (finance, marketing, HR) in year 3." },
      { q: "Is this good for starting a business?", a: "Yes — it's one of the most common paths for future founders." },
    ],
    testimonial: { name: "Chanra T.", role: "Founder, small retail brand", text: "The business plan module I dreaded turned into the actual plan I used to start my shop." },
  },
  {
    id: "accounting", name: "Accounting & Finance", categoryId: "business",
    shortDesc: "The language of business — tracking, analyzing, and reporting money.",
    overview: "Accounting & Finance builds precise, numbers-driven skills for tracking company performance, from bookkeeping to investment analysis.",
    difficulty: 3, mathLevel: 4, duration: "4 yrs", tuition: "$700–$2,000/yr (est.)",
    englishReq: "IELTS 5.0–5.5 or equivalent", programmingRequired: false,
    communicationLevel: 3, creativityLevel: 1, problemSolvingLevel: 4,
    demand: 4, growth: 3, remote: 2, intl: 4, worklife: 3,
    salary: "$300–$700/mo entry · $1,300+/mo senior (est.)",
    profile: { math: 4, tech: 2, business: 5, creative: 1, people: 2, science: 0, handson: 0 },
    whatYoullStudy: ["Financial & managerial accounting", "Auditing", "Taxation", "Corporate finance"],
    coreSubjects: ["Financial accounting", "Statistics", "Business law", "Financial management"],
    skillsRequired: ["Precision & attention to detail", "Comfort with regulation", "Spreadsheet fluency"],
    suitablePersonality: ["Methodical and rule-following", "Comfortable with repetitive precision work"],
    notRecommendedIf: ["You dislike detail-heavy, rule-bound work"],
    handsOn: ["Mock audits", "Tax-filing case exercises", "Financial modeling assignments"],
    internship: "Audit-season internships at accounting firms are the standard entry point.",
    careerPaths: ["Auditor", "Financial Analyst", "Tax Consultant", "Investment Analyst", "ACCA-track Accountant"],
    industries: ["Audit firms", "Banking", "Corporate finance", "NGOs (compliance/finance roles)"],
    intlOpportunities: "High — ACCA/CPA-track qualifications are recognized internationally.",
    futureDemand: "Consistently strong; every registered business needs accounting compliance.",
    pros: ["Very stable demand", "Clear professional certification path (ACCA)", "Portable qualification"],
    cons: ["Repetitive during audit season", "Heavy regulation to keep up with"],
    relatedMajors: ["ba", "mis"],
    universities: ["camed", "num", "rupp", "paragon"],
    faqs: [
      { q: "Is ACCA required?", a: "Not required, but it substantially raises salary ceiling and international mobility." },
      { q: "Is this a good major if I dislike public speaking?", a: "Yes — it's one of the more introvert-friendly business paths." },
    ],
    testimonial: { name: "Dara P.", role: "Junior Auditor", text: "It's precise, sometimes tedious work — but the ACCA path gives a very clear ladder to climb." },
  },
  {
    id: "marketing", name: "Marketing", categoryId: "business",
    shortDesc: "Understanding people well enough to connect them with products and brands.",
    overview: "Marketing blends creativity with consumer psychology and data — building brands, campaigns, and digital strategy.",
    difficulty: 2, mathLevel: 2, duration: "4 yrs", tuition: "$600–$1,900/yr (est.)",
    englishReq: "IELTS 5.0 or equivalent", programmingRequired: false,
    communicationLevel: 5, creativityLevel: 4, problemSolvingLevel: 3,
    demand: 4, growth: 4, remote: 4, intl: 3, worklife: 3,
    salary: "$280–$650/mo entry · $1,100+/mo senior (est.)",
    profile: { math: 1, tech: 2, business: 4, creative: 4, people: 4, science: 0, handson: 1 },
    whatYoullStudy: ["Consumer behavior", "Digital & social media marketing", "Brand strategy", "Market research"],
    coreSubjects: ["Marketing principles", "Consumer psychology", "Statistics", "Communications"],
    skillsRequired: ["Storytelling", "Data-informed creativity", "Comfort with fast trend cycles"],
    suitablePersonality: ["Expressive and observant", "Enjoys following culture and trends"],
    notRecommendedIf: ["You strongly dislike public-facing or client work"],
    handsOn: ["Real campaign projects for local brands", "Social media portfolio building", "Market research reports"],
    internship: "Agency and in-house brand internships are widely available in Phnom Penh.",
    careerPaths: ["Digital Marketer", "Brand Manager", "Market Researcher", "Social Media Strategist", "PR Officer"],
    industries: ["Advertising agencies", "FMCG brands", "E-commerce", "NGOs (communications roles)"],
    intlOpportunities: "Moderate — remote digital marketing work is increasingly accessible.",
    futureDemand: "Growing fast alongside Cambodia's e-commerce and digital ad spend.",
    pros: ["Highly creative outlet", "Fast-moving, varied work", "Portfolio-based hiring (less GPA-dependent)"],
    cons: ["Results-driven pressure", "Trends and tools shift constantly"],
    relatedMajors: ["ba", "design"],
    universities: ["aupp", "num", "paragon"],
    faqs: [
      { q: "Do I need design skills?", a: "Basic visual sense helps, but you can pair with a designer rather than do it all yourself." },
      { q: "Is this oversaturated?", a: "Entry-level is competitive; a strong personal portfolio stands out quickly." },
    ],
    testimonial: { name: "Sokha L.", role: "Social Media Strategist", text: "My final-year campaign project is basically my portfolio piece now — it got me hired." },
  },
  {
    id: "civil", name: "Civil Engineering", categoryId: "engineering",
    shortDesc: "Designing and building the infrastructure Cambodia runs on.",
    overview: "Civil Engineering covers roads, bridges, buildings, and water systems — heavy on math and physics, with real, visible results.",
    difficulty: 5, mathLevel: 5, duration: "5 yrs", tuition: "$800–$2,200/yr (est.)",
    englishReq: "IELTS 5.0–5.5 or equivalent", programmingRequired: false,
    communicationLevel: 2, creativityLevel: 2, problemSolvingLevel: 4,
    demand: 4, growth: 4, remote: 1, intl: 3, worklife: 2,
    salary: "$300–$700/mo entry · $1,200+/mo senior (est.)",
    profile: { math: 5, tech: 3, business: 1, creative: 2, people: 1, science: 3, handson: 5 },
    whatYoullStudy: ["Structural analysis", "Construction materials", "Surveying", "Water & environmental systems"],
    coreSubjects: ["Statics & mechanics", "Structural design", "Geotechnical engineering", "Construction management"],
    skillsRequired: ["Strong physics/math base", "Spatial reasoning", "Site-work stamina"],
    suitablePersonality: ["Hands-on and methodical", "Comfortable on active construction sites"],
    notRecommendedIf: ["You want a desk-only, low-fieldwork career", "You dislike heavy math/physics"],
    handsOn: ["Surveying fieldwork", "A structural design project", "Site-visit reports"],
    internship: "Construction-site internships with contractors are a standard, required component.",
    careerPaths: ["Structural Engineer", "Site Engineer", "Construction Manager", "Urban Planner"],
    industries: ["Construction & real estate", "Government infrastructure", "Engineering consultancies"],
    intlOpportunities: "Moderate — regional construction booms create cross-border project work.",
    futureDemand: "Strong, tied directly to Cambodia's ongoing infrastructure growth.",
    pros: ["Visible, tangible results", "Steady infrastructure-driven demand"],
    cons: ["Physically demanding fieldwork", "Long/irregular hours during builds"],
    relatedMajors: ["architecture", "electrical"],
    universities: ["itc", "ubb"],
    faqs: [
      { q: "How much fieldwork is involved?", a: "Expect regular site visits from year 2 onward, not just classroom work." },
      { q: "Is licensing required?", a: "Professional licensing/registration is typically needed to sign off on major projects." },
    ],
    testimonial: { name: "Rithy V.", role: "Site Engineer", text: "Seeing a bridge you helped design actually get used by your own city is hard to beat." },
  },
  {
    id: "architecture", name: "Architecture", categoryId: "engineering",
    shortDesc: "Designing buildings and spaces that are both functional and beautiful.",
    overview: "Architecture sits between engineering and art — you'll design structures that must work technically and feel right to the people using them.",
    difficulty: 4, mathLevel: 3, duration: "5 yrs", tuition: "$900–$2,400/yr (est.)",
    englishReq: "IELTS 5.0–5.5 or equivalent", programmingRequired: false,
    communicationLevel: 3, creativityLevel: 5, problemSolvingLevel: 4,
    demand: 3, growth: 3, remote: 2, intl: 3, worklife: 2,
    salary: "$300–$750/mo entry · $1,300+/mo senior (est.)",
    profile: { math: 3, tech: 2, business: 1, creative: 5, people: 2, science: 1, handson: 4 },
    whatYoullStudy: ["Architectural design studio", "Building technology", "Urban design theory", "CAD & 3D modeling"],
    coreSubjects: ["Design studio", "Structures", "History of architecture", "Building services"],
    skillsRequired: ["Visual/spatial creativity", "Technical drafting", "Ability to take design critique"],
    suitablePersonality: ["Enjoys both art and structure", "Resilient to repeated critique"],
    notRecommendedIf: ["You want fast, low-effort project turnaround"],
    handsOn: ["Studio design juries every semester", "A full building-design thesis project", "Model-making"],
    internship: "Studio internships with architecture firms typically happen in the final two years.",
    careerPaths: ["Architect", "Interior Designer", "Urban Designer", "Construction Project Manager"],
    industries: ["Architecture firms", "Real estate developers", "Government urban planning"],
    intlOpportunities: "Moderate — a strong design portfolio opens regional studio opportunities.",
    futureDemand: "Steady, tied to Cambodia's urban development and tourism-driven building.",
    pros: ["Deeply creative, visible legacy work", "Strong portfolio culture"],
    cons: ["Long studio hours", "Slow early-career salary growth"],
    relatedMajors: ["civil", "design"],
    universities: ["itc", "rupp"],
    faqs: [
      { q: "Do I need to be 'artistic' already?", a: "A design sensibility helps, but studio training builds most of the skill from scratch." },
      { q: "How intense is studio culture?", a: "Late nights before juries are common — it's one of the more demanding creative majors." },
    ],
    testimonial: { name: "Nary O.", role: "Junior Architect", text: "Studio crits were brutal at first. By year 3 I actually looked forward to the feedback." },
  },
  {
    id: "medicine", name: "Medicine", categoryId: "health",
    shortDesc: "Training to diagnose, treat, and prevent illness as a physician.",
    overview: "Medicine is the longest and most demanding path on this platform — rigorous science, clinical training, and direct responsibility for patient care.",
    difficulty: 5, mathLevel: 3, duration: "6–7 yrs", tuition: "$2,500–$6,000/yr (est.)",
    englishReq: "IELTS 6.0+ recommended (technical terminology)", programmingRequired: false,
    communicationLevel: 4, creativityLevel: 1, problemSolvingLevel: 5,
    demand: 5, growth: 3, remote: 1, intl: 3, worklife: 1,
    salary: "Variable by specialization; typically higher than average post-residency (est.)",
    profile: { math: 3, tech: 1, business: 1, creative: 1, people: 4, science: 5, handson: 3 },
    whatYoullStudy: ["Human anatomy & physiology", "Pharmacology", "Clinical diagnosis", "Public health"],
    coreSubjects: ["Biology & biochemistry", "Anatomy", "Pathology", "Clinical rotations"],
    skillsRequired: ["High-volume memorization", "Composure under pressure", "Empathy with rigor"],
    suitablePersonality: ["Resilient and detail-driven", "Genuinely motivated by patient care, not just prestige"],
    notRecommendedIf: ["You need a shorter path to working income", "You're pursuing it mainly for family expectation over interest"],
    handsOn: ["Hospital clinical rotations", "Lab and cadaver-based anatomy work", "Supervised patient care"],
    internship: "Clinical rotations across hospital departments form the core of the final years.",
    careerPaths: ["General Physician", "Medical Researcher", "Public Health Officer", "Specialist (with further training)"],
    industries: ["Public hospitals", "Private clinics", "Public health NGOs"],
    intlOpportunities: "Possible with further certification exams abroad, though the path is long.",
    futureDemand: "Consistently high — Cambodia continues to need more trained physicians.",
    pros: ["Deeply meaningful, high-trust work", "Strong long-term job security"],
    cons: ["Very long, expensive training path", "High emotional and physical demands"],
    relatedMajors: ["nursing"],
    universities: ["up"],
    faqs: [
      { q: "Is the entrance exam competitive?", a: "Yes — medical programs are among the most competitive admissions in Cambodia." },
      { q: "Can I switch out if it's too intense?", a: "Some students transfer into Nursing or Public Health; talk to an academic advisor early if unsure." },
    ],
    testimonial: { name: "Dr. Sophal M.", role: "Resident physician", text: "It's the hardest thing I've done, and also the first time work has felt unquestionably worthwhile." },
  },
  {
    id: "nursing", name: "Nursing", categoryId: "health",
    shortDesc: "Direct, hands-on patient care and support across the healthcare system.",
    overview: "Nursing combines clinical skill with day-to-day patient care — a shorter path into healthcare than Medicine, with strong, steady demand.",
    difficulty: 3, mathLevel: 2, duration: "4 yrs", tuition: "$1,200–$3,000/yr (est.)",
    englishReq: "IELTS 5.0–5.5 or equivalent", programmingRequired: false,
    communicationLevel: 4, creativityLevel: 1, problemSolvingLevel: 3,
    demand: 5, growth: 4, remote: 1, intl: 4, worklife: 2,
    salary: "$250–$500/mo entry · $700+/mo senior (est.)",
    profile: { math: 2, tech: 1, business: 1, creative: 1, people: 5, science: 4, handson: 4 },
    whatYoullStudy: ["Patient care fundamentals", "Pharmacology basics", "Anatomy & physiology", "Community health"],
    coreSubjects: ["Nursing fundamentals", "Anatomy", "Pharmacology", "Clinical practicum"],
    skillsRequired: ["Compassion under pressure", "Physical stamina", "Careful procedural accuracy"],
    suitablePersonality: ["Caring and calm in emergencies", "Comfortable with shift work"],
    notRecommendedIf: ["You're uncomfortable with bodily/medical procedures"],
    handsOn: ["Supervised hospital placements", "Simulation-lab practice", "Community health outreach"],
    internship: "Hospital ward placements begin as early as year 2.",
    careerPaths: ["Registered Nurse", "Community Health Nurse", "ICU Nurse", "Nurse Educator"],
    industries: ["Hospitals", "Clinics", "Public health programs", "International health NGOs"],
    intlOpportunities: "High — nursing qualifications are in demand across the region and beyond.",
    futureDemand: "Very strong and stable, one of the most secure health-sector paths.",
    pros: ["Shorter path than Medicine into healthcare", "Strong international mobility", "Direct, meaningful patient impact"],
    cons: ["Physically demanding shift work", "Emotionally heavy at times"],
    relatedMajors: ["medicine"],
    universities: ["up"],
    faqs: [
      { q: "Is this less respected than Medicine?", a: "No — it's a distinct profession with its own licensing and critical role in care." },
      { q: "Can nurses study abroad afterward?", a: "Yes, nursing is one of the more portable Cambodian qualifications internationally." },
    ],
    testimonial: { name: "Chenda Y.", role: "ICU Nurse", text: "Night shifts are brutal, but I've never once questioned whether the work matters." },
  },
  {
    id: "law", name: "Law", categoryId: "law",
    shortDesc: "Understanding and applying the rules that govern society and business.",
    overview: "Law trains rigorous argument, reading, and reasoning — a path into legal practice, policy, corporate advisory, or the judiciary.",
    difficulty: 4, mathLevel: 1, duration: "4 yrs", tuition: "$700–$2,000/yr (est.)",
    englishReq: "IELTS 5.5+ recommended (dense reading)", programmingRequired: false,
    communicationLevel: 5, creativityLevel: 2, problemSolvingLevel: 4,
    demand: 3, growth: 3, remote: 1, intl: 3, worklife: 2,
    salary: "$300–$700/mo entry · $1,500+/mo senior (est.)",
    profile: { math: 1, tech: 1, business: 3, creative: 2, people: 4, science: 0, handson: 0 },
    whatYoullStudy: ["Constitutional & civil law", "Criminal law", "Contract & business law", "Legal writing & argument"],
    coreSubjects: ["Civil law", "Criminal law", "International law", "Legal research methods"],
    skillsRequired: ["Dense reading endurance", "Precise written argument", "Comfortable public speaking"],
    suitablePersonality: ["Analytical and persuasive", "Comfortable with formal, rule-bound settings"],
    notRecommendedIf: ["You dislike heavy reading/writing workloads"],
    handsOn: ["Moot court competitions", "Legal clinic casework", "Contract drafting exercises"],
    internship: "Clerkships at law firms or courts are a common final-year step.",
    careerPaths: ["Lawyer", "Legal Advisor", "Corporate Counsel", "Legal Researcher", "Judge (with further training)"],
    industries: ["Law firms", "Corporations", "Government & courts", "NGOs (rights/advocacy work)"],
    intlOpportunities: "Moderate — strongest in corporate/international law tracks.",
    futureDemand: "Steady, with rising demand in corporate and business law as investment grows.",
    pros: ["Strong argument & analysis skills transfer broadly", "Respected, stable profession"],
    cons: ["Long path to bar qualification", "Heavy reading workload throughout"],
    relatedMajors: ["ir"],
    universities: ["rule", "rupp"],
    faqs: [
      { q: "Do I need to pass a bar exam after graduating?", a: "Yes, practicing lawyers must complete bar training and licensing after the degree." },
      { q: "Is corporate law more lucrative than public-sector law?", a: "Generally yes, though public and NGO law offers different, often mission-driven rewards." },
    ],
    testimonial: { name: "Sopheak N.", role: "Junior Associate, law firm", text: "Moot court was terrifying the first time — now it's the part of law school I miss most." },
  },
  {
    id: "hospitality", name: "Tourism & Hospitality Management", categoryId: "hospitality",
    shortDesc: "Running the hotels, tours, and experiences behind Cambodia's tourism industry.",
    overview: "This major prepares you to manage hotels, tours, and events — a people-first field central to one of Cambodia's largest industries.",
    difficulty: 2, mathLevel: 1, duration: "4 yrs", tuition: "$500–$1,700/yr (est.)",
    englishReq: "IELTS 5.0+ (guest-facing communication)", programmingRequired: false,
    communicationLevel: 5, creativityLevel: 3, problemSolvingLevel: 3,
    demand: 4, growth: 3, remote: 1, intl: 4, worklife: 2,
    salary: "$250–$550/mo entry · $1,000+/mo senior (est.)",
    profile: { math: 1, tech: 1, business: 4, creative: 3, people: 5, science: 0, handson: 2 },
    whatYoullStudy: ["Hotel operations", "Event & tour planning", "Customer service management", "Tourism marketing"],
    coreSubjects: ["Hospitality operations", "Marketing", "Food & beverage management", "Tourism geography"],
    skillsRequired: ["Warm, resilient customer service", "Multitasking under pressure", "Cultural sensitivity"],
    suitablePersonality: ["Outgoing and adaptable", "Enjoys unpredictable, people-facing days"],
    notRecommendedIf: ["You need a strict 9-to-5, low guest-contact routine"],
    handsOn: ["Hotel operations practicum", "Event-planning group projects", "Front-desk & guest-service rotations"],
    internship: "Hands-on hotel or resort internships are typically built into the curriculum.",
    careerPaths: ["Hotel Manager", "Tour Operator", "Event Planner", "Airline Services", "Resort Manager"],
    industries: ["Hotels & resorts", "Tour operators", "Airlines", "Event agencies"],
    intlOpportunities: "High — hospitality skills transfer directly to jobs across the region.",
    futureDemand: "Recovering and growing alongside Cambodia's tourism sector.",
    pros: ["People-centered, varied daily work", "Clear route to management roles", "Strong regional job mobility"],
    cons: ["Weekend/holiday shifts are common", "Entry pay can be modest outside peak properties"],
    relatedMajors: ["ba", "marketing"],
    universities: ["num", "paragon", "ubb"],
    faqs: [
      { q: "Do I need to speak multiple languages?", a: "Not required, but a second/third language is a strong advantage in guest-facing roles." },
      { q: "Is this only about hotels?", a: "No — it also covers events, airlines, and tour operations." },
    ],
    testimonial: { name: "Maly K.", role: "Front Office Supervisor", text: "No two days are the same — that's exactly why I stuck with it." },
  },
  {
    id: "agriculture", name: "Agricultural Science", categoryId: "agriculture",
    shortDesc: "Modernizing farming, food systems, and land management.",
    overview: "Agricultural Science applies biology and technology to farming, food safety, and agribusiness — vital to Cambodia's largest employment sector.",
    difficulty: 3, mathLevel: 2, duration: "4 yrs", tuition: "$400–$1,300/yr (est.)",
    englishReq: "IELTS 5.0 or equivalent", programmingRequired: false,
    communicationLevel: 2, creativityLevel: 2, problemSolvingLevel: 4,
    demand: 3, growth: 3, remote: 1, intl: 2, worklife: 3,
    salary: "$220–$450/mo entry · $800+/mo senior (est.)",
    profile: { math: 2, tech: 2, business: 2, creative: 1, people: 2, science: 5, handson: 5 },
    whatYoullStudy: ["Crop & soil science", "Agricultural economics", "Food safety", "Sustainable farming techniques"],
    coreSubjects: ["Plant biology", "Soil science", "Agribusiness", "Environmental science"],
    skillsRequired: ["Fieldwork stamina", "Scientific observation", "Practical problem-solving"],
    suitablePersonality: ["Enjoys outdoor, hands-on work", "Interested in sustainability"],
    notRecommendedIf: ["You strongly prefer indoor, office-only work"],
    handsOn: ["Field trials on a demonstration farm", "Soil & crop lab analysis", "Agribusiness planning projects"],
    internship: "Placements with agribusiness companies or agricultural NGOs are common.",
    careerPaths: ["Agricultural Engineer", "Agronomist", "Food Safety Officer", "Agribusiness Manager"],
    industries: ["Agribusiness", "Food processing", "Government agriculture programs", "Development NGOs"],
    intlOpportunities: "Moderate — regional agri-development programs offer some cross-border work.",
    futureDemand: "Growing as Cambodia modernizes farming and food-export standards.",
    pros: ["Directly tied to national food security", "Strong hands-on, applied learning"],
    cons: ["Lower average starting salary than tech/business paths", "Fieldwork in heat and remote areas"],
    relatedMajors: ["ba"],
    universities: ["ubb", "rupp"],
    faqs: [
      { q: "Is this only for people from farming families?", a: "No — it's open to anyone interested in food systems, science, or agribusiness." },
      { q: "Are there office-based roles in this field?", a: "Yes, agribusiness management and policy roles are largely office/field hybrid." },
    ],
    testimonial: { name: "Vanna S.", role: "Agronomist, agribusiness firm", text: "I didn't grow up on a farm, but the science behind why crops succeed or fail hooked me fast." },
  },
  {
    id: "ir", name: "International Relations", categoryId: "social",
    shortDesc: "How countries, organizations, and policies shape the world.",
    overview: "International Relations examines diplomacy, global policy, and development — a strong fit for people drawn to current events and cross-cultural work.",
    difficulty: 3, mathLevel: 1, duration: "4 yrs", tuition: "$700–$2,100/yr (est.)",
    englishReq: "IELTS 5.5+ recommended", programmingRequired: false,
    communicationLevel: 5, creativityLevel: 2, problemSolvingLevel: 3,
    demand: 3, growth: 3, remote: 2, intl: 5, worklife: 3,
    salary: "$300–$650/mo entry · $1,200+/mo senior (est.)",
    profile: { math: 1, tech: 1, business: 3, creative: 2, people: 5, science: 1, handson: 0 },
    whatYoullStudy: ["Diplomacy & foreign policy", "International law basics", "Global development", "Comparative politics"],
    coreSubjects: ["Political science", "International law", "Economics", "Regional studies (ASEAN focus)"],
    skillsRequired: ["Cross-cultural communication", "Analytical writing", "Following global/regional affairs"],
    suitablePersonality: ["Curious about other cultures and policy", "Comfortable with ambiguity and debate"],
    notRecommendedIf: ["You want a narrowly technical, non-people-facing role"],
    handsOn: ["Model ASEAN/UN simulations", "Policy briefing writing", "NGO project work"],
    internship: "Internships with NGOs, embassies, or regional organizations are common.",
    careerPaths: ["Diplomat", "NGO Program Officer", "Policy Analyst", "International Trade Officer"],
    industries: ["Government & diplomacy", "NGOs & development", "International organizations", "Trade & business"],
    intlOpportunities: "Very high — the field is inherently cross-border.",
    futureDemand: "Stable, tied to Cambodia's growing regional and international engagement.",
    pros: ["Genuinely global career options", "Intellectually broad, current-events driven"],
    cons: ["Entry roles can be competitive and modestly paid", "Career paths can require further postgraduate study"],
    relatedMajors: ["law"],
    universities: ["aupp", "rupp"],
    faqs: [
      { q: "Do I need a master's degree eventually?", a: "For diplomatic or senior policy roles, many pursue a master's after some work experience." },
      { q: "Is fluent English essential?", a: "Yes — most coursework and target roles assume strong English proficiency." },
    ],
    testimonial: { name: "Chariya B.", role: "Program Officer, development NGO", text: "Model ASEAN in year 2 is the closest thing to real diplomacy you'll do as a student — and it's addictive." },
  },
  {
    id: "design", name: "Graphic Design", categoryId: "arts",
    shortDesc: "Visual communication — branding, digital design, and creative direction.",
    overview: "Graphic Design trains visual problem-solving — turning ideas into logos, layouts, and digital interfaces people actually understand and enjoy.",
    difficulty: 3, mathLevel: 1, duration: "4 yrs", tuition: "$600–$1,800/yr (est.)",
    englishReq: "IELTS 5.0 or equivalent", programmingRequired: false,
    communicationLevel: 3, creativityLevel: 5, problemSolvingLevel: 3,
    demand: 3, growth: 4, remote: 5, intl: 4, worklife: 3,
    salary: "$250–$600/mo entry · $1,000+/mo senior (est.)",
    profile: { math: 1, tech: 3, business: 2, creative: 5, people: 2, science: 0, handson: 3 },
    whatYoullStudy: ["Typography & layout", "Branding & identity design", "UI/UX fundamentals", "Motion & digital design"],
    coreSubjects: ["Design principles", "Typography", "Digital tools (Adobe/Figma)", "Portfolio studio"],
    skillsRequired: ["Visual judgment", "Software fluency", "Taking client/critique feedback well"],
    suitablePersonality: ["Visually observant", "Enjoys iterating based on feedback"],
    notRecommendedIf: ["You dislike frequent revisions and client feedback loops"],
    handsOn: ["Client-style brand identity projects", "A personal portfolio website", "Motion/UI micro-projects"],
    internship: "Studio or in-house brand-team internships are common in the final year.",
    careerPaths: ["Graphic Designer", "UI/UX Designer", "Brand Identity Designer", "Motion Designer"],
    industries: ["Design agencies", "Tech/product companies", "Marketing teams", "Freelance/remote clients"],
    intlOpportunities: "High — remote freelance and product-design work is very portfolio-driven.",
    futureDemand: "Growing, especially in digital/UI design as local tech products mature.",
    pros: ["Highly portable, portfolio-based hiring", "Strong remote/freelance potential"],
    cons: ["Income can be inconsistent early on", "Constant tool and trend changes"],
    relatedMajors: ["marketing", "architecture"],
    universities: ["rupp", "paragon"],
    faqs: [
      { q: "Do I need to already draw well?", a: "Digital design leans more on layout/software skill than freehand drawing ability." },
      { q: "Is freelancing realistic right after graduating?", a: "Some start freelancing during school; a strong portfolio matters more than years of experience." },
    ],
    testimonial: { name: "Leakhena F.", role: "UI/UX Designer", text: "My thesis portfolio piece is still the first thing I show in interviews, two years later." },
  },
  {
    id: "education", name: "Education / Teaching", categoryId: "education",
    shortDesc: "Training to teach, and to shape how the next generation learns.",
    overview: "Education prepares you to teach at primary, secondary, or specialized levels — a direct, cumulative way to shape Cambodia's next generation.",
    difficulty: 2, mathLevel: 2, duration: "4 yrs", tuition: "$400–$1,200/yr (est.)",
    englishReq: "IELTS 5.0 or equivalent (higher for English-teaching tracks)", programmingRequired: false,
    communicationLevel: 5, creativityLevel: 3, problemSolvingLevel: 3,
    demand: 4, growth: 3, remote: 1, intl: 2, worklife: 3,
    salary: "$200–$450/mo entry, government scale · higher in private schools (est.)",
    profile: { math: 2, tech: 1, business: 1, creative: 3, people: 5, science: 1, handson: 1 },
    whatYoullStudy: ["Pedagogy & curriculum design", "Child & adolescent development", "Classroom management", "Subject specialization"],
    coreSubjects: ["Educational psychology", "Curriculum design", "Teaching methods", "Subject-area coursework"],
    skillsRequired: ["Patience", "Clear explanation skills", "Classroom management"],
    suitablePersonality: ["Naturally patient and encouraging", "Enjoys watching others grow"],
    notRecommendedIf: ["You need a high-paced, low-repetition daily routine"],
    handsOn: ["Supervised classroom teaching practice", "Lesson-plan design", "A student-teaching placement"],
    internship: "A full-semester supervised teaching placement is a standard graduation requirement.",
    careerPaths: ["Classroom Teacher", "Curriculum Developer", "School Counselor", "Education NGO Officer"],
    industries: ["Public schools", "Private/international schools", "Education NGOs"],
    intlOpportunities: "Moderate — English-teaching tracks open some regional and international options.",
    futureDemand: "Steady, foundational demand across the public and growing private-school sector.",
    pros: ["Directly meaningful, cumulative impact", "Stable structured career path"],
    cons: ["Government-scale pay can be modest", "Emotionally demanding some days"],
    relatedMajors: ["ir"],
    universities: ["rupp", "ubb"],
    faqs: [
      { q: "Is private-school pay much higher?", a: "Often yes, especially for English-medium and international schools." },
      { q: "Can I specialize in a subject like Math or English?", a: "Yes — most programs let you pick a subject specialization track." },
    ],
    testimonial: { name: "Sreyneang H.", role: "Secondary school teacher", text: "The first time a student who was struggling finally got it — that's the moment that made the degree worth it." },
  },
];
function getMajor(id) { return MAJORS.find((m) => m.id === id); }

/* ---------------- Universities ---------------- */
const UNIVERSITIES = [
  {
    id: "rupp", name: "Royal University of Phnom Penh", shortName: "RUPP", type: "Public", city: "Phnom Penh",
    founded: "One of Cambodia's oldest public universities, tracing its roots to the 1960s.",
    accreditation: "Nationally accredited (Ministry of Education, Youth and Sport).",
    about: "Cambodia's largest and most comprehensive public university, spanning sciences, social sciences, and the arts.",
    tuitionRange: "$200–$900/yr (public, est.)", englishReq: "IELTS 5.0+ for most faculties",
    dormitory: "Limited on-campus dormitory space", 
    facilities: ["Central library", "Science labs", "Sports fields", "Student union hall"],
    clubs: ["Debate club", "IT & robotics club", "Volunteer network", "Arts society"],
    exchange: "Partnerships with several regional and international universities.",
    scholarships: ["Royal Government merit scholarship", "Faculty-specific need-based aid"],
    highlight: "Broadest range of majors of any single campus",
  },
  {
    id: "itc", name: "Institute of Technology of Cambodia", shortName: "ITC", type: "Public", city: "Phnom Penh",
    founded: "A long-established public institute focused on engineering and applied science.",
    accreditation: "Nationally accredited; strong international technical partnerships.",
    about: "Cambodia's leading public institute for engineering, computer science, and applied technology.",
    tuitionRange: "$250–$1,000/yr (public, est.)", englishReq: "IELTS 5.0–5.5+ depending on program",
    dormitory: "On-campus dormitories available",
    facilities: ["Engineering labs", "Computer labs", "Workshop facilities", "Library"],
    clubs: ["Robotics club", "Coding club", "Engineers Without Borders chapter"],
    exchange: "Technical exchange partnerships with several international engineering schools.",
    scholarships: ["Government engineering scholarship track", "Partner-institution exchange grants"],
    highlight: "Cambodia's top public choice for engineering and CS",
  },
  {
    id: "num", name: "National University of Management", shortName: "NUM", type: "Public", city: "Phnom Penh",
    founded: "A public university focused on business, management, and public administration.",
    accreditation: "Nationally accredited.",
    about: "Specializes in business, management information systems, tourism, and law — Cambodia's main public option for management studies.",
    tuitionRange: "$250–$900/yr (public, est.)", englishReq: "IELTS 5.0+",
    dormitory: "No on-campus dormitory",
    facilities: ["Business simulation labs", "Library", "Computer center"],
    clubs: ["Entrepreneurship club", "Toastmasters-style speaking club", "Tourism society"],
    exchange: "Select exchange agreements with regional business schools.",
    scholarships: ["Merit-based tuition waivers", "Provincial-student support grants"],
    highlight: "Deepest public bench of business & MIS programs",
  },
  {
    id: "rule", name: "Royal University of Law and Economics", shortName: "RULE", type: "Public", city: "Phnom Penh",
    founded: "A specialist public university for law and economics.",
    accreditation: "Nationally accredited; recognized law faculty.",
    about: "Cambodia's leading public institution focused specifically on legal and economic studies.",
    tuitionRange: "$250–$850/yr (public, est.)", englishReq: "IELTS 5.0–5.5+",
    dormitory: "No on-campus dormitory",
    facilities: ["Moot court room", "Law library", "Legal clinic space"],
    clubs: ["Moot court society", "Legal aid volunteer group"],
    exchange: "Partnerships with regional law faculties.",
    scholarships: ["Government law-track scholarship", "Legal clinic stipends"],
    highlight: "Cambodia's top public choice for Law",
  },
  {
    id: "ubb", name: "University of Battambang", shortName: "UBB", type: "Public", city: "Battambang",
    founded: "A public regional university serving north-western Cambodia.",
    accreditation: "Nationally accredited.",
    about: "A comprehensive public university outside the capital, strong in agriculture, education, and business.",
    tuitionRange: "$180–$700/yr (public, est.)", englishReq: "IELTS 4.5–5.0+",
    dormitory: "On-campus dormitories available",
    facilities: ["Agricultural demonstration farm", "Library", "Teaching labs"],
    clubs: ["Agri-innovation club", "Community teaching volunteers"],
    exchange: "Limited; growing regional partnerships.",
    scholarships: ["Provincial-student scholarship", "Agriculture faculty grants"],
    highlight: "Best option for studying outside Phnom Penh",
  },
  {
    id: "aupp", name: "American University of Phnom Penh", shortName: "AUPP", type: "Private", city: "Phnom Penh",
    founded: "A newer private university built on an American-style liberal-arts curriculum.",
    accreditation: "Nationally accredited; US-curriculum partnerships.",
    about: "English-medium, American-style education across business, IT, and international affairs.",
    tuitionRange: "$1,800–$4,500/yr (private, est.)", englishReq: "IELTS 5.5–6.0+",
    dormitory: "Off-campus housing assistance",
    facilities: ["Modern computer labs", "Library", "Student center"],
    clubs: ["Model UN", "Entrepreneurship society", "Debate team"],
    exchange: "US and regional partner-university exchange options.",
    scholarships: ["Presidential merit scholarship", "Need-based financial aid"],
    highlight: "Most American-style liberal-arts experience",
  },
  {
    id: "paragon", name: "Paragon International University", shortName: "Paragon", type: "Private", city: "Phnom Penh",
    founded: "A newer private university with a modern campus and English-medium instruction.",
    accreditation: "Nationally accredited.",
    about: "A modern private university spanning business, health sciences, engineering, and design.",
    tuitionRange: "$1,500–$4,000/yr (private, est.)", englishReq: "IELTS 5.5+",
    dormitory: "On-campus dormitory available",
    facilities: ["Modern labs", "Design studio", "Library", "Sports facilities"],
    clubs: ["Design collective", "Business case-competition team"],
    exchange: "Regional exchange partnerships.",
    scholarships: ["Entrance-exam merit scholarship", "Sibling/alumni discounts"],
    highlight: "Modern campus with a broad private-university mix",
  },
  {
    id: "up", name: "University of Puthisastra", shortName: "UP", type: "Private", city: "Phnom Penh",
    founded: "A private university best known for health sciences education.",
    accreditation: "Nationally accredited; health-program specific recognitions.",
    about: "Cambodia's leading private option for Medicine, Nursing, and allied health sciences, alongside business and IT.",
    tuitionRange: "$2,000–$6,500/yr (private, varies sharply by program, est.)", englishReq: "IELTS 5.5–6.0+",
    dormitory: "Off-campus housing assistance",
    facilities: ["Clinical simulation labs", "Teaching hospital partnerships", "Library"],
    clubs: ["Medical students' association", "Public health outreach club"],
    exchange: "Clinical/academic partnerships with international health programs.",
    scholarships: ["Health-sciences merit scholarship", "Need-based tuition support"],
    highlight: "Cambodia's top private choice for Medicine & Nursing",
  },
  {
    id: "camed", name: "CamEd Business School", shortName: "CamEd", type: "Private", city: "Phnom Penh",
    founded: "A private school specializing in accounting and professional business qualifications.",
    accreditation: "Nationally accredited; recognized ACCA/CAT tuition provider.",
    about: "Focused specifically on accounting, finance, and professional certifications like ACCA.",
    tuitionRange: "$1,200–$3,200/yr (private, est.)", englishReq: "IELTS 5.0–5.5+",
    dormitory: "No on-campus dormitory",
    facilities: ["Accounting labs", "Library", "Professional-exam prep center"],
    clubs: ["ACCA study group", "Finance case-competition team"],
    exchange: "Professional-body partnerships (ACCA/CAT) rather than academic exchange.",
    scholarships: ["Accounting merit scholarship", "ACCA-track fee support"],
    highlight: "Cambodia's top choice for an ACCA-track accounting degree",
  },
];
function getUniversity(id) { return UNIVERSITIES.find((u) => u.id === id); }
function majorsOfferedAt(uniId) { return MAJORS.filter((m) => m.universities.includes(uniId)); }
function universitiesOffering(majorId) {
  return UNIVERSITIES.filter((u) => u.id && MAJORS.find((m) => m.id === majorId)?.universities.includes(u.id));
}

/* ---------------- Scholarships (illustrative) ---------------- */
const SCHOLARSHIPS = [
  { id: "gov-merit", name: "Royal Government Merit Scholarship", provider: "Government", coverage: "Full tuition at public universities", gpa: "3.0+ / top entrance-exam band", deadline: "Check each university's admissions cycle", tags: ["Government", "Public universities"] },
  { id: "provincial", name: "Provincial Student Support Grant", provider: "Government", coverage: "Tuition + partial dormitory costs", gpa: "2.8+", deadline: "Announced with each intake", tags: ["Government", "Rural/provincial students"] },
  { id: "aupp-presidential", name: "Presidential Merit Scholarship", provider: "Private university", coverage: "25%–100% tuition, based on entrance exam", gpa: "3.2+", deadline: "Rolling with admissions", tags: ["Private", "Merit-based"] },
  { id: "acca-track", name: "ACCA-Track Fee Support", provider: "Private university", coverage: "Partial tuition + exam-fee support", gpa: "3.0+", deadline: "Start of each term", tags: ["Private", "Accounting & Finance"] },
  { id: "women-stem", name: "Women in STEM Grant", provider: "NGO-backed", coverage: "Partial tuition for tech/engineering majors", gpa: "2.8+", deadline: "Annual, mid-year", tags: ["International", "STEM"] },
  { id: "health-merit", name: "Health Sciences Merit Award", provider: "Private university", coverage: "10%–50% tuition for Medicine/Nursing", gpa: "3.0+", deadline: "With entrance exam results", tags: ["Private", "Health Sciences"] },
];

/* ---------------- Quiz ---------------- */
const QUIZ_QUESTIONS = [
  { id: "q1", scoring: true, question: "Which school subject do you enjoy most?", options: [
    { label: "Math & Physics", weights: { math: 3, tech: 1, science: 1 } },
    { label: "Biology & Chemistry", weights: { science: 3, people: 1 } },
    { label: "Literature & History", weights: { people: 2, creative: 1, business: 1 } },
    { label: "Business & Economics", weights: { business: 3, people: 1 } },
    { label: "Art & Design", weights: { creative: 3 } },
    { label: "Computer / IT class", weights: { tech: 3, math: 1 } },
  ]},
  { id: "q2", scoring: true, question: "How do you like spending free time?", options: [
    { label: "Building or fixing things", weights: { handson: 3, tech: 1 } },
    { label: "Reading and writing", weights: { creative: 1, people: 1, business: 1 } },
    { label: "Organizing events with friends", weights: { people: 3, business: 1 } },
    { label: "Sketching, filming, or making things", weights: { creative: 3 } },
    { label: "Coding, gaming, or tech tinkering", weights: { tech: 3 } },
    { label: "Volunteering or helping people", weights: { people: 3, science: 1 } },
  ]},
  { id: "q3", scoring: true, question: "Your friends would describe you as...", options: [
    { label: "Analytical and logical", weights: { math: 2, tech: 2 } },
    { label: "Caring and empathetic", weights: { people: 3 } },
    { label: "Persuasive and confident", weights: { business: 2, people: 1 } },
    { label: "Creative and expressive", weights: { creative: 3 } },
    { label: "Organized and detail-oriented", weights: { business: 1, science: 1, handson: 1 } },
    { label: "Curious and experimental", weights: { science: 2, tech: 1 } },
  ]},
  { id: "q4", scoring: true, question: "Your ideal daily work environment is...", options: [
    { label: "An office, working with a team", weights: { business: 2, people: 1 } },
    { label: "A lab, clinic, or hospital", weights: { science: 3 } },
    { label: "Outdoors or on a job site", weights: { handson: 3 } },
    { label: "A creative studio", weights: { creative: 3 } },
    { label: "Flexible / remote", weights: { tech: 2, creative: 1 } },
    { label: "A classroom", weights: { people: 2, creative: 1 } },
  ]},
  { id: "q5", scoring: true, question: "How do you feel about leading others?", options: [
    { label: "I love leading a team", weights: { business: 2, people: 2 } },
    { label: "I prefer to support, not lead", weights: { handson: 1, science: 1 } },
    { label: "Depends on the situation", weights: { people: 1, business: 1 } },
    { label: "I'd rather work solo", weights: { tech: 2, math: 1 } },
  ]},
  { id: "q6", scoring: true, question: "How important is creativity in your ideal job?", options: [
    { label: "Essential — I need to make things", weights: { creative: 3 } },
    { label: "Nice to have", weights: { creative: 1, business: 1 } },
    { label: "Not important — I prefer structure and precision", weights: { math: 1, science: 1, business: 1 } },
  ]},
  { id: "q7", scoring: true, question: "Facing a hard problem, you usually...", options: [
    { label: "Break it into logical steps", weights: { math: 2, tech: 2 } },
    { label: "Talk it through with others", weights: { people: 2 } },
    { label: "Try a few creative approaches", weights: { creative: 2, tech: 1 } },
    { label: "Research thoroughly before acting", weights: { science: 2, business: 1 } },
  ]},
  { id: "q8", scoring: true, question: "What matters most in your future career?", options: [
    { label: "High salary and stability", weights: { tech: 1, business: 2 } },
    { label: "Creative fulfillment", weights: { creative: 2 } },
    { label: "Helping or serving people directly", weights: { people: 2, science: 1 } },
    { label: "Building or launching things", weights: { business: 2, handson: 1 } },
    { label: "Innovation and new technology", weights: { tech: 2, science: 1 } },
  ]},
  { id: "q9", scoring: false, question: "Your English proficiency is closer to...", options: [
    { label: "Just starting out", tip: "Many strong majors need IELTS 5.0+ — consider an English foundation year alongside your first choice." },
    { label: "Conversational", tip: "You meet the minimum bar for most programs; keep building academic/technical vocabulary." },
    { label: "Advanced / fluent", tip: "You're well positioned for English-heavy majors like Law, IR, or Medicine." },
  ]},
  { id: "q10", scoring: false, question: "Your budget situation is closer to...", options: [
    { label: "I need a low-cost public option or scholarship", tip: "Filter the directory to Public universities and check the Scholarships page first." },
    { label: "Mid-range, some flexibility", tip: "A mix of public universities and mid-tier private options should fit your range." },
    { label: "Flexible — private is fine", tip: "You can weigh universities on fit and reputation rather than cost alone." },
  ]},
];

function computeQuizResults(answers) {
  const dims = ["math", "tech", "business", "creative", "people", "science", "handson"];
  const userVec = Object.fromEntries(dims.map((d) => [d, 0]));
  QUIZ_QUESTIONS.filter((q) => q.scoring).forEach((q) => {
    const idx = answers[q.id];
    if (idx == null) return;
    const opt = q.options[idx];
    if (!opt || !opt.weights) return;
    Object.entries(opt.weights).forEach(([k, v]) => { userVec[k] = (userVec[k] || 0) + v; });
  });
  const userMag = Math.sqrt(dims.reduce((s, d) => s + userVec[d] * userVec[d], 0)) || 1;
  const scored = MAJORS.map((m) => {
    const mv = m.profile;
    const dot = dims.reduce((s, d) => s + userVec[d] * (mv[d] || 0), 0);
    const mMag = Math.sqrt(dims.reduce((s, d) => s + (mv[d] || 0) * (mv[d] || 0), 0)) || 1;
    const cosine = dot / (userMag * mMag);
    const pct = clamp(Math.round(55 + cosine * 43), 40, 98);
    return { major: m, pct };
  }).sort((a, b) => b.pct - a.pct);
  return scored;
}
function quizTips(answers) {
  const tips = [];
  ["q9", "q10"].forEach((id) => {
    const q = QUIZ_QUESTIONS.find((x) => x.id === id);
    const idx = answers[id];
    if (q && idx != null && q.options[idx]?.tip) tips.push(q.options[idx].tip);
  });
  return tips;
}

/* ---------------- Careers (curated, cross-linked to majors) ---------------- */
const CAREERS = [
  { id: "sw-eng", title: "Software Engineer", desc: "Builds and maintains software products and systems.", degree: ["cs", "se"], skills: ["Programming", "Problem-solving", "Teamwork"], salary: "$350–$1,600+/mo (est.)", demand: 5, progression: "Junior Dev → Senior Dev → Tech Lead / Architect" },
  { id: "biz-analyst", title: "Business Analyst", desc: "Bridges business needs and technical or operational solutions.", degree: ["mis", "ba"], skills: ["Communication", "Process mapping", "Basic data analysis"], salary: "$300–$1,000+/mo (est.)", demand: 4, progression: "Analyst → Senior Analyst → Product/Ops Manager" },
  { id: "doctor", title: "Doctor / Physician", desc: "Diagnoses and treats patients across general or specialized care.", degree: ["medicine"], skills: ["Clinical knowledge", "Composure", "Communication"], salary: "Variable, above-average post-residency (est.)", demand: 5, progression: "Resident → General Practitioner → Specialist" },
  { id: "architect", title: "Architect", desc: "Designs buildings and spaces, balancing form and function.", degree: ["architecture"], skills: ["Design", "CAD/3D modeling", "Client communication"], salary: "$300–$1,300+/mo (est.)", demand: 3, progression: "Junior Architect → Project Architect → Principal" },
  { id: "lawyer", title: "Lawyer", desc: "Advises and represents clients on legal matters.", degree: ["law"], skills: ["Legal research", "Argumentation", "Writing"], salary: "$300–$1,500+/mo (est.)", demand: 3, progression: "Associate → Senior Associate → Partner / Counsel" },
  { id: "teacher", title: "Teacher", desc: "Educates students at the primary, secondary, or specialized level.", degree: ["education"], skills: ["Patience", "Classroom management", "Subject mastery"], salary: "$200–$450+/mo, government scale (est.)", demand: 4, progression: "Teacher → Head of Department → School Administrator" },
  { id: "digital-marketer", title: "Digital Marketer", desc: "Plans and runs campaigns across digital and social channels.", degree: ["marketing"], skills: ["Content strategy", "Analytics", "Creativity"], salary: "$280–$1,100+/mo (est.)", demand: 4, progression: "Executive → Strategist → Brand/Marketing Manager" },
  { id: "accountant", title: "Accountant", desc: "Manages financial records, compliance, and reporting.", degree: ["accounting"], skills: ["Precision", "Regulation knowledge", "Spreadsheets"], salary: "$300–$1,300+/mo (est.)", demand: 4, progression: "Junior Accountant → Senior → Finance Manager" },
  { id: "civil-eng", title: "Civil Engineer", desc: "Designs and oversees infrastructure and construction projects.", degree: ["civil"], skills: ["Structural design", "Site management", "Math/physics"], salary: "$300–$1,200+/mo (est.)", demand: 4, progression: "Site Engineer → Project Engineer → Construction Manager" },
  { id: "hotel-manager", title: "Hotel Manager", desc: "Runs the operations and guest experience of a hotel or resort.", degree: ["hospitality"], skills: ["Service leadership", "Multitasking", "People management"], salary: "$250–$1,000+/mo (est.)", demand: 4, progression: "Supervisor → Department Head → General Manager" },
  { id: "nurse", title: "Registered Nurse", desc: "Provides direct patient care across clinical settings.", degree: ["nursing"], skills: ["Clinical care", "Compassion", "Stamina"], salary: "$250–$700+/mo (est.)", demand: 5, progression: "RN → Charge Nurse → Nurse Educator/Manager" },
  { id: "designer", title: "Graphic / UI Designer", desc: "Creates visual and digital experiences for brands and products.", degree: ["design"], skills: ["Visual design", "Software fluency", "Feedback iteration"], salary: "$250–$1,000+/mo (est.)", demand: 3, progression: "Junior Designer → Senior Designer → Creative/Design Lead" },
];
function getCareer(id) { return CAREERS.find((c) => c.id === id); }

/* ================================================================
   Shared UI atoms
   ================================================================ */
const ICONS = {
  Search, Heart, Moon, Sun, ChevronRight, ChevronLeft, ChevronDown, X, Menu,
  GraduationCap, Briefcase, Code, TrendingUp, MapPin, DollarSign, Award, Users,
  BookOpen, Target, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Building2,
  Globe, MessageCircle, Send, Bookmark, Filter, Star, Palette, Stethoscope,
  Scale, Wheat, Landmark, UtensilsCrossed, Cpu, Clock, Calendar, ExternalLink,
  Loader2, Home, SlidersHorizontal, Percent, Flag, School, HardHat, Leaf,
  Gavel, PenTool, Compass, Route, Milestone, ThumbsUp, Quote, PlayCircle,
  FileText, Plus, Minus, AlertCircle, Info, Mail, Phone, Bot, Sparkle,
  Waypoints, Signpost, BarChart3, ClipboardList, UserRound, Building, RotateCcw,
};
function Icon({ name, ...props }) {
  const C = ICONS[name] || Info;
  return <C {...props} />;
}

function Badge({ children, tone = "neutral", t }) {
  const tones = {
    neutral: { bg: t.surfaceAlt, fg: t.muted, bd: t.border },
    saffron: { bg: ACCENT.saffronSoft, fg: ACCENT.saffronDark, bd: ACCENT.saffronSoft },
    mekong: { bg: ACCENT.mekongSoft, fg: ACCENT.mekong, bd: ACCENT.mekongSoft },
    laterite: { bg: ACCENT.lateriteSoft, fg: ACCENT.laterite, bd: ACCENT.lateriteSoft },
    paddy: { bg: ACCENT.paddySoft, fg: ACCENT.paddy, bd: ACCENT.paddySoft },
  };
  const c = tones[tone] || tones.neutral;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: c.bg, color: c.fg, border: `1px solid ${c.bd}` }}
    >
      {children}
    </span>
  );
}

function LevelBar({ value, max = 5, t, color = ACCENT.mekong, label }) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs w-28 shrink-0" style={{ color: t.muted }}>{label}</span>}
      <div className="flex-1 flex items-center gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{ backgroundColor: i < value ? color : t.border }}
          />
        ))}
      </div>
    </div>
  );
}

function IconCircle({ name, tint, tintSoft, size = 44, iconSize = 20 }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl shrink-0"
      style={{ width: size, height: size, backgroundColor: tintSoft, color: tint }}
    >
      <Icon name={name} size={iconSize} strokeWidth={2} />
    </div>
  );
}

function SectionHeading({ eyebrow, title, subtitle, t, align = "left" }) {
  return (
    <div className={cx("mb-6", align === "center" && "text-center")}>
      {eyebrow && (
        <div
          className="text-xs font-semibold tracking-wider uppercase mb-2"
          style={{ color: ACCENT.mekong, fontFamily: FONT_MONO }}
        >
          {eyebrow}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-sm sm:text-base max-w-2xl" style={{ color: t.muted, ...(align === "center" ? { marginLeft: "auto", marginRight: "auto" } : {}) }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", icon, iconRight, className, disabled, type = "button" }) {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3.5 text-base" };
  const base = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: { className: "shadow-sm hover:shadow-md", style: { backgroundColor: ACCENT.saffron, color: "#1A1206" } },
    dark: { className: "hover:opacity-90", style: { backgroundColor: ACCENT.paddy, color: "#fff" } },
    outline: { className: "border hover:opacity-80", style: { borderColor: "currentColor", background: "transparent" } },
    ghost: { className: "hover:opacity-70", style: { background: "transparent" } },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cx(base, sizes[size], v.className, className)} style={v.style}>
      {icon && <Icon name={icon} size={size === "sm" ? 14 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 14 : 16} />}
    </button>
  );
}

function Card({ children, t, className, onClick, style }) {
  return (
    <div
      onClick={onClick}
      className={cx("rounded-2xl border transition-all duration-150", onClick && "cursor-pointer hover:-translate-y-0.5", className)}
      style={{ backgroundColor: t.surface, borderColor: t.border, ...style }}
    >
      {children}
    </div>
  );
}

function EmptyState({ t, icon = "Search", title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      <IconCircle name={icon} tint={t.muted} tintSoft={t.surfaceAlt} size={56} iconSize={24} />
      <h3 className="mt-4 font-semibold" style={{ color: t.text, fontFamily: FONT_DISPLAY }}>{title}</h3>
      {subtitle && <p className="mt-1 text-sm max-w-xs" style={{ color: t.muted }}>{subtitle}</p>}
      {action}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, t }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0"
      style={{ backgroundColor: checked ? ACCENT.paddy : t.border }}
      aria-pressed={checked}
    >
      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" style={{ transform: checked ? "translateX(22px)" : "translateX(4px)" }} />
    </button>
  );
}

/* A small "waypoint" node — the recurring signature motif, used only
   where content is genuinely sequential (Roadmap, Quiz progress). */
function Waypoint({ index, active, done, t, size = 34 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold shrink-0 transition-colors"
      style={{
        width: size, height: size, fontFamily: FONT_MONO, fontSize: size * 0.38,
        backgroundColor: done ? ACCENT.paddy : active ? ACCENT.saffron : t.surfaceAlt,
        color: done ? "#fff" : active ? "#1A1206" : t.muted,
        border: `2px solid ${done ? ACCENT.paddy : active ? ACCENT.saffron : t.border}`,
      }}
    >
      {done ? <Icon name="CheckCircle2" size={size * 0.5} /> : index}
    </div>
  );
}

function StarRow({ value, size = 12 }) {
  return (
    <div className="flex items-center gap-0.5" style={{ color: ACCENT.saffron }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} name="Star" size={size} fill={i < value ? ACCENT.saffron : "none"} />
      ))}
    </div>
  );
}

/* ================================================================
   Navigation, Footer, Global Search
   ================================================================ */
const NAV_ITEMS = [
  { key: "landing", label: "home", icon: "Home" },
  { key: "majors", label: "majors", icon: "Compass" },
  { key: "universities", label: "universities", icon: "Building2" },
  { key: "roadmap", label: "roadmap", icon: "Route" },
  { key: "compare", label: "compare", icon: "BarChart3" },
  { key: "scholarships", label: "scholarships", icon: "Award" },
  { key: "careers", label: "careers", icon: "Briefcase" },
];

function Logo({ t }) {
  const { go } = useApp();
  return (
    <button onClick={() => go("landing")} className="flex items-center gap-2 shrink-0">
      <div className="flex items-center justify-center rounded-xl" style={{ width: 34, height: 34, backgroundColor: ACCENT.paddy }}>
        <Icon name="Compass" size={18} color="#fff" />
      </div>
      <span className="font-bold text-[15px] leading-tight hidden sm:block" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>
        Cambodia Major<br className="hidden" /> Roadmap
      </span>
    </button>
  );
}

function NavBar() {
  const { t, dark, toggleDark, lang, setLang, L, view, go, favorites, searchOpen, setSearchOpen } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b"
        style={{ backgroundColor: t.navBg, borderColor: t.border }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Logo t={t} />
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => go(item.key)}
                className="px-3 py-2 rounded-full text-sm font-medium transition-colors"
                style={{
                  color: view === item.key ? ACCENT.paddy : t.muted,
                  backgroundColor: view === item.key ? ACCENT.paddySoft : "transparent",
                }}
              >
                {L(item.label)}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setSearchOpen(true)} className="p-2 rounded-full hover:opacity-70" style={{ color: t.text }} aria-label="Search">
              <Icon name="Search" size={19} />
            </button>
            <button onClick={() => go("favorites")} className="p-2 rounded-full hover:opacity-70 relative hidden sm:inline-flex" style={{ color: t.text }} aria-label="Saved">
              <Icon name="Heart" size={19} fill={view === "favorites" ? ACCENT.laterite : "none"} color={view === "favorites" ? ACCENT.laterite : t.text} />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ width: 15, height: 15, backgroundColor: ACCENT.laterite, color: "#fff" }}>
                  {favorites.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setLang(lang === "en" ? "km" : "en")}
              className="px-2.5 py-1.5 rounded-full text-xs font-bold hidden sm:inline-flex"
              style={{ color: t.muted, border: `1px solid ${t.border}`, fontFamily: FONT_MONO }}
              title="Language toggle — Khmer labels are a draft, not yet reviewed by a native speaker"
            >
              {lang === "en" ? "EN" : "ខ្មែរ"}
            </button>
            <button onClick={toggleDark} className="p-2 rounded-full hover:opacity-70" style={{ color: t.text }} aria-label="Toggle theme">
              <Icon name={dark ? "Sun" : "Moon"} size={19} />
            </button>
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-full lg:hidden" style={{ color: t.text }} aria-label="Menu">
              <Icon name="Menu" size={21} />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog">
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 max-w-[85%] p-5 flex flex-col gap-1 overflow-y-auto" style={{ backgroundColor: t.surface }}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>Menu</span>
              <button onClick={() => setMobileOpen(false)} style={{ color: t.muted }}><Icon name="X" size={22} /></button>
            </div>
            {NAV_ITEMS.concat([{ key: "favorites", label: "favorites", icon: "Heart" }]).map((item) => (
              <button
                key={item.key}
                onClick={() => { go(item.key); setMobileOpen(false); }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-left font-medium"
                style={{ backgroundColor: view === item.key ? t.surfaceAlt : "transparent", color: view === item.key ? ACCENT.paddy : t.text }}
              >
                <Icon name={item.icon} size={18} /> {L(item.label)}
              </button>
            ))}
            <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: t.border }}>
              <span className="text-sm" style={{ color: t.muted }}>Language (draft)</span>
              <button onClick={() => setLang(lang === "en" ? "km" : "en")} className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ border: `1px solid ${t.border}`, color: t.text }}>
                {lang === "en" ? "EN → ខ្មែរ" : "ខ្មែរ → EN"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function GlobalSearchOverlay() {
  const { t, searchOpen, setSearchOpen, go } = useApp();
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50); else setQ(""); }, [searchOpen]);
  if (!searchOpen) return null;
  const query = q.trim().toLowerCase();
  const majorHits = query ? MAJORS.filter((m) => m.name.toLowerCase().includes(query)).slice(0, 5) : [];
  const uniHits = query ? UNIVERSITIES.filter((u) => u.name.toLowerCase().includes(query) || u.shortName.toLowerCase().includes(query)).slice(0, 5) : [];
  const careerHits = query ? CAREERS.filter((c) => c.title.toLowerCase().includes(query)).slice(0, 5) : [];
  const cityHits = query ? [...new Set(UNIVERSITIES.map((u) => u.city))].filter((c) => c.toLowerCase().includes(query)) : [];
  const noResults = query && !majorHits.length && !uniHits.length && !careerHits.length && !cityHits.length;
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: t.bg }}>
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 pt-6 flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-full px-4 py-3 border" style={{ borderColor: t.borderStrong, backgroundColor: t.surface }}>
            <Icon name="Search" size={18} color={t.muted} />
            <input
              ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search majors, universities, careers, cities..."
              className="flex-1 bg-transparent outline-none text-sm" style={{ color: t.text }}
            />
          </div>
          <button onClick={() => setSearchOpen(false)} className="p-2.5 rounded-full" style={{ color: t.text }}><Icon name="X" size={22} /></button>
        </div>
        <div className="mt-4 flex-1 overflow-y-auto pb-8">
          {!query && <p className="text-sm mt-6" style={{ color: t.muted }}>Try "Computer Science", "RUPP", or "Doctor".</p>}
          {noResults && <EmptyState t={t} icon="Search" title="No matches" subtitle="Try a different spelling or a broader term." />}
          {majorHits.length > 0 && (
            <div className="mb-5">
              <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: t.muted }}>Majors</div>
              {majorHits.map((m) => (
                <button key={m.id} onClick={() => { go("majorDetail", { id: m.id }); setSearchOpen(false); }} className="w-full flex items-center gap-3 py-2.5 text-left">
                  <IconCircle name={getCategory(m.categoryId).icon} tint={getCategory(m.categoryId).tint} tintSoft={getCategory(m.categoryId).tintSoft} size={36} iconSize={16} />
                  <div><div className="text-sm font-semibold" style={{ color: t.text }}>{m.name}</div><div className="text-xs" style={{ color: t.muted }}>{getCategory(m.categoryId).name}</div></div>
                </button>
              ))}
            </div>
          )}
          {uniHits.length > 0 && (
            <div className="mb-5">
              <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: t.muted }}>Universities</div>
              {uniHits.map((u) => (
                <button key={u.id} onClick={() => { go("universityDetail", { id: u.id }); setSearchOpen(false); }} className="w-full flex items-center gap-3 py-2.5 text-left">
                  <IconCircle name="Building2" tint={ACCENT.mekong} tintSoft={ACCENT.mekongSoft} size={36} iconSize={16} />
                  <div><div className="text-sm font-semibold" style={{ color: t.text }}>{u.name}</div><div className="text-xs" style={{ color: t.muted }}>{u.city} · {u.type}</div></div>
                </button>
              ))}
            </div>
          )}
          {careerHits.length > 0 && (
            <div className="mb-5">
              <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: t.muted }}>Careers</div>
              {careerHits.map((c) => (
                <button key={c.id} onClick={() => { go("careers", { highlight: c.id }); setSearchOpen(false); }} className="w-full flex items-center gap-3 py-2.5 text-left">
                  <IconCircle name="Briefcase" tint={ACCENT.saffronDark} tintSoft={ACCENT.saffronSoft} size={36} iconSize={16} />
                  <div className="text-sm font-semibold" style={{ color: t.text }}>{c.title}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const { t, go } = useApp();
  return (
    <footer className="border-t mt-20" style={{ borderColor: t.border, backgroundColor: t.bgAlt }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center rounded-xl" style={{ width: 30, height: 30, backgroundColor: ACCENT.paddy }}>
              <Icon name="Compass" size={16} color="#fff" />
            </div>
            <span className="font-bold text-sm" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>Cambodia Major Roadmap</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: t.muted }}>Choose your future, not just a university. A prototype for evidence-based major and university decisions.</p>
        </div>
        {[
          { title: "Discover", items: [["majors", "Explore Majors"], ["quiz", "Career Quiz"], ["careers", "Career Explorer"]] },
          { title: "Decide", items: [["universities", "Universities"], ["compare", "Compare"], ["roadmap", "Roadmap"]] },
          { title: "Support", items: [["scholarships", "Scholarships"], ["favorites", "Saved items"]] },
        ].map((col) => (
          <div key={col.title}>
            <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: t.text }}>{col.title}</div>
            <div className="flex flex-col gap-2">
              {col.items.map(([key, label]) => (
                <button key={key} onClick={() => go(key)} className="text-xs text-left hover:underline" style={{ color: t.muted }}>{label}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t px-4 sm:px-6 py-4 text-center" style={{ borderColor: t.border }}>
        <p className="text-[11px]" style={{ color: t.muted }}>Prototype build · university and major figures are illustrative sample data, not verified current figures.</p>
      </div>
    </footer>
  );
}

/* ================================================================
   Landing Page
   ================================================================ */
function RouteHero({ t }) {
  const pts = [[20, 150], [110, 150], [150, 40], [230, 40], [270, 130], [380, 60]];
  const d = `M${pts[0][0]},${pts[0][1]} C${pts[1][0]},${pts[1][1]} ${pts[2][0]},${pts[2][1]} ${pts[3][0]},${pts[3][1]} S${pts[4][0]},${pts[4][1]} ${pts[5][0]},${pts[5][1]}`;
  return (
    <svg viewBox="0 0 400 190" className="w-full h-auto route-draw" style={{ maxWidth: 440 }}>
      <path d={d} fill="none" stroke={ACCENT.mekong} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <circle cx={pts[0][0]} cy={pts[0][1]} r="15" fill={ACCENT.paddy} />
      <foreignObject x={pts[0][0] - 10} y={pts[0][1] - 10} width="20" height="20">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20 }}>
          <GraduationCap size={13} color="#fff" />
        </div>
      </foreignObject>
      <circle cx="150" cy="40" r="6" fill={ACCENT.saffron} />
      <circle cx="270" cy="130" r="6" fill={ACCENT.saffron} />
      <circle cx={pts[5][0]} cy={pts[5][1]} r="15" fill={ACCENT.laterite} />
      <foreignObject x={pts[5][0] - 10} y={pts[5][1] - 10} width="20" height="20">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20 }}>
          <Flag size={12} color="#fff" />
        </div>
      </foreignObject>
    </svg>
  );
}

function Hero() {
  const { t, go } = useApp();
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: t.bgAlt }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-16 sm:pt-20 sm:pb-24 grid lg:grid-cols-2 gap-10 items-center">
        <div className="animate-fade-up">
          <Badge tone="mekong" t={t}><Icon name="Sparkles" size={12} /> A step-by-step decision guide</Badge>
          <h1 className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08]" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>
            Choose Your Future,<br />Not Just a University.
          </h1>
          <p className="mt-5 text-base sm:text-lg max-w-lg" style={{ color: t.muted }}>
            Discover the major that matches your interests, personality, and career goals, then find the best university in Cambodia.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Btn size="lg" icon="Compass" onClick={() => go("majors")}>Explore Majors</Btn>
            <Btn size="lg" variant="dark" icon="Sparkle" onClick={() => go("quiz")}>Take Career Quiz</Btn>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <RouteHero t={t} />
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const { t } = useApp();
  const stats = [
    { label: "Universities", value: UNIVERSITIES.length, icon: "Building2" },
    { label: "Majors", value: MAJORS.length, icon: "Compass" },
    { label: "Career Fields", value: CATEGORIES.length, icon: "Briefcase" },
    { label: "Scholarships Listed", value: SCHOLARSHIPS.length, icon: "Award" },
  ];
  return (
    <div className="border-y" style={{ borderColor: t.border, backgroundColor: t.surface }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <IconCircle name={s.icon} tint={ACCENT.paddy} tintSoft={ACCENT.paddySoft} size={40} iconSize={18} />
            <div>
              <div className="text-2xl font-bold leading-none" style={{ fontFamily: FONT_MONO, color: t.text }}>{s.value}+</div>
              <div className="text-xs mt-1" style={{ color: t.muted }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryGrid() {
  const { t, go } = useApp();
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <SectionHeading eyebrow="Start here" title="Explore by field" subtitle="Ten broad fields covering every major on the platform. Pick one to narrow things down, or take the quiz if you're not sure yet." t={t} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {CATEGORIES.map((c) => (
          <Card key={c.id} t={t} onClick={() => go("majors", { category: c.id })} className="p-4 flex flex-col gap-3">
            <IconCircle name={c.icon} tint={c.tint} tintSoft={c.tintSoft} />
            <div>
              <div className="font-semibold text-sm" style={{ color: t.text }}>{c.name}</div>
              <div className="text-xs mt-0.5" style={{ color: t.muted }}>{c.blurb}</div>
            </div>
            <div className="text-xs font-medium" style={{ color: t.muted }}>
              {MAJORS.filter((m) => m.categoryId === c.id).length} majors
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function RoadmapTeaser() {
  const { t, go } = useApp();
  const steps = ROADMAP_STEPS.slice(0, 5);
  return (
    <section className="py-16" style={{ backgroundColor: t.bgAlt }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading eyebrow="The journey" title="One roadmap, ten waypoints" subtitle="From graduation to career, in order. Each step links to the tool that helps with it." t={t} />
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:items-center overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.key}>
              <button onClick={() => go(s.route || "roadmap")} className="flex sm:flex-col items-center gap-3 sm:gap-2 sm:w-28 text-left sm:text-center shrink-0">
                <Waypoint index={i + 1} active={i === 0} done={false} t={t} size={38} />
                <span className="text-xs font-medium" style={{ color: t.text }}>{s.title}</span>
              </button>
              {i < steps.length - 1 && <div className="hidden sm:block flex-1 h-0.5 rounded-full" style={{ backgroundColor: t.border }} />}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-6">
          <Btn variant="outline" size="sm" iconRight="ArrowRight" onClick={() => go("roadmap")}>
            <span style={{ color: t.text }}>See the full roadmap</span>
          </Btn>
        </div>
      </div>
    </section>
  );
}

function TestimonialStrip() {
  const { t, go } = useApp();
  const picks = [MAJORS[0], MAJORS[6], MAJORS[13]];
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <SectionHeading eyebrow="From students" title="What it looks like from the inside" t={t} />
      <div className="grid sm:grid-cols-3 gap-4">
        {picks.map((m) => (
          <Card key={m.id} t={t} className="p-5">
            <Icon name="Quote" size={20} color={ACCENT.saffron} />
            <p className="text-sm mt-3 leading-relaxed" style={{ color: t.text }}>{m.testimonial.text}</p>
            <div className="mt-4 text-xs font-semibold" style={{ color: t.text }}>{m.testimonial.name}</div>
            <div className="text-xs" style={{ color: t.muted }}>{m.testimonial.role} · {m.name}</div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ClosingCTA() {
  const { t, go } = useApp();
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
      <div className="rounded-3xl px-6 sm:px-12 py-12 sm:py-16 text-center relative overflow-hidden" style={{ backgroundColor: ACCENT.paddy }}>
        <h2 className="text-2xl sm:text-3xl font-bold text-white max-w-xl mx-auto" style={{ fontFamily: FONT_DISPLAY }}>
          Not sure where to start? Answer nine quick questions.
        </h2>
        <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.75)" }}>
          Takes about three minutes. You'll get a ranked list of majors that fit you, not just what's popular.
        </p>
        <div className="mt-7">
          <Btn size="lg" icon="Sparkle" onClick={() => go("quiz")}>Take the Career Quiz</Btn>
        </div>
      </div>
    </section>
  );
}

function LandingPage() {
  return (
    <div>
      <Hero />
      <StatsBar />
      <CategoryGrid />
      <RoadmapTeaser />
      <TestimonialStrip />
      <ClosingCTA />
    </div>
  );
}

/* ================================================================
   Roadmap steps (shared by RoadmapTeaser + RoadmapPage)
   ================================================================ */
const ROADMAP_STEPS = [
  { key: "grad-hs", title: "Graduate High School", desc: "The starting point — every path on this platform begins here.", icon: "GraduationCap", route: null },
  { key: "quiz", title: "Career Quiz", desc: "Answer questions about your interests, strengths, and goals to get ranked major matches.", icon: "Sparkle", route: "quiz" },
  { key: "field", title: "Choose Career Field", desc: "Use your quiz results (or gut instinct) to pick a broad field to explore first.", icon: "Compass", route: "majors" },
  { key: "explore", title: "Explore Majors", desc: "Read full major profiles: what you'll study, difficulty, career paths, and salary outlook.", icon: "BookOpen", route: "majors" },
  { key: "compare-majors", title: "Compare Majors", desc: "Shortlist two to four majors and compare them side by side before committing.", icon: "BarChart3", route: "compare" },
  { key: "careers", title: "View Career Opportunities", desc: "Check what jobs each major actually leads to, and what they pay and demand.", icon: "Briefcase", route: "careers" },
  { key: "compare-uni", title: "Compare Universities", desc: "Once your major is set, compare the universities that offer it.", icon: "Building2", route: "compare" },
  { key: "apply", title: "Apply", desc: "Check admission requirements, English levels, and scholarship deadlines.", icon: "Send", route: "universities" },
  { key: "graduate", title: "Graduate", desc: "Finish your degree with a clear sense of why you chose it.", icon: "Award", route: null },
  { key: "career", title: "Career", desc: "Step into the field you actually chose — not the one you fell into.", icon: "TrendingUp", route: "careers" },
];

/* ================================================================
   Career Quiz
   ================================================================ */
function QuizProgress({ step, total, t }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-2" style={{ color: t.muted }}>
        <span style={{ fontFamily: FONT_MONO }}>Question {Math.min(step + 1, total)} of {total}</span>
        <span style={{ fontFamily: FONT_MONO }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: t.border }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: ACCENT.saffron }} />
      </div>
    </div>
  );
}

function QuizPage() {
  const { t, go, setQuizResults: setGlobalQuizResults, setQuizAnswers: setGlobalAnswers } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const total = QUIZ_QUESTIONS.length;
  const q = QUIZ_QUESTIONS[step];

  function choose(idx) {
    const next = { ...answers, [q.id]: idx };
    setAnswers(next);
    setTimeout(() => {
      if (step < total - 1) setStep(step + 1);
      else {
        setDone(true);
        setGlobalQuizResults(computeQuizResults(next));
        setGlobalAnswers(next);
      }
    }, 260);
  }

  if (done) return <QuizResults answers={answers} onRetake={() => { setStep(0); setAnswers({}); setDone(false); }} />;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <button onClick={() => go("landing")} className="flex items-center gap-1.5 text-xs font-medium mb-6" style={{ color: t.muted }}>
        <Icon name="X" size={14} /> Exit quiz
      </button>
      <QuizProgress step={step} total={total} t={t} />
      <h2 className="mt-8 text-2xl font-bold leading-snug" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>{q.question}</h2>
      <div className="mt-6 flex flex-col gap-2.5">
        {q.options.map((opt, idx) => {
          const selected = answers[q.id] === idx;
          return (
            <button
              key={idx}
              onClick={() => choose(idx)}
              className="text-left px-4 py-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3"
              style={{
                borderColor: selected ? ACCENT.saffron : t.border,
                backgroundColor: selected ? ACCENT.saffronSoft : t.surface,
                color: t.text,
              }}
            >
              <span className="text-sm font-medium">{opt.label}</span>
              {selected && <Icon name="CheckCircle2" size={18} color={ACCENT.saffronDark} />}
            </button>
          );
        })}
      </div>
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="mt-6 flex items-center gap-1.5 text-xs font-medium" style={{ color: t.muted }}>
          <Icon name="ChevronLeft" size={14} /> Back
        </button>
      )}
    </div>
  );
}

function QuizResults({ answers, onRetake }) {
  const { t, go, toggleFavorite, isFavorite } = useApp();
  const results = useMemo(() => computeQuizResults(answers), [answers]);
  const tips = useMemo(() => quizTips(answers), [answers]);
  const top = results.slice(0, 6);
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-8">
        <IconCircle name="Sparkles" tint={ACCENT.saffronDark} tintSoft={ACCENT.saffronSoft} size={56} iconSize={24} />
        <h2 className="mt-4 text-2xl sm:text-3xl font-bold" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>Your top matches</h2>
        <p className="mt-2 text-sm" style={{ color: t.muted }}>Based on your answers — ranked by how closely each major fits your profile.</p>
      </div>

      {tips.length > 0 && (
        <div className="mb-6 rounded-2xl p-4 flex flex-col gap-2" style={{ backgroundColor: ACCENT.mekongSoft }}>
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm" style={{ color: ACCENT.mekong }}>
              <Icon name="Info" size={15} className="mt-0.5 shrink-0" /> <span>{tip}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {top.map(({ major, pct }, i) => (
          <Card key={major.id} t={t} className="p-4" onClick={() => go("majorDetail", { id: major.id })}>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold w-6" style={{ fontFamily: FONT_MONO, color: t.muted }}>{i + 1}</span>
              <IconCircle name={getCategory(major.categoryId).icon} tint={getCategory(major.categoryId).tint} tintSoft={getCategory(major.categoryId).tintSoft} size={42} iconSize={19} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate" style={{ color: t.text }}>{major.name}</div>
                <div className="text-xs" style={{ color: t.muted }}>{getCategory(major.categoryId).name}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold" style={{ fontFamily: FONT_MONO, color: ACCENT.paddy }}>{pct}%</div>
                <div className="text-[10px]" style={{ color: t.muted }}>match</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); toggleFavorite("major", major.id); }} className="p-1.5 shrink-0">
                <Icon name="Heart" size={17} fill={isFavorite("major", major.id) ? ACCENT.laterite : "none"} color={isFavorite("major", major.id) ? ACCENT.laterite : t.muted} />
              </button>
            </div>
            <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: t.border }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: i === 0 ? ACCENT.saffron : ACCENT.mekong }} />
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Btn variant="dark" icon="RotateCcw" onClick={onRetake}>Retake Quiz</Btn>
        <Btn variant="outline" iconRight="ArrowRight" onClick={() => go("compare", { seedMajors: top.slice(0, 3).map((r) => r.major.id) })}>
          <span style={{ color: t.text }}>Compare Top 3</span>
        </Btn>
      </div>
    </div>
  );
}

/* ================================================================
   Major Directory
   ================================================================ */
function outlookLabel(m) {
  const avg = (m.demand + m.growth) / 2;
  if (avg >= 4.5) return { label: "Excellent", tone: "paddy" };
  if (avg >= 3.5) return { label: "Strong", tone: "mekong" };
  if (avg >= 2.5) return { label: "Moderate", tone: "saffron" };
  return { label: "Developing", tone: "neutral" };
}
function majorCities(m) { return [...new Set(universitiesOffering(m.id).map((u) => u.city))]; }
function majorHasType(m, type) { return universitiesOffering(m.id).some((u) => u.type === type); }
function durationBucket(m) { return m.duration.startsWith("4") ? "4" : "5+"; }

const DIFF_BUCKETS = [{ v: "any", label: "Any" }, { v: "easy", label: "Easier (1–2)" }, { v: "mid", label: "Moderate (3)" }, { v: "hard", label: "Challenging (4–5)" }];
const MATH_BUCKETS = [{ v: "any", label: "Any" }, { v: "low", label: "Low (1–2)" }, { v: "mid", label: "Medium (3)" }, { v: "high", label: "High (4–5)" }];
function inBucket(level, bucket, kind) {
  if (bucket === "any") return true;
  if (bucket === "easy" || bucket === "low") return level <= 2;
  if (bucket === "mid") return level === 3;
  if (bucket === "hard" || bucket === "high") return level >= 4;
  return true;
}

function MajorCard({ m, matchPct }) {
  const { t, go, toggleFavorite, isFavorite } = useApp();
  const cat = getCategory(m.categoryId);
  const outlook = outlookLabel(m);
  return (
    <Card t={t} onClick={() => go("majorDetail", { id: m.id })} className="p-4 flex flex-col gap-3 h-full">
      <div className="flex items-start justify-between gap-2">
        <IconCircle name={cat.icon} tint={cat.tint} tintSoft={cat.tintSoft} />
        <div className="flex items-center gap-1.5">
          {matchPct != null && (
            <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: ACCENT.saffronSoft, color: ACCENT.saffronDark, fontFamily: FONT_MONO }}>{matchPct}%</span>
          )}
          <button onClick={(e) => { e.stopPropagation(); toggleFavorite("major", m.id); }} className="p-1">
            <Icon name="Heart" size={17} fill={isFavorite("major", m.id) ? ACCENT.laterite : "none"} color={isFavorite("major", m.id) ? ACCENT.laterite : t.muted} />
          </button>
        </div>
      </div>
      <div>
        <div className="font-semibold text-sm leading-snug" style={{ color: t.text, fontFamily: FONT_DISPLAY }}>{m.name}</div>
        <div className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: t.muted }}>{m.shortDesc}</div>
      </div>
      <div className="mt-auto flex flex-wrap gap-1.5">
        <Badge t={t} tone={outlook.tone}>{outlook.label} outlook</Badge>
        <Badge t={t}>{m.duration}</Badge>
        <Badge t={t}>Difficulty {m.difficulty}/5</Badge>
      </div>
    </Card>
  );
}

function FilterPanel({ filters, setFilters, t, onClose }) {
  const cities = [...new Set(UNIVERSITIES.map((u) => u.city))];
  return (
    <div className="rounded-2xl border p-4 flex flex-col gap-4" style={{ borderColor: t.border, backgroundColor: t.surface }}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm" style={{ color: t.text }}>Filters</span>
        <button onClick={() => setFilters(DEFAULT_MAJOR_FILTERS)} className="text-xs font-medium" style={{ color: ACCENT.mekong }}>Reset</button>
      </div>
      {[
        { key: "difficulty", label: "Difficulty", options: DIFF_BUCKETS },
        { key: "math", label: "Math level", options: MATH_BUCKETS },
      ].map((f) => (
        <div key={f.key}>
          <div className="text-xs font-medium mb-1.5" style={{ color: t.muted }}>{f.label}</div>
          <div className="flex flex-wrap gap-1.5">
            {f.options.map((o) => (
              <button
                key={o.v} onClick={() => setFilters({ ...filters, [f.key]: o.v })}
                className="px-2.5 py-1.5 rounded-full text-xs font-medium border"
                style={{ borderColor: filters[f.key] === o.v ? ACCENT.paddy : t.border, backgroundColor: filters[f.key] === o.v ? ACCENT.paddySoft : "transparent", color: filters[f.key] === o.v ? ACCENT.paddy : t.text }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div>
        <div className="text-xs font-medium mb-1.5" style={{ color: t.muted }}>Programming required</div>
        <div className="flex gap-1.5">
          {[{ v: "any", label: "Any" }, { v: "yes", label: "Yes" }, { v: "no", label: "No" }].map((o) => (
            <button key={o.v} onClick={() => setFilters({ ...filters, coding: o.v })} className="px-2.5 py-1.5 rounded-full text-xs font-medium border"
              style={{ borderColor: filters.coding === o.v ? ACCENT.paddy : t.border, backgroundColor: filters.coding === o.v ? ACCENT.paddySoft : "transparent", color: filters.coding === o.v ? ACCENT.paddy : t.text }}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs font-medium mb-1.5" style={{ color: t.muted }}>Duration</div>
        <div className="flex gap-1.5">
          {[{ v: "any", label: "Any" }, { v: "4", label: "4 years" }, { v: "5+", label: "5+ years" }].map((o) => (
            <button key={o.v} onClick={() => setFilters({ ...filters, duration: o.v })} className="px-2.5 py-1.5 rounded-full text-xs font-medium border"
              style={{ borderColor: filters.duration === o.v ? ACCENT.paddy : t.border, backgroundColor: filters.duration === o.v ? ACCENT.paddySoft : "transparent", color: filters.duration === o.v ? ACCENT.paddy : t.text }}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs font-medium mb-1.5" style={{ color: t.muted }}>University type</div>
        <div className="flex gap-1.5">
          {[{ v: "any", label: "Any" }, { v: "Public", label: "Public" }, { v: "Private", label: "Private" }].map((o) => (
            <button key={o.v} onClick={() => setFilters({ ...filters, uniType: o.v })} className="px-2.5 py-1.5 rounded-full text-xs font-medium border"
              style={{ borderColor: filters.uniType === o.v ? ACCENT.paddy : t.border, backgroundColor: filters.uniType === o.v ? ACCENT.paddySoft : "transparent", color: filters.uniType === o.v ? ACCENT.paddy : t.text }}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs font-medium mb-1.5" style={{ color: t.muted }}>City</div>
        <div className="flex gap-1.5 flex-wrap">
          {["any", ...cities].map((c) => (
            <button key={c} onClick={() => setFilters({ ...filters, city: c })} className="px-2.5 py-1.5 rounded-full text-xs font-medium border"
              style={{ borderColor: filters.city === c ? ACCENT.paddy : t.border, backgroundColor: filters.city === c ? ACCENT.paddySoft : "transparent", color: filters.city === c ? ACCENT.paddy : t.text }}>
              {c === "any" ? "Any" : c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const DEFAULT_MAJOR_FILTERS = { difficulty: "any", math: "any", coding: "any", duration: "any", uniType: "any", city: "any" };

function MajorDirectory({ params }) {
  const { t, quizResults } = useApp();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(params?.category || "all");
  const [filters, setFilters] = useState(DEFAULT_MAJOR_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  useEffect(() => { if (params?.category) setCategory(params.category); }, [params?.category]);

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v !== "any").length;

  const results = useMemo(() => {
    return MAJORS.filter((m) => {
      if (category !== "all" && m.categoryId !== category) return false;
      if (search && !(m.name.toLowerCase().includes(search.toLowerCase()) || m.shortDesc.toLowerCase().includes(search.toLowerCase()))) return false;
      if (!inBucket(m.difficulty, filters.difficulty)) return false;
      if (!inBucket(m.mathLevel, filters.math)) return false;
      if (filters.coding === "yes" && !m.programmingRequired) return false;
      if (filters.coding === "no" && m.programmingRequired) return false;
      if (filters.duration !== "any" && durationBucket(m) !== filters.duration) return false;
      if (filters.uniType !== "any" && !majorHasType(m, filters.uniType)) return false;
      if (filters.city !== "any" && !majorCities(m).includes(filters.city)) return false;
      return true;
    });
  }, [search, category, filters]);

  const matchMap = useMemo(() => {
    if (!quizResults) return null;
    const map = {};
    quizResults.forEach((r) => { map[r.major.id] = r.pct; });
    return map;
  }, [quizResults]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <SectionHeading eyebrow={`${MAJORS.length} majors`} title="Major directory" subtitle="Search and filter every major on the platform." t={t} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 rounded-full px-4 py-2.5 border" style={{ borderColor: t.borderStrong, backgroundColor: t.surface }}>
          <Icon name="Search" size={16} color={t.muted} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search majors..." className="flex-1 bg-transparent outline-none text-sm" style={{ color: t.text }} />
        </div>
        <button onClick={() => setShowFilters((s) => !s)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium shrink-0" style={{ borderColor: t.borderStrong, color: t.text, backgroundColor: showFilters ? t.surfaceAlt : t.surface }}>
          <Icon name="SlidersHorizontal" size={15} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-1 px-1">
        {[{ id: "all", name: "All" }, ...CATEGORIES].map((c) => (
          <button key={c.id} onClick={() => setCategory(c.id)} className="px-3 py-1.5 rounded-full text-xs font-medium border shrink-0"
            style={{ borderColor: category === c.id ? ACCENT.paddy : t.border, backgroundColor: category === c.id ? ACCENT.paddySoft : "transparent", color: category === c.id ? ACCENT.paddy : t.text }}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6 mt-4">
        {showFilters && (
          <div className="lg:order-1">
            <FilterPanel filters={filters} setFilters={setFilters} t={t} />
          </div>
        )}
        <div className={showFilters ? "lg:order-2" : "lg:col-span-2"}>
          <div className="text-xs mb-3" style={{ color: t.muted }}>{results.length} result{results.length !== 1 ? "s" : ""}</div>
          {results.length === 0 ? (
            <EmptyState t={t} icon="Search" title="No majors match" subtitle="Try clearing a filter or searching a broader term." />
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {results.map((m) => <MajorCard key={m.id} m={m} matchPct={matchMap?.[m.id]} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Major Detail
   ================================================================ */
function ListBlock({ title, items, t, tone = "neutral", icon }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-2" style={{ color: t.muted }}>
        {icon && <Icon name={icon} size={13} />} {title}
      </div>
      <ul className="flex flex-col gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: t.text }}>
            <span className="mt-1.5 h-1 w-1 rounded-full shrink-0" style={{ backgroundColor: tone === "laterite" ? ACCENT.laterite : ACCENT.paddy }} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FaqAccordion({ faqs, t }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="flex flex-col gap-2">
      {faqs.map((f, i) => (
        <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: t.border }}>
          <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between px-4 py-3 text-left">
            <span className="text-sm font-medium" style={{ color: t.text }}>{f.q}</span>
            <Icon name="ChevronDown" size={16} color={t.muted} style={{ transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          {open === i && <div className="px-4 pb-3 text-sm" style={{ color: t.muted }}>{f.a}</div>}
        </div>
      ))}
    </div>
  );
}

function MajorDetail({ params }) {
  const { t, go, toggleFavorite, isFavorite, compareList, toggleCompare } = useApp();
  const m = getMajor(params?.id);
  useEffect(() => { window?.scrollTo?.({ top: 0 }); }, [params?.id]);
  if (!m) return <EmptyState t={t} icon="AlertCircle" title="Major not found" action={<Btn onClick={() => go("majors")} className="mt-3">Back to directory</Btn>} />;
  const cat = getCategory(m.categoryId);
  const outlook = outlookLabel(m);
  const unis = universitiesOffering(m.id);
  const related = m.relatedMajors.map(getMajor).filter(Boolean);
  const inCompare = compareList.majors.includes(m.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <button onClick={() => go("majors")} className="flex items-center gap-1.5 text-xs font-medium mb-5" style={{ color: t.muted }}>
        <Icon name="ChevronLeft" size={14} /> All majors
      </button>

      <div className="flex items-start gap-4">
        <IconCircle name={cat.icon} tint={cat.tint} tintSoft={cat.tintSoft} size={56} iconSize={26} />
        <div className="flex-1 min-w-0">
          <Badge t={t} tone="mekong">{cat.name}</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>{m.name}</h1>
          <p className="mt-2 text-sm sm:text-base" style={{ color: t.muted }}>{m.overview}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        <Btn size="sm" variant={isFavorite("major", m.id) ? "dark" : "outline"} icon="Heart" onClick={() => toggleFavorite("major", m.id)}>
          <span style={{ color: isFavorite("major", m.id) ? "#fff" : t.text }}>{isFavorite("major", m.id) ? "Saved" : "Save"}</span>
        </Btn>
        <Btn size="sm" variant={inCompare ? "dark" : "outline"} icon="BarChart3" onClick={() => toggleCompare("majors", m.id)}>
          <span style={{ color: inCompare ? "#fff" : t.text }}>{inCompare ? "In compare" : "Add to compare"}</span>
        </Btn>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {[
          { label: "Difficulty", value: `${m.difficulty}/5` },
          { label: "Duration", value: m.duration },
          { label: "Tuition", value: m.tuition },
          { label: "Outlook", value: outlook.label },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3" style={{ backgroundColor: t.surfaceAlt }}>
            <div className="text-[10px] uppercase font-bold tracking-wide" style={{ color: t.muted }}>{s.label}</div>
            <div className="text-sm font-semibold mt-1" style={{ color: t.text, fontFamily: FONT_MONO }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mt-10">
        <ListBlock title="What you'll study" items={m.whatYoullStudy} t={t} icon="BookOpen" />
        <ListBlock title="Core subjects" items={m.coreSubjects} t={t} icon="ClipboardList" />
        <ListBlock title="Skills required" items={m.skillsRequired} t={t} icon="Target" />
        <ListBlock title="Suitable personality" items={m.suitablePersonality} t={t} icon="Users" />
      </div>

      <div className="mt-6 rounded-2xl p-4 flex items-start gap-2.5" style={{ backgroundColor: ACCENT.lateriteSoft }}>
        <Icon name="AlertCircle" size={16} color={ACCENT.laterite} className="mt-0.5 shrink-0" />
        <div>
          <div className="text-xs font-bold" style={{ color: ACCENT.laterite }}>Maybe not for you if...</div>
          <ul className="mt-1 flex flex-col gap-1">
            {m.notRecommendedIf.map((x, i) => <li key={i} className="text-sm" style={{ color: t.text }}>{x}</li>)}
          </ul>
        </div>
      </div>

      <div className="mt-10">
        <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: t.muted }}>Difficulty profile</div>
        <div className="flex flex-col gap-2.5">
          <LevelBar label="Math level" value={m.mathLevel} t={t} color={ACCENT.mekong} />
          <LevelBar label="Communication" value={m.communicationLevel} t={t} color={ACCENT.saffron} />
          <LevelBar label="Creativity" value={m.creativityLevel} t={t} color="#A2447A" />
          <LevelBar label="Problem-solving" value={m.problemSolvingLevel} t={t} color={ACCENT.paddy} />
        </div>
        <div className="mt-3"><Badge t={t} tone={m.programmingRequired ? "mekong" : "neutral"}>{m.programmingRequired ? "Programming required" : "No programming required"}</Badge></div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mt-10">
        <ListBlock title="Typical hands-on work" items={m.handsOn} t={t} icon="PenTool" />
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-2" style={{ color: t.muted }}><Icon name="Briefcase" size={13} /> Internships</div>
          <p className="text-sm" style={{ color: t.text }}>{m.internship}</p>
        </div>
      </div>

      <div className="mt-10">
        <SectionHeading eyebrow="Where it leads" title="Careers & outlook" t={t} />
        <div className="flex flex-wrap gap-2 mb-4">{m.careerPaths.map((c) => <Badge key={c} t={t} tone="paddy">{c}</Badge>)}</div>
        <div className="grid sm:grid-cols-2 gap-6">
          <ListBlock title="Industries" items={m.industries} t={t} icon="Building2" />
          <div className="flex flex-col gap-3">
            <div><div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: t.muted }}>Expected salary (Cambodia, est.)</div><div className="text-sm font-medium" style={{ color: t.text }}>{m.salary}</div></div>
            <div><div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: t.muted }}>International opportunities</div><div className="text-sm" style={{ color: t.text }}>{m.intlOpportunities}</div></div>
            <div><div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: t.muted }}>Future demand</div><div className="text-sm" style={{ color: t.text }}>{m.futureDemand}</div></div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
          {[["Demand", m.demand], ["Growth", m.growth], ["Remote work", m.remote], ["Int'l options", m.intl], ["Work-life", m.worklife]].map(([label, v]) => (
            <div key={label} className="text-center rounded-xl py-3" style={{ backgroundColor: t.surfaceAlt }}>
              <div className="text-lg font-bold" style={{ fontFamily: FONT_MONO, color: ACCENT.paddy }}>{v}/5</div>
              <div className="text-[10px] mt-0.5" style={{ color: t.muted }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mt-10">
        <div className="rounded-2xl p-4" style={{ backgroundColor: ACCENT.paddySoft }}>
          <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: ACCENT.paddy }}>Advantages</div>
          <ul className="flex flex-col gap-1.5">{m.pros.map((p, i) => <li key={i} className="text-sm flex gap-2" style={{ color: t.text }}><Icon name="CheckCircle2" size={15} color={ACCENT.paddy} className="mt-0.5 shrink-0" />{p}</li>)}</ul>
        </div>
        <div className="rounded-2xl p-4" style={{ backgroundColor: t.surfaceAlt }}>
          <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: t.muted }}>Challenges</div>
          <ul className="flex flex-col gap-1.5">{m.cons.map((p, i) => <li key={i} className="text-sm flex gap-2" style={{ color: t.text }}><Icon name="Minus" size={15} color={t.muted} className="mt-0.5 shrink-0" />{p}</li>)}</ul>
        </div>
      </div>

      {unis.length > 0 && (
        <div className="mt-10">
          <SectionHeading eyebrow={`${unis.length} option${unis.length !== 1 ? "s" : ""}`} title="Universities offering this major" t={t} />
          <div className="grid sm:grid-cols-2 gap-3">
            {unis.map((u) => (
              <Card key={u.id} t={t} className="p-4 flex items-center gap-3" onClick={() => go("universityDetail", { id: u.id })}>
                <IconCircle name="Building2" tint={ACCENT.mekong} tintSoft={ACCENT.mekongSoft} size={40} iconSize={18} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: t.text }}>{u.name}</div>
                  <div className="text-xs" style={{ color: t.muted }}>{u.city} · {u.type}</div>
                </div>
                <Icon name="ChevronRight" size={16} color={t.muted} />
              </Card>
            ))}
          </div>
        </div>
      )}

      {m.testimonial && (
        <div className="mt-10 rounded-2xl p-5" style={{ backgroundColor: t.surfaceAlt }}>
          <Icon name="Quote" size={20} color={ACCENT.saffron} />
          <p className="text-sm mt-3 leading-relaxed" style={{ color: t.text }}>{m.testimonial.text}</p>
          <div className="mt-3 text-xs font-semibold" style={{ color: t.text }}>{m.testimonial.name} · <span className="font-normal" style={{ color: t.muted }}>{m.testimonial.role}</span></div>
        </div>
      )}

      <div className="mt-10">
        <SectionHeading eyebrow="Answers" title="Frequently asked questions" t={t} />
        <FaqAccordion faqs={m.faqs} t={t} />
      </div>

      <div className="mt-10 rounded-2xl p-4 border" style={{ borderColor: t.border }}>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-2" style={{ color: t.muted }}><Icon name="PlayCircle" size={13} /> Go deeper</div>
        <p className="text-sm" style={{ color: t.text }}>
          Search "{m.name} Cambodia student vlog" for first-hand day-in-the-life videos, and look for the {m.name} student association at your shortlisted universities for current textbook and reading lists.
        </p>
      </div>

      {related.length > 0 && (
        <div className="mt-10">
          <SectionHeading eyebrow="Nearby paths" title="Related majors" t={t} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{related.map((r) => <MajorCard key={r.id} m={r} />)}</div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   University Directory + Detail
   ================================================================ */
function UniMonogram({ u, size = 44 }) {
  const initials = u.shortName.slice(0, 3).toUpperCase();
  return (
    <div className="flex items-center justify-center rounded-2xl shrink-0 font-bold" style={{ width: size, height: size, backgroundColor: ACCENT.paddy, color: "#fff", fontFamily: FONT_MONO, fontSize: size * 0.3 }}>
      {initials}
    </div>
  );
}

function UniversityCard({ u }) {
  const { t, go, toggleFavorite, isFavorite } = useApp();
  const majorCount = majorsOfferedAt(u.id).length;
  return (
    <Card t={t} onClick={() => go("universityDetail", { id: u.id })} className="p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <UniMonogram u={u} />
        <button onClick={(e) => { e.stopPropagation(); toggleFavorite("university", u.id); }} className="p-1">
          <Icon name="Heart" size={17} fill={isFavorite("university", u.id) ? ACCENT.laterite : "none"} color={isFavorite("university", u.id) ? ACCENT.laterite : t.muted} />
        </button>
      </div>
      <div>
        <div className="font-semibold text-sm leading-snug" style={{ color: t.text, fontFamily: FONT_DISPLAY }}>{u.name}</div>
        <div className="text-xs mt-1" style={{ color: t.muted }}>{u.highlight}</div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge t={t} tone={u.type === "Public" ? "paddy" : "saffron"}>{u.type}</Badge>
        <Badge t={t}><Icon name="MapPin" size={10} /> {u.city}</Badge>
        <Badge t={t}>{majorCount} majors</Badge>
      </div>
    </Card>
  );
}

function UniversityDirectory() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [city, setCity] = useState("all");
  const cities = [...new Set(UNIVERSITIES.map((u) => u.city))];
  const results = UNIVERSITIES.filter((u) => {
    if (type !== "all" && u.type !== type) return false;
    if (city !== "all" && u.city !== city) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <SectionHeading eyebrow={`${UNIVERSITIES.length} universities`} title="University directory" subtitle="Every university on the platform, with the majors, facilities, and costs to compare." t={t} />
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 rounded-full px-4 py-2.5 border" style={{ borderColor: t.borderStrong, backgroundColor: t.surface }}>
          <Icon name="Search" size={16} color={t.muted} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search universities..." className="flex-1 bg-transparent outline-none text-sm" style={{ color: t.text }} />
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap mb-6">
        {["all", "Public", "Private"].map((v) => (
          <button key={v} onClick={() => setType(v)} className="px-3 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: type === v ? ACCENT.paddy : t.border, backgroundColor: type === v ? ACCENT.paddySoft : "transparent", color: type === v ? ACCENT.paddy : t.text }}>{v === "all" ? "All types" : v}</button>
        ))}
        <div className="w-px h-6 self-center" style={{ backgroundColor: t.border }} />
        {["all", ...cities].map((v) => (
          <button key={v} onClick={() => setCity(v)} className="px-3 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: city === v ? ACCENT.mekong : t.border, backgroundColor: city === v ? ACCENT.mekongSoft : "transparent", color: city === v ? ACCENT.mekong : t.text }}>{v === "all" ? "All cities" : v}</button>
        ))}
      </div>
      <div className="text-xs mb-3" style={{ color: t.muted }}>{results.length} result{results.length !== 1 ? "s" : ""}</div>
      {results.length === 0 ? (
        <EmptyState t={t} icon="Building2" title="No universities match" subtitle="Try a different city or type." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{results.map((u) => <UniversityCard key={u.id} u={u} />)}</div>
      )}
    </div>
  );
}

function FactRow({ icon, label, value, t }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon name={icon} size={16} color={t.muted} className="mt-0.5 shrink-0" />
      <div><div className="text-xs" style={{ color: t.muted }}>{label}</div><div className="text-sm font-medium" style={{ color: t.text }}>{value}</div></div>
    </div>
  );
}

function UniversityDetail({ params }) {
  const { t, go, toggleFavorite, isFavorite, compareList, toggleCompare } = useApp();
  const u = getUniversity(params?.id);
  useEffect(() => { window?.scrollTo?.({ top: 0 }); }, [params?.id]);
  if (!u) return <EmptyState t={t} icon="AlertCircle" title="University not found" action={<Btn onClick={() => go("universities")} className="mt-3">Back to directory</Btn>} />;
  const majors = majorsOfferedAt(u.id);
  const inCompare = compareList.universities.includes(u.id);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u.name + ", Cambodia")}`;
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(u.name + " Cambodia official website")}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <button onClick={() => go("universities")} className="flex items-center gap-1.5 text-xs font-medium mb-5" style={{ color: t.muted }}>
        <Icon name="ChevronLeft" size={14} /> All universities
      </button>

      <div className="rounded-3xl p-6 sm:p-8" style={{ backgroundColor: ACCENT.paddy }}>
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center rounded-2xl shrink-0 font-bold" style={{ width: 60, height: 60, backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", fontFamily: FONT_MONO, fontSize: 18 }}>
            {u.shortName.slice(0, 3).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: FONT_DISPLAY }}>{u.name}</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>{u.highlight}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff" }}>{u.type}</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1" style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff" }}><Icon name="MapPin" size={11} />{u.city}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        <Btn size="sm" variant={isFavorite("university", u.id) ? "dark" : "outline"} icon="Heart" onClick={() => toggleFavorite("university", u.id)}>
          <span style={{ color: isFavorite("university", u.id) ? "#fff" : t.text }}>{isFavorite("university", u.id) ? "Saved" : "Save"}</span>
        </Btn>
        <Btn size="sm" variant={inCompare ? "dark" : "outline"} icon="BarChart3" onClick={() => toggleCompare("universities", u.id)}>
          <span style={{ color: inCompare ? "#fff" : t.text }}>{inCompare ? "In compare" : "Add to compare"}</span>
        </Btn>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
          <Btn size="sm" variant="outline" icon="MapPin"><span style={{ color: t.text }}>View on Maps</span></Btn>
        </a>
        <a href={searchUrl} target="_blank" rel="noopener noreferrer">
          <Btn size="sm" variant="outline" icon="ExternalLink"><span style={{ color: t.text }}>Find website</span></Btn>
        </a>
      </div>

      <p className="text-sm mt-6" style={{ color: t.text }}>{u.about}</p>
      <p className="text-xs mt-2" style={{ color: t.muted }}>{u.founded}</p>

      <div className="grid sm:grid-cols-2 gap-x-8 mt-4 rounded-2xl border p-4 sm:p-5" style={{ borderColor: t.border }}>
        <FactRow icon="DollarSign" label="Tuition range (est.)" value={u.tuitionRange} t={t} />
        <FactRow icon="Globe" label="English requirement" value={u.englishReq} t={t} />
        <FactRow icon="Home" label="Dormitory" value={u.dormitory} t={t} />
        <FactRow icon="Award" label="Accreditation" value={u.accreditation} t={t} />
        <FactRow icon="Users" label="Exchange programs" value={u.exchange} t={t} />
        <FactRow icon="BookOpen" label="Majors offered" value={`${majors.length} on this platform`} t={t} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mt-8">
        <ListBlock title="Facilities" items={u.facilities} t={t} icon="Building2" />
        <ListBlock title="Student clubs" items={u.clubs} t={t} icon="Users" />
      </div>
      <div className="mt-6">
        <ListBlock title="Scholarships at this university" items={u.scholarships} t={t} icon="Award" />
        <button onClick={() => go("scholarships")} className="text-xs font-medium mt-2 flex items-center gap-1" style={{ color: ACCENT.mekong }}>See all scholarships <Icon name="ArrowRight" size={12} /></button>
      </div>

      {majors.length > 0 && (
        <div className="mt-10">
          <SectionHeading eyebrow={`${majors.length} on this platform`} title="Available majors" t={t} />
          <div className="grid sm:grid-cols-2 gap-4">{majors.map((m) => <MajorCard key={m.id} m={m} />)}</div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Compare
   ================================================================ */
const MAJOR_COMPARE_ROWS = [
  { label: "Difficulty", render: (m) => `${m.difficulty}/5` },
  { label: "Math level", render: (m) => `${m.mathLevel}/5` },
  { label: "Coding required", render: (m) => (m.programmingRequired ? "Yes" : "No") },
  { label: "Communication", render: (m) => `${m.communicationLevel}/5` },
  { label: "Creativity", render: (m) => `${m.creativityLevel}/5` },
  { label: "Job demand", render: (m) => `${m.demand}/5` },
  { label: "Salary estimate", render: (m) => m.salary },
  { label: "Future growth", render: (m) => `${m.growth}/5` },
  { label: "Remote potential", render: (m) => `${m.remote}/5` },
  { label: "Int'l opportunities", render: (m) => `${m.intl}/5` },
  { label: "Work-life balance", render: (m) => `${m.worklife}/5` },
];
const UNI_COMPARE_ROWS = [
  { label: "Type", render: (u) => u.type },
  { label: "City", render: (u) => u.city },
  { label: "Tuition (est.)", render: (u) => u.tuitionRange },
  { label: "Accreditation", render: (u) => u.accreditation },
  { label: "Facilities", render: (u) => `${u.facilities.length} listed` },
  { label: "Student clubs", render: (u) => `${u.clubs.length} listed` },
  { label: "English requirement", render: (u) => u.englishReq },
  { label: "Dormitory", render: (u) => u.dormitory },
  { label: "Majors offered", render: (u) => `${majorsOfferedAt(u.id).length}` },
  { label: "Exchange programs", render: (u) => u.exchange },
  { label: "Employment outcomes", render: () => "Not publicly reported — verify with admissions" },
];

function ComparePicker({ type, t }) {
  const { compareList, toggleCompare } = useApp();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const pool = type === "majors" ? MAJORS : UNIVERSITIES;
  const selected = compareList[type];
  const available = pool.filter((x) => !selected.includes(x.id) && x.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} disabled={selected.length >= 4} className="flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium disabled:opacity-40" style={{ borderColor: t.borderStrong, color: t.text }}>
        <Icon name="Plus" size={15} /> Add {type === "majors" ? "major" : "university"} {selected.length >= 4 && "(max 4)"}
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-72 max-h-72 overflow-y-auto rounded-2xl border shadow-lg p-2" style={{ backgroundColor: t.surface, borderColor: t.border }}>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="w-full px-3 py-2 rounded-xl text-sm outline-none border mb-1" style={{ borderColor: t.border, backgroundColor: t.bg, color: t.text }} />
          {available.slice(0, 8).map((x) => (
            <button key={x.id} onClick={() => { toggleCompare(type, x.id); setOpen(false); setQ(""); }} className="w-full text-left px-3 py-2 rounded-xl text-sm hover:opacity-80" style={{ color: t.text }}>
              {x.name}
            </button>
          ))}
          {available.length === 0 && <div className="px-3 py-2 text-xs" style={{ color: t.muted }}>No matches</div>}
        </div>
      )}
    </div>
  );
}

function ComparePage({ params }) {
  const { t, go, compareList, toggleCompare, setCompareItems } = useApp();
  const [mode, setMode] = useState("majors");
  useEffect(() => { if (params?.seedMajors?.length) { setCompareItems("majors", params.seedMajors); setMode("majors"); } }, [params]);

  const type = mode;
  const pool = type === "majors" ? MAJORS : UNIVERSITIES;
  const items = compareList[type].map((id) => pool.find((x) => x.id === id)).filter(Boolean);
  const rows = type === "majors" ? MAJOR_COMPARE_ROWS : UNI_COMPARE_ROWS;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <SectionHeading eyebrow="Side by side" title="Compare" subtitle="Line up up to four majors or universities across the factors that matter most." t={t} />
      <div className="flex items-center gap-2 mb-6">
        {[["majors", "Majors"], ["universities", "Universities"]].map(([v, label]) => (
          <button key={v} onClick={() => setMode(v)} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: mode === v ? ACCENT.paddy : "transparent", color: mode === v ? "#fff" : t.text, border: `1px solid ${mode === v ? ACCENT.paddy : t.border}` }}>
            {label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState t={t} icon="BarChart3" title={`No ${type} selected yet`} subtitle={`Add up to four ${type} to compare them side by side.`} action={<div className="mt-4"><ComparePicker type={type} t={t} /></div>} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {items.map((it) => (
              <span key={it.id} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: t.surfaceAlt, color: t.text }}>
                {it.name}
                <button onClick={() => toggleCompare(type, it.id)}><Icon name="X" size={12} color={t.muted} /></button>
              </span>
            ))}
            {items.length < 4 && <ComparePicker type={type} t={t} />}
          </div>

          <CompareTable
            items={items} rows={rows} t={t} go={go} type={type}
          />
        </>
      )}
    </div>
  );
}

function CompareTable({ items, rows, t, go, type }) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-2">
      <table className="border-collapse w-full" style={{ minWidth: 160 + items.length * 160 }}>
        <thead>
          <tr>
            <th className="text-left p-3 sticky left-0 z-10" style={{ backgroundColor: t.bg, minWidth: 150 }}></th>
            {items.map((it) => (
              <th key={it.id} className="text-left p-3 align-bottom cursor-pointer" style={{ minWidth: 160 }} onClick={() => go(type === "majors" ? "majorDetail" : "universityDetail", { id: it.id })}>
                <div className="text-sm font-bold leading-snug" style={{ color: t.text, fontFamily: FONT_DISPLAY }}>{it.name}</div>
                <div className="text-xs mt-1 flex items-center gap-1" style={{ color: ACCENT.mekong }}>View details <Icon name="ArrowRight" size={11} /></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label}>
              <td className="p-3 text-xs font-semibold sticky left-0 z-10" style={{ color: t.muted, backgroundColor: i % 2 ? t.surfaceAlt : t.bg }}>{row.label}</td>
              {items.map((it) => (
                <td key={it.id} className="p-3 text-sm" style={{ color: t.text, backgroundColor: i % 2 ? t.surfaceAlt : "transparent" }}>{row.render(it)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================
   Roadmap Page
   ================================================================ */
function RoadmapPage() {
  const { t, go, quizResults, visited } = useApp();
  const stepDone = (step) => {
    if (step.key === "grad-hs") return true;
    if (step.key === "quiz") return !!quizResults;
    if (step.route) return visited.has(step.route);
    return false;
  };
  const firstActive = ROADMAP_STEPS.findIndex((s) => !stepDone(s));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <SectionHeading eyebrow="The full journey" title="Your roadmap" subtitle="Ten waypoints from graduation to career. Steps light up as you use the platform." t={t} />
      <div className="relative">
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5" style={{ backgroundColor: t.border }} />
        <div className="flex flex-col gap-1">
          {ROADMAP_STEPS.map((s, i) => {
            const done = stepDone(s);
            const active = i === firstActive;
            return (
              <div key={s.key} className="relative flex gap-4 py-3">
                <Waypoint index={i + 1} active={active} done={done} t={t} />
                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: t.text, fontFamily: FONT_DISPLAY }}>{s.title}</span>
                    {active && <Badge t={t} tone="saffron">You are here</Badge>}
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: t.muted }}>{s.desc}</p>
                  {s.route && (
                    <button onClick={() => go(s.route)} className="text-xs font-semibold mt-1.5 flex items-center gap-1" style={{ color: ACCENT.mekong }}>
                      Go there <Icon name="ArrowRight" size={11} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-10 rounded-2xl p-4 border text-xs leading-relaxed" style={{ borderColor: t.border, color: t.muted }}>
        <span className="font-bold" style={{ color: t.text }}>Building the real version:</span> a production platform would replace this prototype's in-browser data with a managed relational database (universities, faculties, majors, admissions, scholarships, reviews), a real search index, and an admin panel for staff to keep listings current — the schema this prototype's data model maps onto directly.
      </div>
    </div>
  );
}

/* ================================================================
   Scholarships
   ================================================================ */
function ScholarshipsPage() {
  const { t } = useApp();
  const [tag, setTag] = useState("all");
  const allTags = [...new Set(SCHOLARSHIPS.flatMap((s) => s.tags))];
  const results = SCHOLARSHIPS.filter((s) => tag === "all" || s.tags.includes(tag));
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <SectionHeading eyebrow={`${SCHOLARSHIPS.length} listed`} title="Scholarships" subtitle="Illustrative sample listing — always confirm exact amounts and deadlines with the provider." t={t} />
      <div className="flex gap-1.5 flex-wrap mb-6">
        {["all", ...allTags].map((v) => (
          <button key={v} onClick={() => setTag(v)} className="px-3 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: tag === v ? ACCENT.paddy : t.border, backgroundColor: tag === v ? ACCENT.paddySoft : "transparent", color: tag === v ? ACCENT.paddy : t.text }}>{v === "all" ? "All" : v}</button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {results.map((s) => (
          <Card key={s.id} t={t} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-sm" style={{ color: t.text, fontFamily: FONT_DISPLAY }}>{s.name}</div>
                <div className="text-xs mt-0.5" style={{ color: t.muted }}>{s.provider}</div>
              </div>
              <IconCircle name="Award" tint={ACCENT.saffronDark} tintSoft={ACCENT.saffronSoft} size={38} iconSize={17} />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div><div className="text-[10px] uppercase font-bold" style={{ color: t.muted }}>Coverage</div><div className="text-xs font-medium mt-0.5" style={{ color: t.text }}>{s.coverage}</div></div>
              <div><div className="text-[10px] uppercase font-bold" style={{ color: t.muted }}>Min. GPA</div><div className="text-xs font-medium mt-0.5" style={{ color: t.text }}>{s.gpa}</div></div>
              <div><div className="text-[10px] uppercase font-bold" style={{ color: t.muted }}>Deadline</div><div className="text-xs font-medium mt-0.5" style={{ color: t.text }}>{s.deadline}</div></div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">{s.tags.map((tg) => <Badge key={tg} t={t}>{tg}</Badge>)}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   Careers
   ================================================================ */
function CareersPage({ params }) {
  const { t, go } = useApp();
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(params?.highlight || null);
  useEffect(() => { if (params?.highlight) setOpenId(params.highlight); }, [params?.highlight]);
  const results = CAREERS.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <SectionHeading eyebrow="Search by job, not major" title="Career explorer" subtitle="Start from the job you want, and see which majors get you there." t={t} />
      <div className="flex items-center gap-2 rounded-full px-4 py-2.5 border mb-6" style={{ borderColor: t.borderStrong, backgroundColor: t.surface }}>
        <Icon name="Search" size={16} color={t.muted} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search careers, e.g. 'Doctor'" className="flex-1 bg-transparent outline-none text-sm" style={{ color: t.text }} />
      </div>
      <div className="flex flex-col gap-2.5">
        {results.map((c) => {
          const open = openId === c.id;
          const degrees = c.degree.map(getMajor).filter(Boolean);
          return (
            <div key={c.id} className="rounded-2xl border overflow-hidden" style={{ borderColor: t.border, backgroundColor: t.surface }}>
              <button onClick={() => setOpenId(open ? null : c.id)} className="w-full flex items-center gap-3 p-4 text-left">
                <IconCircle name="Briefcase" tint={ACCENT.saffronDark} tintSoft={ACCENT.saffronSoft} size={40} iconSize={18} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: t.text }}>{c.title}</div>
                  <div className="text-xs mt-0.5 truncate" style={{ color: t.muted }}>{c.desc}</div>
                </div>
                <Icon name="ChevronDown" size={16} color={t.muted} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {open && (
                <div className="px-4 pb-5">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div><div className="text-[10px] uppercase font-bold" style={{ color: t.muted }}>Salary (est.)</div><div className="text-xs font-medium mt-0.5" style={{ color: t.text }}>{c.salary}</div></div>
                    <div><div className="text-[10px] uppercase font-bold" style={{ color: t.muted }}>Demand</div><LevelBar value={c.demand} t={t} color={ACCENT.paddy} /></div>
                  </div>
                  <div className="mb-4"><div className="text-[10px] uppercase font-bold mb-1.5" style={{ color: t.muted }}>Skills</div><div className="flex flex-wrap gap-1.5">{c.skills.map((s) => <Badge key={s} t={t}>{s}</Badge>)}</div></div>
                  <div className="mb-4"><div className="text-[10px] uppercase font-bold mb-1" style={{ color: t.muted }}>Career progression</div><div className="text-xs" style={{ color: t.text }}>{c.progression}</div></div>
                  <div>
                    <div className="text-[10px] uppercase font-bold mb-1.5" style={{ color: t.muted }}>Related majors</div>
                    <div className="flex flex-wrap gap-1.5">
                      {degrees.map((m) => (
                        <button key={m.id} onClick={() => go("majorDetail", { id: m.id })} className="text-xs font-medium px-2.5 py-1.5 rounded-full flex items-center gap-1" style={{ backgroundColor: ACCENT.mekongSoft, color: ACCENT.mekong }}>
                          {m.name} <Icon name="ArrowRight" size={11} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   Favorites / Dashboard
   ================================================================ */
function FavoritesPage() {
  const { t, go, favorites } = useApp();
  const savedMajors = favorites.filter((f) => f.type === "major").map((f) => getMajor(f.id)).filter(Boolean);
  const savedUnis = favorites.filter((f) => f.type === "university").map((f) => getUniversity(f.id)).filter(Boolean);
  const { quizResults } = useApp();

  if (favorites.length === 0 && !quizResults) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <EmptyState t={t} icon="Heart" title="Nothing saved yet" subtitle="Tap the heart on any major or university to save it here for later." action={
          <div className="flex gap-2 mt-4"><Btn onClick={() => go("majors")}>Explore majors</Btn><Btn variant="outline" onClick={() => go("quiz")}><span style={{ color: t.text }}>Take quiz</span></Btn></div>
        } />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <SectionHeading eyebrow="Your dashboard" title="Saved & results" t={t} />
      {quizResults && (
        <Card t={t} className="p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold" style={{ color: t.text, fontFamily: FONT_DISPLAY }}>Your last quiz result</div>
            <button onClick={() => go("quiz")} className="text-xs font-medium" style={{ color: ACCENT.mekong }}>Retake</button>
          </div>
          <div className="flex flex-col gap-2">
            {quizResults.slice(0, 3).map(({ major, pct }, i) => (
              <button key={major.id} onClick={() => go("majorDetail", { id: major.id })} className="flex items-center gap-3 text-left">
                <span className="text-xs w-4" style={{ color: t.muted, fontFamily: FONT_MONO }}>{i + 1}</span>
                <span className="flex-1 text-sm font-medium" style={{ color: t.text }}>{major.name}</span>
                <span className="text-xs font-bold" style={{ color: ACCENT.paddy, fontFamily: FONT_MONO }}>{pct}%</span>
              </button>
            ))}
          </div>
        </Card>
      )}
      {savedMajors.length > 0 && (
        <div className="mb-10">
          <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: t.muted }}>Saved majors ({savedMajors.length})</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{savedMajors.map((m) => <MajorCard key={m.id} m={m} />)}</div>
        </div>
      )}
      {savedUnis.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: t.muted }}>Saved universities ({savedUnis.length})</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{savedUnis.map((u) => <UniversityCard key={u.id} u={u} />)}</div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   AI Career Assistant — calls the live Claude API from the artifact
   ================================================================ */
const AI_CONTEXT = (() => {
  const majorsSummary = MAJORS.map((m) =>
    `- ${m.name} (${getCategory(m.categoryId).name}): ${m.shortDesc} Careers: ${m.careerPaths.join(", ")}. Salary: ${m.salary}. Difficulty ${m.difficulty}/5, Math ${m.mathLevel}/5, Duration ${m.duration}. Offered at: ${m.universities.map((id) => getUniversity(id)?.shortName).filter(Boolean).join(", ")}.`
  ).join("\n");
  const uniSummary = UNIVERSITIES.map((u) =>
    `- ${u.name} (${u.shortName}, ${u.type}, ${u.city}): ${u.highlight}. Tuition ${u.tuitionRange}. Offers: ${majorsOfferedAt(u.id).map((m) => m.name).join(", ")}.`
  ).join("\n");
  return `MAJORS:\n${majorsSummary}\n\nUNIVERSITIES:\n${uniSummary}`;
})();

const AI_SYSTEM_PROMPT = `You are the AI Career Assistant embedded in "Cambodia Major Roadmap," a prototype platform that helps Cambodian high school graduates choose a university major. Answer using the reference data below when discussing specific majors, universities, salaries, or programs on this platform — do not invent figures beyond it. All figures in the data are illustrative estimates for a prototype, not verified current figures; say so if someone asks for precise numbers. If a question falls outside the data, answer helpfully in general terms and suggest exploring the Major Directory, University Directory, or Career Quiz. Keep answers short: 2-5 sentences, friendly, plain text with no markdown headers or tables (this renders in a small chat bubble).

REFERENCE DATA:
${AI_CONTEXT}`;

const AI_SUGGESTIONS = [
  "What major suits me?",
  "Which university has the best MIS program?",
  "What jobs can I get with Accounting?",
  "Compare IT and Computer Science.",
];

async function callClaude(history) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: AI_SYSTEM_PROMPT,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) throw new Error("Request failed: " + res.status);
  const data = await res.json();
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  return text || "I couldn't come up with an answer to that one — try rephrasing?";
}

function AIAssistant() {
  const { t, dark, go } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const reply = await callClaude(next);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry — I couldn't reach the assistant just now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full shadow-lg"
          style={{ backgroundColor: ACCENT.paddy, color: "#fff" }}
        >
          <Icon name="Bot" size={19} />
          <span className="text-sm font-semibold hidden sm:inline">Ask AI Assistant</span>
        </button>
      )}
      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-5 sm:right-5 z-50 sm:w-96 flex flex-col" style={{ maxHeight: "min(640px, 100dvh)" }}>
          <div className="flex flex-col flex-1 sm:rounded-3xl overflow-hidden shadow-2xl border" style={{ backgroundColor: t.surface, borderColor: t.border }}>
            <div className="flex items-center justify-between px-4 py-3.5 border-b shrink-0" style={{ borderColor: t.border, backgroundColor: ACCENT.paddy }}>
              <div className="flex items-center gap-2">
                <Icon name="Bot" size={18} color="#fff" />
                <div>
                  <div className="text-sm font-bold text-white">AI Career Assistant</div>
                  <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.7)" }}>Live — answers from this platform's data</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1"><Icon name="X" size={20} color="#fff" /></button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
              {messages.length === 0 && (
                <div>
                  <p className="text-sm mb-3" style={{ color: t.muted }}>Ask me anything about majors, universities, or careers on this platform.</p>
                  <div className="flex flex-col gap-2">
                    {AI_SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => send(s)} className="text-left text-xs font-medium px-3 py-2.5 rounded-xl" style={{ backgroundColor: t.surfaceAlt, color: t.text }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={cx("max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap", m.role === "user" ? "self-end" : "self-start")}
                  style={{ backgroundColor: m.role === "user" ? ACCENT.saffron : t.surfaceAlt, color: m.role === "user" ? "#1A1206" : t.text }}>
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="self-start px-3.5 py-2.5 rounded-2xl" style={{ backgroundColor: t.surfaceAlt }}>
                  <Icon name="Loader2" size={16} color={t.muted} className="animate-spin" />
                </div>
              )}
            </div>

            <div className="p-3 border-t flex items-center gap-2 shrink-0" style={{ borderColor: t.border }}>
              <input
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder="Ask a question..." className="flex-1 px-3.5 py-2.5 rounded-full text-sm outline-none border"
                style={{ borderColor: t.border, backgroundColor: t.bg, color: t.text }}
              />
              <button onClick={() => send()} disabled={loading || !input.trim()} className="p-2.5 rounded-full disabled:opacity-40 shrink-0" style={{ backgroundColor: ACCENT.paddy, color: "#fff" }}>
                <Icon name="Send" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ================================================================
   Root App — routing, global state, theme provider
   ================================================================ */
export default function App() {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("en");
  const [view, setView] = useState("landing");
  const [params, setParams] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [compareList, setCompareListState] = useState({ majors: [], universities: [] });
  const [quizResults, setQuizResults] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [visited, setVisited] = useState(() => new Set(["landing"]));

  const t = dark ? PALETTE.dark : PALETTE.light;
  const L = (key) => (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;

  function go(nextView, nextParams) {
    setView(nextView);
    setParams(nextParams || {});
    setVisited((v) => new Set(v).add(nextView));
    setSearchOpen(false);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }
  function toggleFavorite(type, id) {
    setFavorites((f) => {
      const exists = f.some((x) => x.type === type && x.id === id);
      return exists ? f.filter((x) => !(x.type === type && x.id === id)) : [...f, { type, id }];
    });
  }
  function isFavorite(type, id) { return favorites.some((x) => x.type === type && x.id === id); }
  function toggleCompare(type, id) {
    setCompareListState((c) => {
      const list = c[type];
      if (list.includes(id)) return { ...c, [type]: list.filter((x) => x !== id) };
      if (list.length >= 4) return c;
      return { ...c, [type]: [...list, id] };
    });
  }
  function setCompareItems(type, ids) {
    setCompareListState((c) => ({ ...c, [type]: ids.slice(0, 4) }));
  }

  const ctx = {
    dark, toggleDark: () => setDark((d) => !d),
    t, lang, setLang, L,
    view, params, go,
    favorites, toggleFavorite, isFavorite,
    compareList, toggleCompare, setCompareItems,
    quizResults, setQuizResults, quizAnswers, setQuizAnswers,
    searchOpen, setSearchOpen, visited,
  };

  let Page;
  if (view === "landing") Page = <LandingPage />;
  else if (view === "quiz") Page = <QuizPage />;
  else if (view === "majors") Page = <MajorDirectory params={params} />;
  else if (view === "majorDetail") Page = <MajorDetail params={params} />;
  else if (view === "universities") Page = <UniversityDirectory />;
  else if (view === "universityDetail") Page = <UniversityDetail params={params} />;
  else if (view === "compare") Page = <ComparePage params={params} />;
  else if (view === "roadmap") Page = <RoadmapPage />;
  else if (view === "scholarships") Page = <ScholarshipsPage />;
  else if (view === "careers") Page = <CareersPage params={params} />;
  else if (view === "favorites") Page = <FavoritesPage />;
  else Page = <LandingPage />;

  return (
    <AppContext.Provider value={ctx}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        body, #root { font-family: ${FONT_BODY}; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .animate-fade-up { animation: fadeUp 0.6s ease-out both; }
        @keyframes dashDraw { from { stroke-dashoffset: 340; } to { stroke-dashoffset: 0; } }
        .route-draw path { stroke-dasharray: 340; animation: dashDraw 1.6s ease-out forwards; }
        @keyframes spinKf { to { transform: rotate(360deg); } }
        .animate-spin { animation: spinKf 1s linear infinite; }
        ::selection { background: ${ACCENT.saffron}; color: #1A1206; }
        button:focus-visible, input:focus-visible, a:focus-visible { outline: 2px solid ${ACCENT.mekong}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up, .route-draw path, .animate-spin { animation: none !important; }
        }
      `}</style>
      <div style={{ backgroundColor: t.bg, color: t.text, fontFamily: FONT_BODY, minHeight: "100vh" }}>
        <NavBar />
        {Page}
        <Footer />
        <GlobalSearchOverlay />
        <AIAssistant />
      </div>
    </AppContext.Provider>
  );
}

