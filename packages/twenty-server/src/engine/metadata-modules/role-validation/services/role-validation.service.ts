import { Injectable } from '@nestjs/common';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class RoleValidationService {
  constructor(
    @InjectWorkspaceScopedRepository(RoleEntity)
    private readonly roleRepository: WorkspaceScopedRepository<RoleEntity>,
  ) {}

  async validateRoleAssignableToUsersOrThrow(
    roleId: string,
    workspaceId: string,
  ): Promise<void> {
    const role = await this.roleRepository.findOne(workspaceId, {
      where: {
        id: roleId,
      },
    });

    if (!role) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_FOUND,
        PermissionsExceptionCode.ROLE_NOT_FOUND,
      );
    }

    if (!role.canBeAssignedToUsers) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_CANNOT_BE_ASSIGNED_TO_USERS,
        PermissionsExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_USERS,
      );
    }
  }
}
