import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_PERMISSION_FLAG_EDITABLE_PROPERTIES = [
  'flag',
  'roleId',
] as const satisfies MetadataEntityPropertyName<'permissionFlag'>[];
