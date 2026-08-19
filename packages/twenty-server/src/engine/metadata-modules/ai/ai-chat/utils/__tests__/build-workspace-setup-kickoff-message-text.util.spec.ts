import {
  type WorkspaceCompanyEnrichment,
  type WorkspacePersonEnrichment,
} from 'twenty-shared/workspace';

import { type WorkspaceSetupWorkspaceContext } from 'src/engine/metadata-modules/ai/ai-chat/types/workspace-setup-workspace-context.type';
import { buildCompanyContextMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-company-context-message-text.util';
import { buildPersonContextMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-person-context-message-text.util';
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

const personEnrichment: WorkspacePersonEnrichment = {
  email: 'admin@acme.com',
  enrichedAt: '2026-07-21T10:00:00.000Z',
  fullName: 'Ada Lovelace',
  jobTitle: 'Head of Sales',
  jobTitleLevels: ['director'],
  jobCompanyName: 'Acme Inc',
  industry: 'computer software',
  headline: 'Selling anvils at scale',
  linkedinUrl: 'linkedin.com/in/ada',
  skills: ['sales', 'negotiation'],
  locality: 'Paris',
  region: 'Ile-de-France',
  country: 'France',
};

const workspaceContext: WorkspaceSetupWorkspaceContext = {
  workspaceDisplayName: 'Acme',
  workspaceSubdomain: 'acme',
  userEmail: 'admin@acme.com',
};

const buildMessage = (
  overrides: Partial<
    Parameters<typeof buildWorkspaceSetupKickoffMessageText>[0]
  > = {},
) =>
  buildWorkspaceSetupKickoffMessageText({
    companyEnrichment,
    personEnrichment: null,
    workspaceContext,
    locale: 'en',
    ...overrides,
  });

describe('buildWorkspaceSetupKickoffMessageText', () => {
  it('should carry the company context when a full enrichment is provided', () => {
    const result = buildMessage();

    expect(result).toContain(buildCompanyContextMessageText(companyEnrichment));
    expect(result).toContain('Domain: acme.com');
    expect(result).not.toContain('No information about the company');
  });

  it('should state that no company information is available when the enrichment is null', () => {
    const result = buildMessage({ companyEnrichment: null });

    expect(result).toContain(
      'No information about the company that owns this workspace is available.',
    );
    expect(result).not.toContain('Domain:');
  });

  it('should carry the person context when a person enrichment is provided', () => {
    const result = buildMessage({ personEnrichment });

    expect(result).toContain(buildPersonContextMessageText(personEnrichment));
    expect(result).toContain('Job title: Head of Sales');
    expect(result).not.toContain('No third-party information about the person');
  });

  it('should state that no person information is available when the person enrichment is null', () => {
    const result = buildMessage();

    expect(result).toContain(
      'No third-party information about the person setting up this workspace is available.',
    );
  });

  it('should always carry the workspace context line', () => {
    const result = buildMessage();

    expect(result).toContain(
      'This workspace is named "Acme" (subdomain: acme). The admin setting it up signed up with admin@acme.com.',
    );
  });

  it('should carry no instructions besides the locale line', () => {
    const result = buildMessage({ personEnrichment });

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
      const result = buildMessage({ locale });

      expect(
        result.endsWith(
          `The user locale is ${languageName}, please continue the discussion in that language.`,
        ),
      ).toBe(true);
    },
  );

  it('should fall back to the raw locale when it is not a structurally valid language tag', () => {
    const result = buildMessage({ locale: '!' });

    expect(result).toContain(
      'The user locale is !, please continue the discussion in that language.',
    );
  });
});
