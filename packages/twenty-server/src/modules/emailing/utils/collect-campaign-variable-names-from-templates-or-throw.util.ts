import { type EmailDocumentNode, parseJson } from 'twenty-shared/utils';

import { collectCampaignVariableNamesOrThrow } from 'src/modules/emailing/utils/collect-campaign-variable-names-or-throw.util';
import { collectCampaignVariableNamesFromStringOrThrow } from 'src/modules/emailing/utils/collect-campaign-variable-names-from-string-or-throw.util';

export const collectCampaignVariableNamesFromTemplatesOrThrow = ({
  subject,
  bodyTemplate,
}: {
  subject: string;
  bodyTemplate: string;
}): Set<string> => {
  const names = new Set<string>(
    collectCampaignVariableNamesFromStringOrThrow(subject),
  );

  const parsedBody = parseJson<EmailDocumentNode>(bodyTemplate);

  const collected =
    typeof parsedBody === 'object' &&
    parsedBody !== null &&
    parsedBody.type === 'doc'
      ? collectCampaignVariableNamesOrThrow(parsedBody)
      : collectCampaignVariableNamesFromStringOrThrow(bodyTemplate);

  for (const name of collected) {
    names.add(name);
  }

  return names;
};
