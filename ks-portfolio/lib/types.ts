export interface BrandData {
  logoUrl: string;
}

export interface HeroData {
  name: string;
  role: string;
  tagline: string;
  cta1Label: string;
  cta1Url: string;
  cta2Label: string;
  cta2Url: string;
}

export interface AboutData {
  initials: string;
  photoUrl: string;
  resumeUrl: string;
  resumeName: string;
  bio: string;
  tags: string[];
}

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface SkillItem {
  id: string;
  name: string;
  level: SkillLevel;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  year: string;
  description: string;
  projectUrl: string;
  imageUrl: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  year: string;
  description: string;
  credentialUrl: string;
  /** Multiple images shown as a swipeable carousel in the expanded card view. */
  imageUrls: string[];
}

export type SocialIcon =
  | "github"
  | "linkedin"
  | "twitter"
  | "email"
  | "kaggle"
  | "huggingface"
  | "medium"
  | "link";

export interface SocialItem {
  id: string;
  label: string;
  url: string;
  icon: SocialIcon;
}

export interface SiteData {
  brand: BrandData;
  hero: HeroData;
  about: AboutData;
  skills: SkillItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  achievements: AchievementItem[];
  socials: SocialItem[];
}

/** Every list-backed section the generic admin engine knows how to edit. */
export type ListSectionKey = "skills" | "experience" | "education" | "projects" | "achievements" | "socials";
