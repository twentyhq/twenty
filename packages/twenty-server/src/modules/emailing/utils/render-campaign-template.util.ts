import { replaceTemplateVariables } from 'twenty-shared/utils';

import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';
import { resolveCampaignVariableValue } from 'src/modules/emailing/utils/resolve-campaign-variable-value.util';

export const renderCampaignTemplate = (
  template: string,
  variables: Record<string, string>,
  { escapeValues }: { escapeValues: boolean },
): string =>
  replaceTemplateVariables(template, (campaignVariable) => {
    const value = resolveCampaignVariableValue({ campaignVariable, variables });

    return escapeValues ? escapeHtml(value) : value;
  });
