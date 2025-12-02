import { ROLE_TARGET_FOREIGN_KEY_PROPERTIES } from 'src/engine/metadata-modules/flat-role-target/constants/role-target-foreign-key-properties.constant';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';

export const FLAT_ROLE_TARGET_EDITABLE_PROPERTIES = [
  'roleId',
  ...ROLE_TARGET_FOREIGN_KEY_PROPERTIES,
] as const satisfies (keyof FlatRoleTarget)[];
