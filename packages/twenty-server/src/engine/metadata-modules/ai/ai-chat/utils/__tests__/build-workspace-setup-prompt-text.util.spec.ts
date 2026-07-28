import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { buildCompanyContextMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-company-context-message-text.util';
import { buildWorkspaceSetupPromptText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-setup-prompt-text.util';

const companyEnrichment: WorkspaceCompanyEnrichment = {
  domain: 'acme.com',
  enrichedAt: '2026-07-21T10:00:00.000Z',
  name: 'Acme Inc',
  website: 'https://acme.com',
  industry: 'computer software',
  employeeCount: 250,
  size: '51-200',
  founded: 2015,
  headline: 'Anvils as a service',
  summary: 'Acme sells anvils to coyotes.',
  tags: ['saas', 'b2b'],
  locality: 'San Francisco',
  region: 'California',
  country: 'United States',
};

describe('buildWorkspaceSetupPromptText', () => {
  it('should embed the company context message text when a full enrichment is provided', () => {
    const result = buildWorkspaceSetupPromptText(companyEnrichment);

    expect(result).toContain(buildCompanyContextMessageText(companyEnrichment));
    expect(result).toContain('Domain: acme.com');
    expect(result).not.toContain('No information about the company');
  });

  it('should instruct a tailored greeting without a discovery question when a full enrichment is provided', () => {
    const result = buildWorkspaceSetupPromptText(companyEnrichment);

    expect(result).toContain('tailored to their business');
    expect(result).not.toContain('You do not know what this company does yet');
    expect(result).not.toContain('one short question');
  });

  it('should forbid tool calls on the first reply when a full enrichment is provided', () => {
    const result = buildWorkspaceSetupPromptText(companyEnrichment);

    expect(result).toContain('do not call any tools');
  });

  it('should require explicit approval before building and name the metadata tools when a full enrichment is provided', () => {
    const result = buildWorkspaceSetupPromptText(companyEnrichment);

    expect(result).toContain('Only propose until the user explicitly approves');
    expect(result).toContain(
      'never create, update, or delete anything before approval',
    );
    expect(result).toContain('metadata-building');
    expect(result).toContain('create_many_object_metadata');
    expect(result).toContain('create_many_field_metadata');
    expect(result).toContain('create_many_relation_fields');
  });

  it('should state that no company information is available when the enrichment is null', () => {
    const result = buildWorkspaceSetupPromptText(null);

    expect(result).toContain('No information about the company');
    expect(result).not.toContain('Domain:');
  });

  it('should instruct a plain-text discovery question when the enrichment is null', () => {
    const result = buildWorkspaceSetupPromptText(null);

    expect(result).toContain('You do not know what this company does yet');
    expect(result).toContain('one short question');
    expect(result).not.toContain('tailored to their business');
  });

  it.each([
    ['a full enrichment', companyEnrichment],
    ['a null enrichment', null],
  ])(
    'should stay invisible and never claim tools are already loaded when %s is provided',
    (_label, enrichment) => {
      const result = buildWorkspaceSetupPromptText(enrichment);

      expect(result).toContain('invisible');
      expect(result).not.toContain('already loaded');
    },
  );
});
