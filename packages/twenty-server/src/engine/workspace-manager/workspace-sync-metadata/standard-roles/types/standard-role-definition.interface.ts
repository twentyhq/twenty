import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

export type StandardRoleDefinition = Omit<
  FlatRole,
  'id' | 'workspaceId' | 'universalIdentifier' | 'standardId'
> & {
  standardId: string;
  permissionFlags?: PermissionFlagType[];
};
