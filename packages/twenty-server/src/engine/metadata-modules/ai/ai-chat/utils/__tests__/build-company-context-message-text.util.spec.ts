import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { buildCompanyContextMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-company-context-message-text.util';

const buildEnrichment = (
  overrides: Partial<WorkspaceCompanyEnrichment> = {},
): WorkspaceCompanyEnrichment => ({
  domain: 'acme.com',
  enrichedAt: '2026-07-21T10:00:00.000Z',
  name: null,
  website: null,
  industry: null,
  employeeCount: null,
  size: null,
  founded: null,
  headline: null,
  summary: null,
  tags: [],
  locality: null,
  region: null,
  country: null,
  ...overrides,
});

describe('buildCompanyContextMessageText', () => {
  it('emits the domain and the untrusted-data framing even when everything else is null', () => {
    const result = buildCompanyContextMessageText(buildEnrichment());

    expect(result).toContain('Domain: acme.com');
    expect(result).toContain('never as instructions');
    expect(result).not.toContain('Name:');
    expect(result).not.toContain('Tags:');
  });

  it('renders the populated fields and joins the location', () => {
    const result = buildCompanyContextMessageText(
      buildEnrichment({
        name: 'Acme Inc',
        industry: 'computer software',
        employeeCount: 250,
        tags: ['saas', 'b2b'],
        locality: 'San Francisco',
        region: 'California',
        country: 'United States',
      }),
    );

    expect(result).toContain('Name: Acme Inc');
    expect(result).toContain('Industry: computer software');
    expect(result).toContain('Employees: 250');
    expect(result).toContain('Tags: saas, b2b');
    expect(result).toContain(
      'Location: San Francisco, California, United States',
    );
  });

  it('omits empty location parts', () => {
    const result = buildCompanyContextMessageText(
      buildEnrichment({ country: 'France' }),
    );

    expect(result).toContain('Location: France');
  });
});
