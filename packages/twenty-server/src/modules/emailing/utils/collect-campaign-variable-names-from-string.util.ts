import { isDefined } from 'twenty-shared/utils';
import { CAMPAIGN_VARIABLE_PATTERN } from 'src/modules/emailing/constants/campaign-variable-pattern.constant';

export const collectCampaignVariableNamesFromString = (
  value: unknown,
): Set<string> => {
  const names = new Set<string>();

  if (typeof value !== 'string') {
    return names;
  }

  for (const match of value.matchAll(CAMPAIGN_VARIABLE_PATTERN)) {
    const [, variableName] = match;

    if (isDefined(variableName)) {
      names.add(variableName);
    }
  }

  return names;
};
