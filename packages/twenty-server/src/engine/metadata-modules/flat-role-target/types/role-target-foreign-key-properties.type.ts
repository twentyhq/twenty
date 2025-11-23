import { type ROLE_TARGET_FOREIGN_KEY_PROPERTIES } from 'src/engine/metadata-modules/flat-role-target/constants/role-target-foreign-key-properties.constant';

export type RoleTargetForeignKeyProperties =
  (typeof ROLE_TARGET_FOREIGN_KEY_PROPERTIES)[number];
