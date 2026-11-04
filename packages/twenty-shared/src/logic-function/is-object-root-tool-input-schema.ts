import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';
import { isRecordObjectSchema } from '@/logic-function/is-record-object-schema';
import { isDefined } from '@/utils/validation/isDefined';

// Tool callers and the function payload need an object; a record root is advertised as a string id
export const isObjectRootToolInputSchema = (
  inputSchema: InputJsonSchema,
): boolean =>
  !isRecordObjectSchema(inputSchema) &&
  (!isDefined(inputSchema.type) || inputSchema.type === 'object');
