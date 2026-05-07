import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_PERMISSION_FLAG_DEFINITION_EDITABLE_PROPERTIES = [
  'label',
  'description',
  'iconKey',
  'category',
  'isRelevantForAgents',
  'isRelevantForUsers',
  'isRelevantForApiKeys',
] as const satisfies MetadataEntityPropertyName<'permissionFlagDefinition'>[];
