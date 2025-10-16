import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from 'twenty-shared/workflow';

export const extractPropertyPathFromVariable = (
  rawVariableName: string,
): string[] => {
  const variableWithoutBrackets = rawVariableName.replace(
    CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    (_, variableName) => variableName,
  );

  const parts = variableWithoutBrackets.split('.');

  return parts.slice(1);
};
