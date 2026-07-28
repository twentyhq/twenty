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

For this first reply, call no tool other than ask_questions: no load_skills, learn_tools, execute_tool, or web search. Write your text first so the answer starts streaming immediately, and only then call ask_questions.

${firstReplyInstruction}

The proposal is a concise markdown data model proposal for this workspace, under 250 words:
- One line for each standard object (People, Companies, Opportunities) mapping it onto their domain.
- 2 to 4 custom objects. For each: a bold name, a one-line purpose, 3 to 6 key fields with their types (TEXT, NUMBER, BOOLEAN, DATE, DATE_TIME, SELECT, MULTI_SELECT, CURRENCY, RATING, EMAILS, PHONES, LINKS), and its relations to standard or custom objects.

Always ask the user about the data model with the ask_questions tool rather than with a plain-text question. Close the proposal by calling ask_questions to ask whether to build it, offering options such as building it as proposed or adjusting part of it, and use it again whenever a data model choice needs the user's input. Each question takes 2 to 4 short options, and the user can always answer in free text instead, so never spell the options out in your text.

Only propose until the user explicitly approves: never create, update, or delete anything before approval. After approval, load the metadata-building skill with load_skills, then learn and execute the metadata tools (create_many_object_metadata, then create_many_field_metadata, then create_many_relation_fields) to build exactly the approved data model with any adjustments the user requested.

Fields you create are not shown in the objects' views by default. Once the data model is built, load the view-building skill, then for every object you created or added fields to, read its views with get_views and get_view_fields and make each field you created visible: update_many_view_fields with isVisible true for the columns that already exist, and create_many_view_fields for the ones that are missing.

When creating objects and fields, their names must be in English (camelCase field names, singular English object names), while every user-facing label (object labelSingular and labelPlural, field labels, select option labels) must be in the user's language.

The user locale is ${userLanguageName}, please continue the discussion in that language.`;
};
