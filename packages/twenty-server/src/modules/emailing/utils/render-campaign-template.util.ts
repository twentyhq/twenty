import {
  isDefined,
  parseTemplateVariableWithFallback,
} from 'twenty-shared/utils';
import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from 'twenty-shared/workflow';

import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';
import { resolveCampaignVariableValue } from 'src/modules/emailing/utils/resolve-campaign-variable-value.util';

export const renderCampaignTemplate = (
  template: string,
  variables: Record<string, string>,
  { escapeValues }: { escapeValues: boolean },
): string =>
  template.replace(
    CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    (rawTemplateVariable) => {
      const campaignVariable =
        parseTemplateVariableWithFallback(rawTemplateVariable);

      if (!isDefined(campaignVariable)) {
        return rawTemplateVariable;
      }

      const value = resolveCampaignVariableValue({
        campaignVariable,
        variables,
      });

      return escapeValues ? escapeHtml(value) : value;
    },
  );
