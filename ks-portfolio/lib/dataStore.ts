import fs from "fs";
import path from "path";
import { SiteData } from "./types";
import { DEFAULT_DATA } from "./defaultData";

const DATA_FILE = path.join(process.cwd(), "data", "site-data.json");

function normalize(raw: any): SiteData {
  return {
    brand: { ...DEFAULT_DATA.brand, ...(raw?.brand || {}) },
    hero: { ...DEFAULT_DATA.hero, ...(raw?.hero || {}) },
    about: { ...DEFAULT_DATA.about, ...(raw?.about || {}) },
    skills: Array.isArray(raw?.skills) ? raw.skills : [],
    experience: Array.isArray(raw?.experience) ? raw.experience : [],
    education: Array.isArray(raw?.education) ? raw.education : [],
    projects: Array.isArray(raw?.projects)
      ? raw.projects.map((p: any) => ({ projectUrl: "", imageUrl: "", ...p }))
      : [],
    achievements: Array.isArray(raw?.achievements)
      ? raw.achievements.map((a: any) => {
          // Migrate any older single-imageUrl shape into the array form.
          const imageUrls: string[] = Array.isArray(a?.imageUrls) ? a.imageUrls : a?.imageUrl ? [a.imageUrl] : [];
          return { credentialUrl: "", ...a, imageUrls };
        })
      : [],
    socials: Array.isArray(raw?.socials) ? raw.socials : []
  };
}

/** Reads the site's content from disk, seeding it with defaults on first run. */
export function getSiteData(): SiteData {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      saveSiteData(DEFAULT_DATA);
      return DEFAULT_DATA;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return normalize(JSON.parse(raw));
  } catch {
    return DEFAULT_DATA;
  }
}

/** Persists the full site content object back to disk. */
export function saveSiteData(data: SiteData): void {
  const clean = normalize(data);
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(clean, null, 2), "utf-8");
}
