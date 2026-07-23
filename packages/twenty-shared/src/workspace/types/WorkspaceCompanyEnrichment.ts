export type WorkspaceCompanyEnrichment = {
  domain: string;
  enrichedAt: string;
  name: string | null;
  website: string | null;
  industry: string | null;
  employeeCount: number | null;
  size: string | null;
  founded: number | null;
  headline: string | null;
  summary: string | null;
  tags: string[];
  locality: string | null;
  region: string | null;
  country: string | null;
};
