import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { ROLE_TARGET_FOREIGN_KEY_PROPERTIES } from 'src/engine/metadata-modules/flat-role-target/constants/role-target-foreign-key-properties.constant';

export const FLAT_ROLE_TARGET_EDITABLE_PROPERTIES = [
  'roleId',
  ...ROLE_TARGET_FOREIGN_KEY_PROPERTIES,
] as const satisfies MetadataEntityPropertyName<'roleTarget'>[];
