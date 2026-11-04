import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';
import { isRecordObjectSchema } from '@/logic-function/is-record-object-schema';
import { isDefined } from '@/utils/validation/isDefined';

// Tool callers and the logic function payload both require an object root;
// a record root is advertised as a string id, so it does not qualify either
export const isObjectRootToolInputSchema = (
  inputSchema: InputJsonSchema,
): boolean =>
  !isRecordObjectSchema(inputSchema) &&
  (!isDefined(inputSchema.type) || inputSchema.type === 'object');
