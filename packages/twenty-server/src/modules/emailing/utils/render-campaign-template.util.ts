import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';

const CAMPAIGN_VARIABLE_PATTERN = /\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g;

export const renderCampaignTemplate = (
  template: string,
  variables: Record<string, string>,
  { escapeValues }: { escapeValues: boolean },
): string =>
  template.replace(CAMPAIGN_VARIABLE_PATTERN, (_match, variableName) => {
    const value = variables[variableName] ?? '';

    return escapeValues ? escapeHtml(value) : value;
  });
