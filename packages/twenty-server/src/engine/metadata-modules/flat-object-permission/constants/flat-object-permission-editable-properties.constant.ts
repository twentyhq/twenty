import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_OBJECT_PERMISSION_EDITABLE_PROPERTIES = [
  'roleId',
  'objectMetadataId',
  'canReadObjectRecords',
  'canUpdateObjectRecords',
  'canSoftDeleteObjectRecords',
  'canDestroyObjectRecords',
] as const satisfies MetadataEntityPropertyName<'objectPermission'>[];
