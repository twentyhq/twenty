import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';

// Substitutes {{variable}} tokens in a campaign template with the recipient's
// values, so one stored template yields a personalized message per recipient.
// HTML bodies escape the injected values (a recipient field could contain
// markup); plain-text subjects are substituted verbatim. Unknown tokens resolve
// to an empty string rather than being left literal.
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
