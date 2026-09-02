import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';

export const buildCampaignBatchReplacements = ({
  variableNames,
  variables,
}: {
  variableNames: string[];
  variables: Record<string, string>;
}): Record<string, string> => {
  const replacements: Record<string, string> = {};

  for (const [index, variableName] of variableNames.entries()) {
    const value = variables[variableName] ?? '';

    replacements[`v_h_${index}`] = escapeHtml(value);
    replacements[`v_t_${index}`] = value;
  }

  return replacements;
};
