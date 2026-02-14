import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_FRONT_COMPONENT_EDITABLE_PROPERTIES = [
  'name',
  'description',
  'builtComponentChecksum',
  'sourceComponentPath',
  'builtComponentPath',
  'componentName',
] as const satisfies MetadataEntityPropertyName<'frontComponent'>[];
