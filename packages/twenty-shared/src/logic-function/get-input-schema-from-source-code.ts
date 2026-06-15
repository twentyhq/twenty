import { isDefined } from '@/utils/validation/isDefined';
import {
  DEFAULT_TOOL_INPUT_SCHEMA,
  type InputJsonSchema,
} from '@/logic-function';

export const getInputSchemaFromSourceCode = async (
  sourceCode: string,
  options?: { knownObjectTypes?: Record<string, string> },
): Promise<InputJsonSchema | undefined> => {
  const { getFunctionInputSchema } =
    await import('./get-function-input-schema');
  const inputSchema = getFunctionInputSchema(sourceCode, options);

  const firstParam = inputSchema[0];

  if (firstParam?.type === 'object' && isDefined(firstParam.properties)) {
    return {
      type: 'object',
      properties: firstParam.properties,
    };
  }

  if (inputSchema.length === 0) {
    return DEFAULT_TOOL_INPUT_SCHEMA;
  }

  return undefined;
};
