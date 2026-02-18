import {
  CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
  parseVariablePath,
} from 'twenty-shared/workflow';

export const extractPropertyPathFromVariable = (
  rawVariableName: string,
): string[] => {
  const variableWithoutBrackets = rawVariableName.replace(
    CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    (_, variableName) => variableName,
  );

  const parts = parseVariablePath(variableWithoutBrackets);

  return parts.slice(1);
};
