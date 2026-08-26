import {
  type EmailDocumentNode,
  transformEmailDocumentStrings,
} from 'twenty-shared/utils';

import { collectCampaignVariableNamesFromString } from 'src/modules/emailing/utils/collect-campaign-variable-names-from-string.util';

export const collectCampaignVariableNames = (
  node: EmailDocumentNode,
): Set<string> => {
  const names = new Set<string>();

  transformEmailDocumentStrings(node, (value) => {
    for (const name of collectCampaignVariableNamesFromString(value)) {
      names.add(name);
    }

    return value;
  });

  return names;
};
