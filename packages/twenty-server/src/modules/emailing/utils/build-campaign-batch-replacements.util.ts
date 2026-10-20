import { type TemplateVariableWithFallback } from 'twenty-shared/utils';

import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';
import { resolveCampaignVariableValue } from 'src/modules/emailing/utils/resolve-campaign-variable-value.util';

export const buildCampaignBatchReplacements = ({
  campaignVariables,
  variables,
}: {
  campaignVariables: TemplateVariableWithFallback[];
  variables: Record<string, string>;
}): Record<string, string> => {
  const replacements: Record<string, string> = {};

  for (const [index, campaignVariable] of campaignVariables.entries()) {
    const value = resolveCampaignVariableValue({ campaignVariable, variables });

    replacements[`v_h_${index}`] = escapeHtml(value);
    replacements[`v_t_${index}`] = value;
    replacements[`v_u_${index}`] = encodeURIComponent(value);
  }

  return replacements;
};
