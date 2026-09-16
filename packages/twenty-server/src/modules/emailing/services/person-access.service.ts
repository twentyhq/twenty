import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { In } from 'typeorm';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { ObjectRecordPermissionService } from 'src/modules/emailing/services/object-record-permission.service';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

const FIND_BY_IDS_CHUNK_SIZE = 5_000;

@Injectable()
export class PersonAccessService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly userRoleService: UserRoleService,
    private readonly objectRecordPermissionService: ObjectRecordPermissionService,
  ) {}

  async findReadablePersonIds({
    roleId,
    personIds,
  }: {
    roleId: string;
    personIds: string[];
  }): Promise<Set<string>> {
    if (personIds.length === 0) {
      return new Set();
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const personRepository = this.workspaceOrmManager.getRepository(
        PersonWorkspaceEntity,
        { unionOf: [roleId] },
      );
      const readablePersonIds = new Set<string>();

      for (const personIdsChunk of chunk(personIds, FIND_BY_IDS_CHUNK_SIZE)) {
        const people = await personRepository.find({
          where: { id: In(personIdsChunk) },
          select: { id: true },
        });

        for (const person of people) {
          readablePersonIds.add(person.id);
        }
      }

      return readablePersonIds;
    });
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
    await this.objectRecordPermissionService.assertObjectRecordPermissions({
      workspaceId,
      userWorkspaceId,
      objectUniversalIdentifiers: [STANDARD_OBJECTS.person.universalIdentifier],
      requiredPermissions: ['canUpdateObjectRecords'],
    });

    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });
    const readablePersonIds = await this.findReadablePersonIds({
      roleId,
      personIds: [personId],
    });

    if (!readablePersonIds.has(personId)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
  }
}
