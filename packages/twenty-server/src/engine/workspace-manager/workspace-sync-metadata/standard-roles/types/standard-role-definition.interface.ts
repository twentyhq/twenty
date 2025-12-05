import { type PermissionFlagType } from 'twenty-shared/constants';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export type StandardRoleDefinition = Omit<
  FlatRole,
  | 'id'
  | 'workspaceId'
  | 'universalIdentifier'
  | 'standardId'
  | 'roleTargetIds'
  | 'objectPermissionIds'
  | 'permissionFlagIds'
  | 'fieldPermissionIds'
  | 'createdAt'
  | 'updatedAt'
> & {
  standardId: string;
  permissionFlags?: PermissionFlagType[];
};
