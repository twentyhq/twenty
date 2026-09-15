import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { type PermissionFlagDTO } from 'src/engine/metadata-modules/permission-flag/dtos/permission-flag.dto';

export const fromFlatPermissionFlagToPermissionFlagDto = (
  flatDefinition: FlatPermissionFlag,
): PermissionFlagDTO => ({
  id: flatDefinition.id,
  universalIdentifier: flatDefinition.universalIdentifier,
  key: flatDefinition.key,
  label: flatDefinition.label,
  description: flatDefinition.description,
  icon: flatDefinition.icon,
  permissionType: flatDefinition.permissionType,
  workspaceId: flatDefinition.workspaceId,
  applicationId: flatDefinition.applicationId,
  createdAt: new Date(flatDefinition.createdAt),
  updatedAt: new Date(flatDefinition.updatedAt),
});
