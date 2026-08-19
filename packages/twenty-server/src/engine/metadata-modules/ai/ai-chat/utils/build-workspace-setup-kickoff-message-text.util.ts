import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { buildCompanyContextMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-company-context-message-text.util';
import { getEnglishLanguageNameFromLocale } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-english-language-name-from-locale.util';

const NO_COMPANY_CONTEXT_LINE =
  'No information about the company that owns this workspace is available.';

export const buildWorkspaceSetupKickoffMessageText = ({
  companyEnrichment,
  locale,
}: {
  companyEnrichment: WorkspaceCompanyEnrichment | null;
  locale: string;
}): string => {
  const companyContextSection = isDefined(companyEnrichment)
    ? buildCompanyContextMessageText(companyEnrichment)
    : NO_COMPANY_CONTEXT_LINE;

  const userLanguageName = getEnglishLanguageNameFromLocale(locale);

  return `${companyContextSection}

The user locale is ${userLanguageName}, please continue the discussion in that language.`;
};
