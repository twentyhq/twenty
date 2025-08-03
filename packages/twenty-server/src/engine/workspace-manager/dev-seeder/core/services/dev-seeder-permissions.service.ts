import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';
import { API_KEY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/api-key-data-seeds.constant';

@Injectable()
export class DevSeederPermissionsService {
  private readonly logger = new Logger(DevSeederPermissionsService.name);

  constructor(
    private readonly roleService: RoleService,
    private readonly userRoleService: UserRoleService,
    private readonly objectPermissionService: ObjectPermissionService,
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly typeORMService: TypeORMService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
  ) {}

  public async initPermissions(workspaceId: string) {
    const adminRole = await this.roleService.createAdminRole({
      workspaceId,
    });

    const dataSource = this.typeORMService.getMainDataSource();

    if (dataSource) {
      try {
        await dataSource
          .createQueryBuilder()
          .insert()
          .into('core.roleTargets', ['roleId', 'apiKeyId', 'workspaceId'])
          .orIgnore()
          .values([
            {
              roleId: adminRole.id,
              apiKeyId: API_KEY_DATA_SEED_IDS.ID_1,
              workspaceId: workspaceId,
            },
          ])
          .execute();

        await this.workspacePermissionsCacheService.recomputeApiKeyRoleMapCache(
          {
            workspaceId,
          },
        );
        await this.workspacePermissionsCacheService.recomputeUserWorkspaceRoleMapCache(
          {
            workspaceId,
          },
        );
      } catch (error) {
        this.logger.error(
          `Could not assign role to test API key: ${error.message}`,
        );
      }
    }

    let adminUserWorkspaceId: string | undefined;
    let memberUserWorkspaceIds: string[] = [];
    let limitedUserWorkspaceId: string | undefined;
    let guestUserWorkspaceId: string | undefined;

    if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
      adminUserWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.JANE;
      limitedUserWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.TIM;
      memberUserWorkspaceIds = [USER_WORKSPACE_DATA_SEED_IDS.JONY];
      guestUserWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.PHIL;

      const guestRole = await this.roleService.createGuestRole({
        workspaceId,
      });

      await this.userRoleService.assignRoleToUserWorkspace({
        workspaceId,
        userWorkspaceId: guestUserWorkspaceId,
        roleId: guestRole.id,
      });

      const limitedRole =
        await this.createLimitedRoleForSeedWorkspace(workspaceId);

      await this.userRoleService.assignRoleToUserWorkspace({
        workspaceId,
        userWorkspaceId: limitedUserWorkspaceId,
        roleId: limitedRole.id,
      });
    } else if (workspaceId === SEED_YCOMBINATOR_WORKSPACE_ID) {
      adminUserWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.TIM_ACME;
      memberUserWorkspaceIds = [
        USER_WORKSPACE_DATA_SEED_IDS.JONY_ACME,
        USER_WORKSPACE_DATA_SEED_IDS.JANE_ACME,
        USER_WORKSPACE_DATA_SEED_IDS.PHIL_ACME,
      ];
    }

    if (adminUserWorkspaceId) {
      await this.userRoleService.assignRoleToUserWorkspace({
        workspaceId,
        userWorkspaceId: adminUserWorkspaceId,
        roleId: adminRole.id,
      });
    }

    const memberRole = await this.roleService.createMemberRole({
      workspaceId,
    });

    await this.typeORMService
      .getMainDataSource()
      ?.getRepository(Workspace)
      .update(workspaceId, {
        defaultRoleId: memberRole.id,
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      });

    if (memberUserWorkspaceIds) {
      for (const memberUserWorkspaceId of memberUserWorkspaceIds) {
        await this.userRoleService.assignRoleToUserWorkspace({
          workspaceId,
          userWorkspaceId: memberUserWorkspaceId,
          roleId: memberRole.id,
        });
      }
    }
  }

  private async createLimitedRoleForSeedWorkspace(workspaceId: string) {
    const customRole = await this.roleService.createRole({
      workspaceId,
      input: {
        label: 'Object-restricted',
        description:
          'All permissions except read on Rockets and update on Pets',
        icon: 'custom',
        canUpdateAllSettings: true,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
        canDestroyAllObjectRecords: true,
      },
    });

    const petObjectMetadata = await this.objectMetadataRepository.findOneOrFail(
      {
        where: {
          nameSingular: 'pet',
          workspaceId,
        },
      },
    );

    const rocketObjectMetadata =
      await this.objectMetadataRepository.findOneOrFail({
        where: {
          nameSingular: 'rocket',
          workspaceId,
        },
      });

    await this.objectPermissionService.upsertObjectPermissions({
      workspaceId,
      input: {
        roleId: customRole.id,
        objectPermissions: [
          {
            objectMetadataId: petObjectMetadata.id,
            canReadObjectRecords: true,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
          {
            objectMetadataId: rocketObjectMetadata.id,
            canReadObjectRecords: false,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ],
      },
    });

    return customRole;
  }
}
