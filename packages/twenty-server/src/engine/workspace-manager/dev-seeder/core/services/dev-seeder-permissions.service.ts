import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { DataSource, Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldPermissionService } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.service';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import {
  RANDOM_USER_WORKSPACE_IDS,
  USER_WORKSPACE_DATA_SEED_IDS,
} from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';
import { API_KEY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/api-key-data-seeds.constant';
import { ADMIN_ROLE } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/roles/admin-role';

@Injectable()
export class DevSeederPermissionsService {
  private readonly logger = new Logger(DevSeederPermissionsService.name);

  constructor(
    private readonly roleService: RoleService,
    private readonly userRoleService: UserRoleService,
    private readonly objectPermissionService: ObjectPermissionService,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly fieldPermissionService: FieldPermissionService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  public async initPermissions(workspaceId: string) {
    const adminRole = await this.roleRepository.findOne({
      where: {
        standardId: ADMIN_ROLE.standardId,
        workspaceId,
      },
    });

    if (!adminRole) {
      throw new Error(
        'Required roles not found. Make sure the permission sync has run.',
      );
    }

    try {
      await this.coreDataSource
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

      await this.workspacePermissionsCacheService.recomputeApiKeyRoleMapCache({
        workspaceId,
      });
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

    let adminUserWorkspaceId: string | undefined;
    let memberUserWorkspaceIds: string[] = [];
    let limitedUserWorkspaceId: string | undefined;
    let guestUserWorkspaceId: string | undefined;

    if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
      adminUserWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.JANE;
      limitedUserWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.TIM;
      memberUserWorkspaceIds = [
        USER_WORKSPACE_DATA_SEED_IDS.JONY,
        ...Object.values(RANDOM_USER_WORKSPACE_IDS),
      ];
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

    await this.coreDataSource.getRepository(Workspace).update(workspaceId, {
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

    const personObjectMetadata =
      await this.objectMetadataRepository.findOneOrFail({
        where: {
          nameSingular: 'person',
          workspaceId,
        },
        relations: {
          fields: true,
        },
      });

    const companyObjectMetadata =
      await this.objectMetadataRepository.findOneOrFail({
        where: {
          nameSingular: 'company',
          workspaceId,
        },
        relations: {
          fields: true,
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

    const personCityFieldMetadata = personObjectMetadata.fields.find(
      (field) => field.name === 'city',
    );

    if (!personCityFieldMetadata) {
      throw new Error('Person city field metadata not found');
    }

    const companyLinkedinLinkFieldMetadata = companyObjectMetadata.fields.find(
      (field) => field.name === 'linkedinLink',
    );

    if (!companyLinkedinLinkFieldMetadata) {
      throw new Error('Company linkedin link field metadata not found');
    }

    const readOnlyOnPersonCityFieldPermission = {
      objectMetadataId: personObjectMetadata.id,
      fieldMetadataId: personCityFieldMetadata.id,
      canReadFieldValue: null,
      canUpdateFieldValue: false,
    };

    const noReadOnCompanyLinkedinLinkFieldPermission = {
      objectMetadataId: companyObjectMetadata.id,
      fieldMetadataId: companyLinkedinLinkFieldMetadata.id,
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    };

    await this.fieldPermissionService.upsertFieldPermissions({
      workspaceId,
      input: {
        roleId: customRole.id,
        fieldPermissions: [
          readOnlyOnPersonCityFieldPermission,
          noReadOnCompanyLinkedinLinkFieldPermission,
        ],
      },
    });

    return customRole;
  }
}
