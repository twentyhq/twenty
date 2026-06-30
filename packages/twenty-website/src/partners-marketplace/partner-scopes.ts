export type PartnerScope =
  | 'ADVISORY'
  | 'SOLUTIONING'
  | 'DEVELOPMENT'
  | 'HOSTING'
  | 'SUPPORT';

// The macro categories a partner operates in (labelled "Categories" in the
// CRM). Mirrors the Partner.partnerScope MULTI_SELECT in the twenty-partners
// CRM (the source of truth); unknown values fall back to title-case.
export const PARTNER_SCOPES: readonly PartnerScope[] = [
  'ADVISORY',
  'SOLUTIONING',
  'DEVELOPMENT',
  'HOSTING',
  'SUPPORT',
];
