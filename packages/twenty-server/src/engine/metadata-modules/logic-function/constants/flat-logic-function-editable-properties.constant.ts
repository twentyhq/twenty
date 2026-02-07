import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export const FLAT_LOGIC_FUNCTION_EDITABLE_PROPERTIES = [
  'name',
  'description',
  'timeoutSeconds',
  'checksum',
  'sourceHandlerPath',
  'handlerName',
  'toolInputSchema',
  'isTool',
  'cronTriggerSettings',
  'databaseEventTriggerSettings',
  'httpRouteTriggerSettings',
] as const satisfies (keyof FlatLogicFunction)[];
