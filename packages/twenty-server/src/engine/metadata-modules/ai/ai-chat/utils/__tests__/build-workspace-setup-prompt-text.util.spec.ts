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
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain(buildCompanyContextMessageText(companyEnrichment));
    expect(result).toContain('Domain: acme.com');
    expect(result).not.toContain('No information about the company');
  });

  it('should instruct a tailored greeting without a discovery question when a full enrichment is provided', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('tailored to their business');
    expect(result).not.toContain('You do not know what this company does yet');
  });

  it('should forbid every first-reply tool except ask_questions when a full enrichment is provided', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('required ask_questions call');
    expect(result).toContain('needs no skill and no learn_tools step');
    expect(result).toContain(
      'do not call load_skills, learn_tools, execute_tool, or web search',
    );
  });

  it('should require explicit approval before building and name the metadata tools when a full enrichment is provided', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

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
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment: null,
      locale: 'en',
    });

    expect(result).toContain('No information about the company');
    expect(result).not.toContain('Domain:');
  });

  it('should instruct an ask_questions discovery when the enrichment is null', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment: null,
      locale: 'en',
    });

    expect(result).toContain('You do not know what this company does yet');
    expect(result).toContain(
      'call ask_questions to learn what the business does',
    );
    expect(result).not.toContain('tailored to their business');
  });

  it.each([
    ['a full enrichment', companyEnrichment],
    ['a null enrichment', null],
  ])(
    'should stay invisible and never claim tools are already loaded when %s is provided',
    (_label, enrichment) => {
      const result = buildWorkspaceSetupPromptText({
        companyEnrichment: enrichment,
        locale: 'en',
      });

      expect(result).toContain('invisible');
      expect(result).not.toContain('already loaded');
    },
  );

  it('should ask about the data model with the ask_questions tool', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('Never stop after presenting the proposal');
    expect(result).toContain(
      'The turn is unfinished until you call ask_questions asking whether to go ahead and build it',
    );
    expect(result).toContain(
      'End this reply with the ask_questions call asking whether to build the proposed data model.',
    );
  });

  it('should require making the created fields visible in the views', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('view-building');
    expect(result).toContain('get_view_fields');
    expect(result).toContain('update_many_view_fields with isVisible true');
    expect(result).toContain('create_many_view_fields');
  });

  it('should require English names with labels in the user language', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'fr-FR',
    });

    expect(result).toContain('names must be in English');
    expect(result).toContain("must be in the user's language");
  });

  it('should require a tabler icon on every created object and field', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain(
      'Give every object and field you create a meaningful icon',
    );
    expect(result).toContain(
      'Tabler icon name in PascalCase prefixed with Icon',
    );
    expect(result).toContain('IconBuildingSkyscraper');
    expect(result).toContain('targetFieldIcon');
  });

  it.each([
    ['fr-FR', 'French'],
    ['de-DE', 'German'],
    ['pt-BR', 'Portuguese'],
    ['en', 'English'],
  ])(
    'should end with the locale instruction when the locale is %s',
    (locale, languageName) => {
      const result = buildWorkspaceSetupPromptText({
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
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: '!',
    });

    expect(result).toContain(
      'The user locale is !, please continue the discussion in that language.',
    );
  });
});
