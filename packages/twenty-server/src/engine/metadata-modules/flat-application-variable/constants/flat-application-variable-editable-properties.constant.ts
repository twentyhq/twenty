import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_APPLICATION_VARIABLE_EDITABLE_PROPERTIES = [
  'key',
  'description',
  'isSecret',
] as const satisfies MetadataEntityPropertyName<'applicationVariable'>[];
