import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

export const areRoleRecordPermissionsEditable = (
  role: Pick<RoleDTO, 'isEditable' | 'universalIdentifier'>,
): boolean =>
  role.isEditable ||
  role.universalIdentifier === STANDARD_ROLE.admin.universalIdentifier;
