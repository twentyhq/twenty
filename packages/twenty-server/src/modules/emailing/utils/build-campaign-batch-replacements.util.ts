import { escapeHtml } from 'twenty-shared/utils';

export const buildCampaignBatchReplacements = ({
  variableNames,
  variables,
}: {
  variableNames: string[];
  variables: Record<string, string>;
}): Record<string, string> => {
  const replacements: Record<string, string> = {};

  for (const [index, variableName] of variableNames.entries()) {
    const value = Object.prototype.hasOwnProperty.call(variables, variableName)
      ? (variables[variableName] ?? '')
      : '';

    replacements[`v_h_${index}`] = escapeHtml(value);
    replacements[`v_t_${index}`] = value;
    replacements[`v_u_${index}`] = encodeURIComponent(value);
  }

  return replacements;
};
