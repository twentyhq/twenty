import { RoleTargetForeignKeyProperties } from 'src/engine/metadata-modules/role-target/types/role-target-foreign-key-properties.type';

export type CreateRoleTargetInput = {
  roleId: string;
  applicationId?: string;
  universalIdentifier?: string;
  targetId: string;
  targetMetadataForeignKey: RoleTargetForeignKeyProperties;
};
