import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export const FLAT_LOGIC_FUNCTION_EDITABLE_PROPERTIES = [
  'name',
  'description',
  'timeoutSeconds',
  'checksum',
  'code',
  'sourceHandlerPath',
  'handlerName',
  'toolInputSchema',
  'isTool',
] as const satisfies (keyof FlatLogicFunction)[];
