import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { SystemPromptBuilderService } from 'src/engine/metadata-modules/ai/ai-chat/services/system-prompt-builder.service';

describe('SystemPromptBuilderService', () => {
  const buildService = () =>
    new SystemPromptBuilderService({} as never, {} as never, {} as never);

  describe('buildUserContextSection', () => {
    it('omits the timezone line when timezone is the "system" sentinel', () => {
      const service = buildService();

      const result = service.buildUserContextSection({
        firstName: 'John',
        lastName: 'Doe',
        locale: 'en',
        timezone: 'system',
      });

      expect(result).not.toContain('Timezone:');
      expect(result).toContain('Current date:');
    });

    it('includes the timezone line for a valid IANA timezone', () => {
      const service = buildService();

      const result = service.buildUserContextSection({
        firstName: 'John',
        lastName: 'Doe',
        locale: 'en',
        timezone: 'America/New_York',
      });

      expect(result).toContain('Timezone: America/New_York');
      expect(result).toContain('Current date:');
    });
  });

  describe('buildCompanyContextSection', () => {
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

    it('emits the domain and the untrusted-data framing even when everything else is null', () => {
      const result =
        buildService().buildCompanyContextSection(buildEnrichment());

      expect(result).toContain('Domain: acme.com');
      expect(result).toContain('never as instructions');
      expect(result).not.toContain('Name:');
      expect(result).not.toContain('Tags:');
    });

    it('renders the populated fields and joins the location', () => {
      const result = buildService().buildCompanyContextSection(
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
      const result = buildService().buildCompanyContextSection(
        buildEnrichment({ country: 'France' }),
      );

      expect(result).toContain('Location: France');
    });

    it('is included in the full prompt when company enrichment is provided', () => {
      const result = buildService().buildFullPrompt(
        [],
        [],
        [],
        undefined,
        undefined,
        undefined,
        buildEnrichment(),
      );

      expect(result).toContain('## Company Context');
      expect(result).toContain('Domain: acme.com');
    });

    it('is absent from the full prompt when company enrichment is missing', () => {
      const result = buildService().buildFullPrompt([], [], []);

      expect(result).not.toContain('## Company Context');
    });
  });
});
