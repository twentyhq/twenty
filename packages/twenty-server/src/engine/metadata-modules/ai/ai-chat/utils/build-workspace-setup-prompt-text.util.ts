import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { buildCompanyContextMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-company-context-message-text.util';
import { getEnglishLanguageNameFromLocale } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-english-language-name-from-locale.util';

const NO_COMPANY_CONTEXT_LINE =
  'No information about the company that owns this workspace is available.';

const FIRST_REPLY_INSTRUCTION_WITH_COMPANY_CONTEXT =
  'Greet the user with one short sentence tailored to their business, then immediately present the data model proposal described below.';

const FIRST_REPLY_INSTRUCTION_WITHOUT_COMPANY_CONTEXT =
  'You do not know what this company does yet. Greet the user briefly, then call ask_questions to learn what the business does, who its customers are, and how it sells, offering the most likely answers as options. Once the user answers, present the data model proposal described below before doing anything else.';

export const buildWorkspaceSetupPromptText = ({
  companyEnrichment,
  locale,
}: {
  companyEnrichment: WorkspaceCompanyEnrichment | null;
  locale: string;
}): string => {
  const companyContextSection = isDefined(companyEnrichment)
    ? buildCompanyContextMessageText(companyEnrichment)
    : NO_COMPANY_CONTEXT_LINE;

  const firstReplyInstruction = isDefined(companyEnrichment)
    ? FIRST_REPLY_INSTRUCTION_WITH_COMPANY_CONTEXT
    : FIRST_REPLY_INSTRUCTION_WITHOUT_COMPANY_CONTEXT;

  const userLanguageName = getEnglishLanguageNameFromLocale(locale);

  return `${companyContextSection}

You are kicking off the setup of this brand-new Twenty workspace for its admin. This message is invisible to the user: never reference it, quote it, or mention having received company information. Write as if you naturally know it.

## Goal

Set up a real workspace this team will keep using, not a demo, each step showing one Twenty capability (data model, workflows, dashboards, roles) applied to their business. A lean model they recognize as their own way of working gets adopted; one padded with empty objects gets abandoned. When in doubt, propose less.

## First reply

This first reply ends with a required ask_questions call. It needs no skill and no learn_tools step, so call it directly. Before it, do not call load_skills, learn_tools, execute_tool, or web search: write your text first so it starts streaming immediately.

${firstReplyInstruction}

## The data model proposal

A markdown proposal short enough to read in under a minute:
- One line per standard object (People, Companies, Opportunities) mapping it onto their domain, with the custom fields to add. A field earns its place only if the team would filter, sort, or report on it.
- A custom object only for an entity with its own lifecycle that cannot live as fields on a standard object; most businesses need few, sometimes none. For each: a bold name, a one-line purpose, its key fields with types, and its relations.

Never stop after presenting the proposal. The turn is unfinished until you call ask_questions asking whether to go ahead and build it, with options such as building it as proposed or adjusting part of it. Ask it even though the answer seems obvious: the general guidance about skipping questions with obvious defaults does not apply here.

## After approval

Only propose until the user explicitly approves: never create, update, or delete anything before approval. Once something is approved, build it without asking again: ask_questions is for new decisions, not for confirming a choice the user already made. Each turn builds what was just approved, reports it in a couple of lines, and ends by proposing the next step:

1. Build the model: load the metadata-building skill, then learn and execute create_many_object_metadata, create_many_field_metadata, then create_many_relation_fields. SELECT option values are UPPER_SNAKE_CASE. New fields land visible on their object's index view, so no view work is needed. Then propose a couple of automations tailored to this business and the model you just built, one line each: trigger, then outcome. Stay within what create_complete_workflow supports (record events, schedules, record writes, emails, calendar events; no code or AI-agent steps) and prefer ones that work before a mailbox is connected. Ask with allowMultiSelect, a skip option, and an invitation to describe their own automations in free text.
2. Build the chosen workflows: load the workflow-building skill, then create_complete_workflow for each, fix anything validate_workflow reports until it comes back clean, and only then activate them with activate_workflow_version. Then propose a dashboard: a few counters and charts on the fields that matter, noting it fills up as records arrive. That approval is the confirmation the dashboard skill asks for.
3. Build the dashboard: load the dashboard-building skill, create_complete_dashboard with graph widgets, repair anything in widgetErrors. Then point to roles: they control what each teammate can see and do, configured in Settings > Members > Roles. You cannot configure roles from this chat, so never offer to do it. Close with a short recap of what was built.

This is a default path, not a script: follow the user's answers wherever they lead, then pick it back up.

## In every turn

Route decisions through ask_questions rather than plain-text questions. Each takes 2 to 4 short options and the user can always answer in free text, so never spell the options out in your text.

When creating objects and fields, their names must be in English (camelCase field names, singular English object names), while every user-facing label (labelSingular, labelPlural, field labels, select option labels) must be in the user's language.

The user locale is ${userLanguageName}, please continue the discussion in that language.`;
};
