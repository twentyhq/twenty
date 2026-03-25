import { isDefined } from '@/utils/validation/isDefined';
import {
  DEFAULT_TOOL_INPUT_SCHEMA,
  type InputJsonSchema,
} from '@/logic-function';

export const getInputSchemaFromSourceCode = async (
  sourceCode: string,
): Promise<InputJsonSchema> => {
  const { getFunctionInputSchema } = await import(
    './get-function-input-schema'
  );
  const inputSchema = getFunctionInputSchema(sourceCode);

  // Logic functions take a single params object
  const firstParam = inputSchema[0];

  if (firstParam?.type === 'object' && isDefined(firstParam.properties)) {
    return {
      type: 'object',
      properties: firstParam.properties,
    };
  }

  return DEFAULT_TOOL_INPUT_SCHEMA;
};
