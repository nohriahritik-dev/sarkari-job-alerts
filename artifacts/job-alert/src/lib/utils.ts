import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Keyed by category slug
export const CATEGORY_COLORS: Record<string, string> = {
  "research-science":    "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "medical":             "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "management-admin":    "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "teaching":            "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "judiciary":           "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "defence":             "bg-red-500/10 text-red-400 border-red-500/20",
  "technical-iti":       "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "it-software":         "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "finance-accounts":    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "banking":             "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "engineering":         "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "clerk-typist":        "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "psu":                 "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "apprentice":          "bg-lime-500/10 text-lime-400 border-lime-500/20",
  "ssc":                 "bg-blue-600/10 text-blue-300 border-blue-600/20",
  "police":              "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "state-govt":          "bg-green-500/10 text-green-400 border-green-500/20",
  "education-training":  "bg-yellow-600/10 text-yellow-300 border-yellow-600/20",
  "healthcare-support":  "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  "railways":            "bg-orange-600/10 text-orange-300 border-orange-600/20",
  "agriculture-forestry":"bg-green-600/10 text-green-300 border-green-600/20",
  "law-security":        "bg-violet-600/10 text-violet-300 border-violet-600/20",
  "upsc":                "bg-purple-600/10 text-purple-300 border-purple-600/20",
  "state-psc":           "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "other":               "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export function getCategoryColor(slug: string): string {
  return CATEGORY_COLORS[slug] ?? CATEGORY_COLORS["other"];
}

export const CATEGORY_NAMES: Record<string, string> = {
  "research-science":    "Research & Science",
  "medical":             "Medical",
  "management-admin":    "Management & Admin",
  "teaching":            "Teaching",
  "judiciary":           "Judiciary",
  "defence":             "Defence",
  "technical-iti":       "Technical & ITI",
  "it-software":         "IT & Software",
  "finance-accounts":    "Finance & Accounts",
  "banking":             "Banking",
  "engineering":         "Engineering",
  "clerk-typist":        "Clerk & Typist",
  "psu":                 "PSU",
  "apprentice":          "Apprentice",
  "ssc":                 "SSC",
  "police":              "Police",
  "state-govt":          "State Govt",
  "education-training":  "Education & Training",
  "healthcare-support":  "Healthcare Support",
  "railways":            "Railway",
  "agriculture-forestry":"Agriculture & Forestry",
  "law-security":        "Law & Security",
  "upsc":                "UPSC",
  "state-psc":           "State PSC",
  "other":               "Other",
};

export function getCategoryName(slug: string): string {
  return CATEGORY_NAMES[slug] ?? slug;
}
