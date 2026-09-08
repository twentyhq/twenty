// Shared constants for company auto-creation + enrichment.
//
// A Person arrives from any intake path (n8n REST, Lead Ads, DM, email, manual).
// If their email is a WORK email (non-personal domain), we create-or-restore a
// Company for that domain, link the person, then enrich the company from a chain
// of providers. None of this runs inline on the write — POST hooks only enqueue.

// Raw inserts/updates bypass the resolver that fills createdBy/updatedBy ACTOR
// from auth context (those columns are NOT NULL). Company auto-creation is
// system-generated, so stamp it SYSTEM. (Mirrors lead-pipeline's SYSTEM_ACTOR.)
export const SYSTEM_ACTOR = {
  source: 'SYSTEM',
  name: 'ENSO CRM',
  context: {},
} as const;

// Master kill-switch for ALL company automation (auto-create from work email,
// enrichment, AND company merge). Default OFF so the code can ship dormant and be
// activated deliberately — after the custom fields are provisioned and we've
// sanity-checked — by setting ENSO_COMPANY_AUTOMATION_ENABLED=true on the API
// service (twenty-server, where the query hooks fire). Checked at the enqueue
// choke-points, so when off nothing is queued and no jobs run.
export const isCompanyAutomationEnabled = (): boolean =>
  process.env.ENSO_COMPANY_AUTOMATION_ENABLED === 'true';

// Workspace-specific Company object metadata id (single prod workspace), used as
// timelineActivity.linkedObjectMetadataId so timeline rows can link to the
// company. (Same hardcoding pattern as PersonTimelineService's object ids.)
export const COMPANY_OBJECT_METADATA_ID =
  'adf37f19-46e1-419b-a27d-29ef4f11ae36';

// enrichmentStatus SELECT options on Company.
export const COMPANY_ENRICHMENT_STATUS = {
  PENDING: 'PENDING',
  ENRICHED: 'ENRICHED',
  PARTIAL: 'PARTIAL',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED',
} as const;

export type CompanyEnrichmentStatus =
  (typeof COMPANY_ENRICHMENT_STATUS)[keyof typeof COMPANY_ENRICHMENT_STATUS];

// industry SELECT options (broad standard taxonomy). Provider output is coerced
// to one of these via normalizeIndustry(); anything unmapped falls back to OTHER.
export const COMPANY_INDUSTRY_OPTIONS = [
  'AGRICULTURE',
  'AUTOMOTIVE',
  'CONSTRUCTION',
  'CONSUMER_GOODS',
  'EDUCATION',
  'ENERGY',
  'ENTERTAINMENT_MEDIA',
  'FINANCE_INSURANCE',
  'FOOD_BEVERAGE',
  'GOVERNMENT',
  'HEALTHCARE',
  'HOSPITALITY_TOURISM',
  'INFORMATION_TECHNOLOGY',
  'LEGAL_SERVICES',
  'LOGISTICS_TRANSPORT',
  'MANUFACTURING',
  'MARKETING_ADVERTISING',
  'NON_PROFIT',
  'PHARMACEUTICALS',
  'PROFESSIONAL_SERVICES',
  'REAL_ESTATE',
  'RETAIL_ECOMMERCE',
  'TELECOMMUNICATIONS',
  'UTILITIES',
  'WHOLESALE_DISTRIBUTION',
  'OTHER',
] as const;

export type CompanyIndustry = (typeof COMPANY_INDUSTRY_OPTIONS)[number];

// Keyword → industry option. Providers return free-text industries
// ("Information Technology & Services", "Real Estate", "SaaS", …); match on
// lowercased substring against this table. First match wins, so order from
// most-specific to most-generic where they could overlap.
const INDUSTRY_KEYWORD_MAP: {
  keywords: string[];
  industry: CompanyIndustry;
}[] = [
  { keywords: ['real estate', 'realty', 'property'], industry: 'REAL_ESTATE' },
  {
    keywords: ['construction', 'building', 'civil engineering', 'contractor'],
    industry: 'CONSTRUCTION',
  },
  {
    keywords: [
      'software',
      'saas',
      'information technology',
      'it services',
      'internet',
      'computer',
      'tech',
    ],
    industry: 'INFORMATION_TECHNOLOGY',
  },
  {
    keywords: ['telecom', 'telecommunication', 'wireless', 'mobile network'],
    industry: 'TELECOMMUNICATIONS',
  },
  {
    keywords: ['pharma', 'pharmaceutical', 'biotech'],
    industry: 'PHARMACEUTICALS',
  },
  {
    keywords: ['health', 'medical', 'hospital', 'clinic', 'dental', 'wellness'],
    industry: 'HEALTHCARE',
  },
  {
    keywords: [
      'bank',
      'finance',
      'financial',
      'insurance',
      'fintech',
      'investment',
      'capital',
    ],
    industry: 'FINANCE_INSURANCE',
  },
  {
    keywords: ['legal', 'law', 'attorney', 'notary'],
    industry: 'LEGAL_SERVICES',
  },
  {
    keywords: [
      'marketing',
      'advertising',
      'agency',
      'pr ',
      'public relations',
      'media buying',
    ],
    industry: 'MARKETING_ADVERTISING',
  },
  {
    keywords: [
      'media',
      'entertainment',
      'film',
      'music',
      'gaming',
      'publishing',
      'broadcast',
    ],
    industry: 'ENTERTAINMENT_MEDIA',
  },
  {
    keywords: [
      'education',
      'school',
      'university',
      'training',
      'e-learning',
      'edtech',
    ],
    industry: 'EDUCATION',
  },
  {
    keywords: [
      'hospitality',
      'hotel',
      'tourism',
      'travel',
      'restaurant',
      'horeca',
      'catering',
    ],
    industry: 'HOSPITALITY_TOURISM',
  },
  {
    keywords: ['food', 'beverage', 'drink', 'brewery', 'winery'],
    industry: 'FOOD_BEVERAGE',
  },
  {
    keywords: ['automotive', 'auto ', 'car ', 'vehicle', 'dealership'],
    industry: 'AUTOMOTIVE',
  },
  {
    keywords: ['agriculture', 'farming', 'agro', 'agritech'],
    industry: 'AGRICULTURE',
  },
  {
    keywords: [
      'energy',
      'oil',
      'gas',
      'solar',
      'renewable',
      'power generation',
    ],
    industry: 'ENERGY',
  },
  {
    keywords: ['utility', 'utilities', 'water', 'electricity'],
    industry: 'UTILITIES',
  },
  {
    keywords: [
      'logistics',
      'transport',
      'shipping',
      'freight',
      'courier',
      'delivery',
    ],
    industry: 'LOGISTICS_TRANSPORT',
  },
  {
    keywords: ['manufacturing', 'industrial', 'factory', 'production'],
    industry: 'MANUFACTURING',
  },
  {
    keywords: ['wholesale', 'distribution', 'distributor', 'import', 'export'],
    industry: 'WHOLESALE_DISTRIBUTION',
  },
  {
    keywords: [
      'retail',
      'e-commerce',
      'ecommerce',
      'shop',
      'store',
      'commerce',
    ],
    industry: 'RETAIL_ECOMMERCE',
  },
  {
    keywords: ['consumer goods', 'fmcg', 'apparel', 'cosmetics', 'furniture'],
    industry: 'CONSUMER_GOODS',
  },
  {
    keywords: ['government', 'public sector', 'municipal', 'ministry'],
    industry: 'GOVERNMENT',
  },
  {
    keywords: ['non-profit', 'nonprofit', 'ngo', 'charity', 'foundation'],
    industry: 'NON_PROFIT',
  },
  {
    keywords: [
      'consulting',
      'professional services',
      'accounting',
      'audit',
      'hr ',
      'recruiting',
    ],
    industry: 'PROFESSIONAL_SERVICES',
  },
];

// Coerce a free-text provider industry to one of COMPANY_INDUSTRY_OPTIONS.
// Returns null when the input is empty (so we don't overwrite with OTHER on a
// provider that simply didn't return an industry).
export const normalizeIndustry = (
  raw: string | null | undefined,
): CompanyIndustry | null => {
  if (!raw) {
    return null;
  }

  const haystack = raw.toLowerCase();
  const match = INDUSTRY_KEYWORD_MAP.find(({ keywords }) =>
    keywords.some((keyword) => haystack.includes(keyword)),
  );

  return match?.industry ?? 'OTHER';
};
