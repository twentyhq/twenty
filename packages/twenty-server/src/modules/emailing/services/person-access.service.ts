import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class PersonAccessService {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly userRoleService: UserRoleService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async assertCanUpdatePeople({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<void> {
    const [{ objectsPermissions }, { flatObjectMetadataMaps }] =
      await Promise.all([
        this.permissionsService.getUserWorkspacePermissions({
          workspaceId,
          userWorkspaceId,
        }),
        this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatObjectMetadataMaps',
        ]),
      ]);

    const personObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.person.universalIdentifier
      ];
    const personPermissions = isDefined(personObjectMetadata)
      ? objectsPermissions[personObjectMetadata.id]
      : undefined;

    if (!personPermissions?.canUpdateObjectRecords) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
  }

  async assertCanUpdatePerson({
    workspaceId,
    userWorkspaceId,
    personId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    personId: string;
  }): Promise<void> {
    await this.assertCanUpdatePeople({ workspaceId, userWorkspaceId });

    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    const person = await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const personRepository = this.workspaceOrmManager.getRepository(
          PersonWorkspaceEntity,
          { unionOf: [roleId] },
        );

        return personRepository.findOne({
          where: { id: personId },
          select: { id: true },
        });
      },
    );

    if (!isDefined(person)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
  }
}
