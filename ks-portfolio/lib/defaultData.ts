import { SiteData } from "./types";

export const DEFAULT_DATA: SiteData = {
  brand: {
    logoUrl: ""
  },
  hero: {
    name: "Krishna Sharan Shrestha",
    role: "// AI & Machine Learning Enthusiast",
    tagline: "Exploring how machines learn, reason, and see — one model at a time.",
    cta1Label: "View my work",
    cta1Url: "#experience",
    cta2Label: "Get in touch",
    cta2Url: "#contact"
  },
  about: {
    initials: "KS",
    photoUrl: "",
    resumeUrl: "",
    resumeName: "",
    bio: "I'm Krishna — an AI and ML enthusiast who enjoys turning messy data into models that actually work. I like breaking down how things learn, and I'm always experimenting with something new.",
    tags: ["Machine Learning", "Deep Learning", "Computer Vision"]
  },
  skills: [],
  experience: [],
  education: [],
  projects: [],
  achievements: [],
  socials: []
};

/** Proficiency labels shown in the admin form, mapped to a fill % for the bar on the live site. */
export const SKILL_LEVELS: Record<string, number> = {
  Beginner: 30,
  Intermediate: 55,
  Advanced: 80,
  Expert: 100
};
