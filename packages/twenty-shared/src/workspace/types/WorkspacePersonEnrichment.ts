export type WorkspacePersonEnrichment = {
  email: string;
  enrichedAt: string;
  fullName: string | null;
  jobTitle: string | null;
  jobTitleLevels: string[];
  jobCompanyName: string | null;
  industry: string | null;
  headline: string | null;
  linkedinUrl: string | null;
  skills: string[];
  locality: string | null;
  region: string | null;
  country: string | null;
};
