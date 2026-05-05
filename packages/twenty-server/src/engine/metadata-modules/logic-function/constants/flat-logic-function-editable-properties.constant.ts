import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_LOGIC_FUNCTION_EDITABLE_PROPERTIES = [
  'name',
  'description',
  'timeoutSeconds',
  'checksum',
  'sourceHandlerPath',
  'handlerName',
  'cronTriggerSettings',
  'databaseEventTriggerSettings',
  'httpRouteTriggerSettings',
  'toolTriggerSettings',
  'workflowActionTriggerSettings',
  'isBuildUpToDate',
] as const satisfies MetadataEntityPropertyName<'logicFunction'>[];
