import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

export const findMissingRequiredToolArguments = ({
  inputSchema,
  toolArguments,
}: {
  inputSchema: unknown;
  toolArguments: Record<string, unknown>;
}): string[] => {
  if (!isPlainObject(inputSchema) || !Array.isArray(inputSchema.required)) {
    return [];
  }

  return inputSchema.required
    .filter(isString)
    .filter(
      (argumentName) =>
        !isDefined(toolArguments[argumentName]) ||
        toolArguments[argumentName] === '',
    );
};
