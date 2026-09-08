// Company identity resolution (mirrors person-merge). Two companies are the same
// legal entity when they share a registration number (VAT / RO CUI / MD IDNO) or
// a registrable domain. The registration-number match is the real new capability:
// it merges "acme.ro" and "acme.com" once enrichment resolves their shared VAT —
// something domain-at-creation dedup can't catch. legalName is deliberately NOT a
// match key (e.g. "SC Construct SRL" is far too common — it would over-merge).

// Relations whose company foreign key must be re-pointed from a merged-away
// duplicate to the kept Company. Each reassignment is best-effort (try/catch) so a
// unique-constraint clash on one junction never aborts the whole merge.
export const COMPANY_RELATION_REASSIGNMENTS: {
  object: string;
  field: string;
}[] = [
  { object: 'person', field: 'companyId' },
  { object: 'opportunity', field: 'companyId' },
  { object: 'taskTarget', field: 'targetCompanyId' },
  { object: 'noteTarget', field: 'targetCompanyId' },
  { object: 'attachment', field: 'targetCompanyId' },
  { object: 'timelineActivity', field: 'targetCompanyId' },
];

// Scalar keeper fields backfilled from a duplicate when the keeper's is empty.
// Composite fields (domainName, address, phones, links, currency) are handled
// separately in the executor because they're written nested.
export const COMPANY_SCALAR_BACKFILL_FIELDS = [
  'name',
  'legalName',
  'industry',
  'registrationNumber',
  'description',
  'foundedYear',
  'employees',
  'accountOwnerId',
] as const;

// Normalize a registration number for equality: uppercase, drop everything but
// A–Z/0–9 ("RO 12 345 678" === "ro12345678").
export const normalizeRegistrationNumber = (
  value: string | null | undefined,
): string => (value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// The digit core, used as a formatting-agnostic ILIKE prefilter before the JS
// normalized-equality confirm. Most VAT/CUI/IDNO values are predominantly digits.
export const registrationDigitCore = (
  value: string | null | undefined,
): string => (value ?? '').replace(/\D/g, '');

// A reg number must have at least this many digits to be a usable match key
// (guards against matching on a stray "1" or a country prefix alone).
export const MIN_REGISTRATION_DIGITS = 4;
