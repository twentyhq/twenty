import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { buildCompanyContextMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-company-context-message-text.util';
import { buildWorkspaceSetupKickoffMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-setup-kickoff-message-text.util';

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

describe('buildWorkspaceSetupKickoffMessageText', () => {
  it('should carry the company context when a full enrichment is provided', () => {
    const result = buildWorkspaceSetupKickoffMessageText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain(buildCompanyContextMessageText(companyEnrichment));
    expect(result).toContain('Domain: acme.com');
    expect(result).not.toContain('No information about the company');
  });

  it('should state that no company information is available when the enrichment is null', () => {
    const result = buildWorkspaceSetupKickoffMessageText({
      companyEnrichment: null,
      locale: 'en',
    });

    expect(result).toContain(
      'No information about the company that owns this workspace is available.',
    );
    expect(result).not.toContain('Domain:');
  });

  it('should carry no instructions besides the locale line', () => {
    const result = buildWorkspaceSetupKickoffMessageText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).not.toContain('ask_questions');
    expect(result).not.toContain('complete_workspace_setup');
    expect(result).not.toContain('##');
  });

  it.each([
    ['fr-FR', 'French'],
    ['de-DE', 'German'],
    ['pt-BR', 'Portuguese'],
    ['en', 'English'],
  ])(
    'should end with the locale instruction when the locale is %s',
    (locale, languageName) => {
      const result = buildWorkspaceSetupKickoffMessageText({
        companyEnrichment,
        locale,
      });

      expect(
        result.endsWith(
          `The user locale is ${languageName}, please continue the discussion in that language.`,
        ),
      ).toBe(true);
    },
  );

  it('should fall back to the raw locale when it is not a structurally valid language tag', () => {
    const result = buildWorkspaceSetupKickoffMessageText({
      companyEnrichment,
      locale: '!',
    });

    expect(result).toContain(
      'The user locale is !, please continue the discussion in that language.',
    );
  });
});
