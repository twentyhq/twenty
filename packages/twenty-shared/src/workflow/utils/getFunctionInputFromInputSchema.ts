import { type InputSchema, type FunctionInput } from '@/workflow';
import { type InputJsonSchema } from '@/logic-function';
import { isRecordObjectSchema } from '@/logic-function/is-record-object-schema';
import { isDefined, isNonEmptyArray } from '@/utils';

export const getFunctionInputFromInputSchema = (
  inputSchema: InputSchema | InputJsonSchema[],
): FunctionInput => {
  return inputSchema.map((param) => {
    if (isRecordObjectSchema(param)) {
      return null;
    }

    if (param.type === 'records') {
      return [];
    }

    if (
      isDefined(param.type) &&
      ['string', 'number', 'boolean'].includes(param.type)
    ) {
      return isNonEmptyArray(param.enum) ? param.enum[0] : null;
    }

    if (param.type === 'object') {
      const result: FunctionInput = {};

      for (const [key, property] of Object.entries(param.properties ?? {})) {
        result[key] = getFunctionInputFromInputSchema([property])[0];
      }

      return result;
    }

    if (param.type === 'array' && isDefined(param.items)) {
      const isEnumArray =
        param.items.type === 'string' && isNonEmptyArray(param.items.enum);

      return isEnumArray ? undefined : [];
    }

    return null;
  });
};
