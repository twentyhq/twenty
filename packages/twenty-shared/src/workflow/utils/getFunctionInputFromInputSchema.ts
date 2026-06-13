import { type InputSchema, type FunctionInput } from '@/workflow';
import { type InputJsonSchema } from '@/logic-function';
import { isDefined } from '@/utils';
import { isNonEmptyString } from '@sniptt/guards';

export const getFunctionInputFromInputSchema = (
  inputSchema: InputSchema | InputJsonSchema[],
): FunctionInput => {
  return inputSchema.map((param) => {
    if (
      isDefined(param.type) &&
      ['string', 'number', 'boolean'].includes(param.type)
    ) {
      return param.enum && param.enum.length > 0 ? param.enum[0] : null;
    } else if (param.type === 'object') {
      if (isNonEmptyString(param.objectUniversalIdentifier)) {
        return null;
      }
      const result: FunctionInput = {};
      if (isDefined(param.properties)) {
        Object.entries(param.properties).forEach(([key, val]) => {
          result[key] = getFunctionInputFromInputSchema([val])[0];
        });
      }
      return result;
    } else if (param.type === 'array' && isDefined(param.items)) {
      return [];
    }
    return null;
  });
};
