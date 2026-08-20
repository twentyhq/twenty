import { isDefined } from 'twenty-shared/utils';
import {
  type WorkspaceCompanyEnrichment,
  type WorkspacePersonEnrichment,
} from 'twenty-shared/workspace';

import { type WorkspaceSetupWorkspaceContext } from 'src/engine/metadata-modules/ai/ai-chat/types/workspace-setup-workspace-context.type';
import { buildCompanyContextMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-company-context-message-text.util';
import { buildPersonContextMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-person-context-message-text.util';
import { buildWorkspaceContextMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-context-message-text.util';
import { getEnglishLanguageNameFromLocale } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-english-language-name-from-locale.util';

const NO_COMPANY_CONTEXT_LINE =
  'No information about the company that owns this workspace is available.';

const NO_PERSON_CONTEXT_LINE =
  'No third-party information about the person setting up this workspace is available.';

export const buildWorkspaceSetupKickoffMessageText = ({
  companyEnrichment,
  personEnrichment,
  workspaceContext,
  locale,
}: {
  companyEnrichment: WorkspaceCompanyEnrichment | null;
  personEnrichment: WorkspacePersonEnrichment | null;
  workspaceContext: WorkspaceSetupWorkspaceContext;
  locale: string;
}): string => {
  const companyContextSection = isDefined(companyEnrichment)
    ? buildCompanyContextMessageText(companyEnrichment)
    : NO_COMPANY_CONTEXT_LINE;

  const personContextSection = isDefined(personEnrichment)
    ? buildPersonContextMessageText(personEnrichment)
    : NO_PERSON_CONTEXT_LINE;

  const workspaceContextSection =
    buildWorkspaceContextMessageText(workspaceContext);

  const userLanguageName = getEnglishLanguageNameFromLocale(locale);

  return `${companyContextSection}

${personContextSection}

${workspaceContextSection}

The user locale is ${userLanguageName}, please continue the discussion in that language.`;
};
