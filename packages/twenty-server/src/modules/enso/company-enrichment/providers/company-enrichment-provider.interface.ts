// Provider-agnostic enrichment contract. Each provider takes a company's domain
// (and whatever we already know) and returns whatever firmographics it can find.
// Providers run as an ordered chain (see CompanyEnrichmentService), cheap/offline
// first and richer/paid last. Each provider receives the result accumulated so
// far as input (so a registry provider can look up by the name an earlier
// provider resolved), and a non-empty value from a LATER provider overrides an
// earlier one for the same field. So array order == quality order, low to high.

export type CompanyEnrichmentInput = {
  // Registrable domain, e.g. "acme.ro" (no scheme, no www).
  domain: string;
  // Best name known so far (derived from domain or an earlier provider).
  name?: string;
  // Legal name / registration number known so far — lets registry providers
  // look up by identifier instead of guessing from the domain.
  legalName?: string;
  registrationNumber?: string;
};

// All fields optional — a provider returns only what it found. Numbers are raw
// (employees as a count, revenue as a yearly amount in the company's currency).
export type CompanyEnrichmentResult = {
  name: string;
  legalName: string;
  // Free-text industry; normalized to the SELECT option downstream.
  industry: string;
  description: string;
  foundedYear: number;
  employees: number;
  registrationNumber: string;
  addressCity: string;
  addressCountry: string;
  addressState: string;
  addressStreet1: string;
  addressPostcode: string;
  phone: string;
  linkedinUrl: string;
  xUrl: string;
  // Estimated/known annual revenue (used to populate annualRecurringRevenue).
  annualRevenueAmount: number;
};

export type PartialCompanyEnrichment = Partial<CompanyEnrichmentResult>;

export interface CompanyEnrichmentProvider {
  // Stable identifier for logging/telemetry, e.g. "twenty-companies".
  readonly providerName: string;

  // Skipped silently when false (e.g. paid provider with no API key set).
  isEnabled(): boolean;

  // Returns found fields, or null when nothing was found / the lookup failed.
  // Implementations must never throw — the chain treats a throw as null.
  enrich(
    input: CompanyEnrichmentInput,
  ): Promise<PartialCompanyEnrichment | null>;
}

// DI token for the ordered provider array. Order in the array == chain order.
export const COMPANY_ENRICHMENT_PROVIDERS = Symbol(
  'COMPANY_ENRICHMENT_PROVIDERS',
);
