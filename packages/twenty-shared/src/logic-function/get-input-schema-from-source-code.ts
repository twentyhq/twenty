import { isDefined } from '@/utils/validation/isDefined';
import {
  DEFAULT_TOOL_INPUT_SCHEMA,
  type InputJsonSchema,
} from '@/logic-function';

// Returns the inferred params object schema, or undefined when the params type
// cannot be inferred (e.g. an imported type alias). Callers must treat undefined
// as "leave the existing schema untouched" and an empty schema as "no inputs".
export const getInputSchemaFromSourceCode = async (
  sourceCode: string,
  options?: { knownObjectTypes?: Record<string, string> },
): Promise<InputJsonSchema | undefined> => {
  const { getFunctionInputSchema } =
    await import('./get-function-input-schema');
  const inputSchema = getFunctionInputSchema(sourceCode, options);

  // Logic functions take a single params object
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
