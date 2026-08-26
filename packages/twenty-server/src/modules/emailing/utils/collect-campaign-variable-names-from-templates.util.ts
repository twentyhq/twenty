import { type EmailDocumentNode, parseJson } from 'twenty-shared/utils';

import { collectCampaignVariableNames } from 'src/modules/emailing/utils/collect-campaign-variable-names.util';
import { collectCampaignVariableNamesFromString } from 'src/modules/emailing/utils/collect-campaign-variable-names-from-string.util';

export const collectCampaignVariableNamesFromTemplates = ({
  subject,
  bodyTemplate,
}: {
  subject: string;
  bodyTemplate: string;
}): Set<string> => {
  const names = new Set<string>(
    collectCampaignVariableNamesFromString(subject),
  );

  const parsedBody = parseJson<EmailDocumentNode>(bodyTemplate);

  const collected =
    typeof parsedBody === 'object' &&
    parsedBody !== null &&
    parsedBody.type === 'doc'
      ? collectCampaignVariableNames(parsedBody)
      : collectCampaignVariableNamesFromString(bodyTemplate);

  for (const name of collected) {
    names.add(name);
  }

  return names;
};
