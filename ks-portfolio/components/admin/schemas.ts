import { ListSectionKey } from "@/lib/types";
import { SKILL_LEVELS } from "@/lib/defaultData";
import { SOCIAL_ICON_KEYS } from "@/components/icons";

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "image" | "images";
  options?: string[];
  optional?: boolean;
}

export interface SchemaDef {
  title: string;
  plural: string;
  fields: FieldDef[];
  primary: string;
  secondary: (item: any) => string;
}

/**
 * Every list-backed section on the site (Skills, Experience, Education,
 * Projects, Achievements, Socials) is driven by one entry here plus the
 * shared <ListEditor/> component — adding a future section only needs one
 * new entry in this object, a matching key on SiteData, and one render
 * block on the public page. See README → "Adding a new section".
 */
export const SCHEMAS: Record<ListSectionKey, SchemaDef> = {
  skills: {
    title: "Skill",
    plural: "Skills",
    fields: [
      { key: "name", label: "Language / tool", type: "text" },
      { key: "level", label: "Proficiency", type: "select", options: Object.keys(SKILL_LEVELS) }
    ],
    primary: "name",
    secondary: (i) => i.level
  },
  experience: {
    title: "Experience entry",
    plural: "Experience entries",
    fields: [
      { key: "role", label: "Role / title", type: "text" },
      { key: "company", label: "Company / organisation", type: "text" },
      { key: "period", label: "Period (e.g. 2024 — Present)", type: "text" },
      { key: "description", label: "Description", type: "textarea" }
    ],
    primary: "role",
    secondary: (i) => `${i.company} · ${i.period}`
  },
  education: {
    title: "Education entry",
    plural: "Education entries",
    fields: [
      { key: "degree", label: "Degree / program", type: "text" },
      { key: "institution", label: "Institution", type: "text" },
      { key: "period", label: "Period", type: "text" },
      { key: "description", label: "Description", type: "textarea" }
    ],
    primary: "degree",
    secondary: (i) => `${i.institution} · ${i.period}`
  },
  projects: {
    title: "Project",
    plural: "Projects",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "year", label: "Year", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "projectUrl", label: "Project URL (optional — live demo or repo)", type: "text", optional: true },
      { key: "imageUrl", label: "Project image (optional)", type: "image", optional: true }
    ],
    primary: "title",
    secondary: (i) => i.year
  },
  achievements: {
    title: "Achievement",
    plural: "Achievements",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "year", label: "Year", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "credentialUrl", label: "Credential URL (optional)", type: "text", optional: true },
      {
        key: "imageUrls",
        label: "Images (optional — shown as a swipeable carousel when the card is opened)",
        type: "images",
        optional: true
      }
    ],
    primary: "title",
    secondary: (i) => i.year
  },
  socials: {
    title: "Social link",
    plural: "Social links",
    fields: [
      { key: "label", label: "Platform name", type: "text" },
      { key: "url", label: "URL", type: "text" },
      { key: "icon", label: "Icon", type: "select", options: SOCIAL_ICON_KEYS }
    ],
    primary: "label",
    secondary: (i) => i.url
  }
};

export function uid(): string {
  return "id_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
