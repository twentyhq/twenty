import {
  type EmailDocumentNode,
  transformEmailDocumentStrings,
} from 'twenty-shared/utils';

import { collectCampaignVariableNamesFromStringOrThrow } from 'src/modules/emailing/utils/collect-campaign-variable-names-from-string-or-throw.util';

export const collectCampaignVariableNamesOrThrow = (
  node: EmailDocumentNode,
): Set<string> => {
  const names = new Set<string>();

  transformEmailDocumentStrings(node, (value) => {
    for (const name of collectCampaignVariableNamesFromStringOrThrow(value)) {
      names.add(name);
    }

    return value;
  });

  return names;
};
