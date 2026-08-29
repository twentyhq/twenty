import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';
import { CAMPAIGN_VARIABLE_PATTERN } from 'src/modules/emailing/constants/campaign-variable-pattern.constant';

export const renderCampaignTemplate = (
  template: string,
  variables: Record<string, string>,
  { escapeValues }: { escapeValues: boolean },
): string =>
  template.replace(CAMPAIGN_VARIABLE_PATTERN, (_match, variableName) => {
    const value = variables[variableName] ?? '';

    return escapeValues ? escapeHtml(value) : value;
  });
