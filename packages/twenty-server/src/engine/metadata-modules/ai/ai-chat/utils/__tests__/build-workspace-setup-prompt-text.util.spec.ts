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
    expect(result).toContain('Do not greet them again');
    expect(result).toContain('what you already know about their company');
    expect(result).toContain('When their job title is in your user context');
    expect(result).toContain('when it is missing, do not guess it');
    expect(result).not.toContain('what they want to use Twenty for');
    expect(result).not.toContain('You do not know what this company does yet');
  });

  it('should forbid every first-reply tool except ask_questions when a full enrichment is provided', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('required ask_questions call');
    expect(result).toContain(
      'reply is unfinished until the ask_questions call is made',
    );
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
    expect(result).toContain('never set isNullable false');
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
    expect(result).toContain('ask_questions to learn what the business does');
    expect(result).toContain('when they start fresh');
    expect(result).not.toContain('tailored to their business');
  });

  it.each([
    ['a full enrichment', companyEnrichment],
    ['a null enrichment', null],
  ])(
    'should open with the migration-or-scratch question when %s is provided',
    (_label, enrichment) => {
      const result = buildWorkspaceSetupPromptText({
        companyEnrichment: enrichment,
        locale: 'en',
      });

      expect(result).toContain(
        'moving over from another CRM or starting fresh',
      );
      expect(result).toContain('follow the migration path below');
    },
  );

  it.each([
    ['a full enrichment', companyEnrichment],
    ['a null enrichment', null],
  ])(
    'should make the migration-or-scratch question a tool call rather than text when %s is provided',
    (_label, enrichment) => {
      const result = buildWorkspaceSetupPromptText({
        companyEnrichment: enrichment,
        locale: 'en',
      });

      expect(result).toContain(
        'Then stop writing and make the ask_questions call',
      );
      expect(result).toContain('its options');
      expect(result).toContain('never give that question a title of its own');
      expect(result).not.toContain('Close this reply with an ask_questions');
    },
  );

  it('should request the CRM export in plain text so the upload composer stays available', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('end that reply without calling ask_questions');
    expect(result).toContain('cannot take attachments');
    expect(result).toContain('upload all their CSV exports at once');
  });

  it('should tolerate spreadsheets, propose right away, and fall back to scratch without an export', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('spreadsheet their CRM produces');
    expect(result).toContain('as separate files');
    expect(result).toContain('read them right away');
    expect(result).toContain('continue as if they had chosen to start fresh');
  });

  it('should inspect uploaded exports through code_interpreter before proposing the model', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('code_interpreter');
    expect(result).toContain('headers and a few sample rows');
    expect(result).toContain('grounded in what they actually have');
  });

  it('should import migrated rows with the Bulk Import recipe right after the model is built', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('data-manipulation');
    expect(result).toContain('Bulk Import recipe');
    expect(result).toContain('as soon as the model is built');
    expect(result).toContain('so one approval covers both');
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
      expect(result).toContain('follow these rules silently');
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
      'the general guidance about skipping questions with obvious defaults does not apply',
    );
  });

  it('should not instruct any view work since new fields are visible by default', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('New fields land visible on their object');
    expect(result).not.toContain('view-building');
    expect(result).not.toContain('get_view_fields');
    expect(result).not.toContain('create_many_view_fields');
    expect(result).not.toContain('update_many_view_fields');
  });

  it.each([
    ['a full enrichment', companyEnrichment],
    ['a null enrichment', null],
  ])(
    'should introduce the agent and the walkthrough when %s is provided',
    (_label, enrichment) => {
      const result = buildWorkspaceSetupPromptText({
        companyEnrichment: enrichment,
        locale: 'en',
      });

      expect(result).toContain(
        'you are an AI agent who will walk them through Twenty',
      );
    },
  );

  it('should teach each capability where it comes up', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('one plain sentence');
    expect(result).toContain('before proposing anything that uses it');
    expect(result).toContain('fully customizable');
    expect(result).toContain('Settings > Data model');
    expect(result).toContain('sidebar under Workflows');
    expect(result).toContain('sidebar under Dashboards');
  });

  it('should require a title per reply and chips for objects', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('Open each reply with a short plain title');
    expect(result).toContain('title each new step');
    expect(result).toContain('Write objects as chips');
  });

  it('should never re-ask for something the user already approved', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('ask_questions is for new decisions');
    expect(result).toContain('Load a skill before proposing what it builds');
  });

  it('should name the plain-text question as the failure mode to avoid', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain(
      'a question mark in your text means the call is missing',
    );
  });

  it('should keep ask_questions options within the single-recommended limit', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('at most one of them marked recommended');
  });

  it('should anchor the proposal on admission tests instead of numeric bands', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('filter, sort, or report on it');
    expect(result).toContain('own lifecycle');
    expect(result).toContain('not a demo');
    expect(result).not.toContain('2 to 4 custom objects');
    expect(result).not.toContain('3 to 6 key fields');
    expect(result).not.toContain('under 250 words');
  });

  it('should propose tailored workflows built with the workflow tools', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('workflow-building');
    expect(result).toContain('create_complete_workflow');
    expect(result).toContain('validate_workflow');
  });

  it('should let the agent choose what to propose instead of following a script', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('Nothing after that is a fixed sequence');
    expect(result).toContain('which single capability to propose next');
    expect(result).toContain('Name the thing in their business it improves');
  });

  it('should never close without naming the capabilities it did not build', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain(
      'never close while they are still unaware of the rest',
    );
    expect(result).toContain('offer to set one up');
    expect(result).toContain('Build only what they accept');
  });

  it('should end the setup by calling the completion tool once nothing is left to build', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('## Ending the setup');
    expect(result).toContain(
      'end that same reply by calling complete_workspace_setup',
    );
    expect(result).toContain('moving to a side panel');
    expect(result).toContain('never make it twice');
  });

  it('should propose a dashboard built with the dashboard tools', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('dashboard-building');
    expect(result).toContain('create_complete_dashboard');
    expect(result).toContain('widgetErrors');
  });

  it('should propose roles and build them with the role tools', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'en',
    });

    expect(result).toContain('roles skill');
    expect(result).toContain('list_roles');
    expect(result).toContain('Settings > Members > Roles');
    expect(result).not.toContain('You cannot configure roles from this chat');
    expect(result).not.toContain('navigate_app');
  });

  it('should require English names with labels in the user language', () => {
    const result = buildWorkspaceSetupPromptText({
      companyEnrichment,
      locale: 'fr-FR',
    });

    expect(result).toContain('names must be in English');
    expect(result).toContain("must be in the user's language");
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
