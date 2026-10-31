export type JobFamily = "Design Engineer" | "Product Builder" | "GTM Engineer";

export interface Job {
  id: string;
  title: string;
  company: string;
  family: JobFamily;
  location: string;
  mode: "remote" | "hybrid" | "onsite" | null;
  seniority: string | null;
  salary: string | null;
  firstSeen: string;
  lastChecked: string;
  skills: string[];
  url: string;
}

export interface JobsData {
  generatedFrom: string;
  lastCheck: string;
  stats: { open: number; newThisWeek: number; closedThisWeek: number };
  jobs: Job[];
}
