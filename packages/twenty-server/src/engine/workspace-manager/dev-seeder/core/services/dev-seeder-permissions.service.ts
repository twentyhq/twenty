import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { DataSource, In, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldPermissionService } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.service';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { RoleTargetService } from 'src/engine/metadata-modules/role-target/services/role-target.service';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import {
  SHAHRYAR_ADMIN_ROLE_SEED,
  SHAHRYAR_SUPERVISOR_OBJECT_PERMISSION_SEEDS,
  SHAHRYAR_SUPERVISOR_ROLE_SEED,
  SHAHRYAR_SUPERVISOR_ROW_LEVEL_PERMISSION_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/shahryar-role-seeds.constant';
import {
  RANDOM_USER_WORKSPACE_IDS,
  USER_WORKSPACE_DATA_SEED_IDS,
} from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { API_KEY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/api-key-data-seeds.constant';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

@Injectable()
export class DevSeederPermissionsService {
  private readonly logger = new Logger(DevSeederPermissionsService.name);

  constructor(
    private readonly roleService: RoleService,
    private readonly userRoleService: UserRoleService,
    private readonly objectPermissionService: ObjectPermissionService,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectWorkspaceScopedRepository(RoleEntity)
    private readonly roleRepository: WorkspaceScopedRepository<RoleEntity>,
    private readonly fieldPermissionService: FieldPermissionService,
    private readonly roleTargetService: RoleTargetService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  public async initPermissions({
    twentyStandardFlatApplication,
    workspaceCustomFlatApplication,
    workspaceId,
    light = false,
  }: {
    workspaceId: string;
    twentyStandardFlatApplication: FlatApplication;
    workspaceCustomFlatApplication: FlatApplication;
    light?: boolean;
  }) {
    const adminRole = await this.roleRepository.findOne(workspaceId, {
      where: {
        universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
      },
    });

    if (!adminRole) {
      throw new Error(
        'Required roles not found. Make sure the permission sync has run.',
      );
    }

    await this.roleTargetService.create({
      createRoleTargetInput: {
        roleId: adminRole.id,
        targetId: API_KEY_DATA_SEED_IDS.ID_1,
        targetMetadataForeignKey: 'apiKeyId',
        applicationId: twentyStandardFlatApplication.id,
      },
      workspaceId,
    });

    let adminUserWorkspaceId: string | undefined;
    let memberUserWorkspaceIds: string[] = [];
    let limitedUserWorkspaceId: string | undefined;
    let guestUserWorkspaceId: string | undefined;

    if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
      if (light) {
        // In light mode, Tim is admin (prefilled login user needs full
        // access for SDK development). No demo permission roles needed.
        adminUserWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.TIM;
        memberUserWorkspaceIds = [
          USER_WORKSPACE_DATA_SEED_IDS.JANE,
          USER_WORKSPACE_DATA_SEED_IDS.JONY,
          USER_WORKSPACE_DATA_SEED_IDS.PHIL,
          ...Object.values(RANDOM_USER_WORKSPACE_IDS),
        ];
      } else {
        adminUserWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.JANE;
        limitedUserWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.TIM;
        guestUserWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.PHIL;
        memberUserWorkspaceIds = [
          USER_WORKSPACE_DATA_SEED_IDS.JONY,
          ...Object.values(RANDOM_USER_WORKSPACE_IDS),
        ];

        const guestRole = await this.roleService.createGuestRole({
          workspaceId,
          ownerFlatApplication: workspaceCustomFlatApplication,
        });

        await this.userRoleService.assignRoleToManyUserWorkspace({
          workspaceId,
          userWorkspaceIds: [guestUserWorkspaceId],
          roleId: guestRole.id,
        });

        // The limited role restricts access to Pet and Rocket objects,
        // which are only created in full (non-light) mode
        const limitedRole = await this.createLimitedRoleForSeedWorkspace({
          workspaceId,
          ownerFlatApplication: workspaceCustomFlatApplication,
        });

        await this.userRoleService.assignRoleToManyUserWorkspace({
          workspaceId,
          userWorkspaceIds: [limitedUserWorkspaceId],
          roleId: limitedRole.id,
        });
      }
    } else if (workspaceId === SEED_YCOMBINATOR_WORKSPACE_ID) {
      adminUserWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.TIM_ACME;
      memberUserWorkspaceIds = [
        USER_WORKSPACE_DATA_SEED_IDS.JONY_ACME,
        USER_WORKSPACE_DATA_SEED_IDS.JANE_ACME,
        USER_WORKSPACE_DATA_SEED_IDS.PHIL_ACME,
      ];
    }

    if (!adminUserWorkspaceId) {
      throw new Error(
        'Should never occur, no eligible user workspace for admin has been found',
      );
    }

    await this.userRoleService.assignRoleToManyUserWorkspace({
      workspaceId,
      userWorkspaceIds: [adminUserWorkspaceId],
      roleId: adminRole.id,
    });

    const memberRole = await this.initMinimalPermissionsAndActivateWorkspace({
      workspaceId,
      workspaceCustomFlatApplication,
    });

    if (memberUserWorkspaceIds.length > 0) {
      await this.userRoleService.assignRoleToManyUserWorkspace({
        workspaceId,
        userWorkspaceIds: memberUserWorkspaceIds,
        roleId: memberRole.id,
      });
    }

    if (!light) {
      await this.initShahryarRoles({
        workspaceId,
        ownerFlatApplication: workspaceCustomFlatApplication,
        adminUserWorkspaceId,
        supervisorUserWorkspaceIds: [
          ...memberUserWorkspaceIds,
          limitedUserWorkspaceId,
          guestUserWorkspaceId,
        ].filter(isDefined),
      });
    }
  }

  public async initMinimalPermissionsAndActivateWorkspace({
    workspaceId,
    workspaceCustomFlatApplication,
  }: {
    workspaceId: string;
    workspaceCustomFlatApplication: FlatApplication;
  }): Promise<RoleDTO> {
    const memberRole = await this.roleService.createMemberRole({
      workspaceId,
      ownerFlatApplication: workspaceCustomFlatApplication,
    });

    await this.coreDataSource
      .getRepository(WorkspaceEntity)
      .update(workspaceId, {
        defaultRoleId: memberRole.id,
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      });

    return memberRole;
  }

  private async initShahryarRoles({
    adminUserWorkspaceId,
    ownerFlatApplication,
    supervisorUserWorkspaceIds,
    workspaceId,
  }: {
    adminUserWorkspaceId: string;
    supervisorUserWorkspaceIds: string[];
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
  }): Promise<void> {
    const adminRole = await this.roleService.createRole({
      ownerFlatApplication,
      workspaceId,
      input: SHAHRYAR_ADMIN_ROLE_SEED,
    });

    const supervisorRole = await this.roleService.createRole({
      ownerFlatApplication,
      workspaceId,
      input: SHAHRYAR_SUPERVISOR_ROLE_SEED,
    });
    const uniqueSupervisorUserWorkspaceIds = [
      ...new Set(
        supervisorUserWorkspaceIds.filter(
          (userWorkspaceId) => userWorkspaceId !== adminUserWorkspaceId,
        ),
      ),
    ];

    await this.userRoleService.assignRoleToManyUserWorkspace({
      workspaceId,
      userWorkspaceIds: [adminUserWorkspaceId],
      roleId: adminRole.id,
    });

    if (uniqueSupervisorUserWorkspaceIds.length > 0) {
      await this.userRoleService.assignRoleToManyUserWorkspace({
        workspaceId,
        userWorkspaceIds: uniqueSupervisorUserWorkspaceIds,
        roleId: supervisorRole.id,
      });
    }

    await this.upsertShahryarSupervisorObjectPermissions({
      workspaceId,
      supervisorRoleId: supervisorRole.id,
    });

    await this.seedShahryarSupervisorRowLevelPermissionPredicates({
      workspaceId,
      supervisorRoleId: supervisorRole.id,
      ownerFlatApplication,
    });
  }

  private async upsertShahryarSupervisorObjectPermissions({
    workspaceId,
    supervisorRoleId,
  }: {
    workspaceId: string;
    supervisorRoleId: string;
  }): Promise<void> {
    const objectMetadataByName = await this.findObjectMetadataByNames({
      workspaceId,
      objectNames: SHAHRYAR_SUPERVISOR_OBJECT_PERMISSION_SEEDS.map(
        (seed) => seed.objectName,
      ),
    });

    await this.objectPermissionService.upsertObjectPermissions({
      workspaceId,
      input: {
        roleId: supervisorRoleId,
        objectPermissions: SHAHRYAR_SUPERVISOR_OBJECT_PERMISSION_SEEDS.map(
          (seed) => {
            const objectMetadata = this.findObjectMetadataOrThrow({
              objectMetadataByName,
              objectName: seed.objectName,
            });

            return {
              objectMetadataId: objectMetadata.id,
              canReadObjectRecords: seed.canReadObjectRecords,
              canUpdateObjectRecords: seed.canUpdateObjectRecords,
              canSoftDeleteObjectRecords: seed.canSoftDeleteObjectRecords,
              canDestroyObjectRecords: seed.canDestroyObjectRecords,
            };
          },
        ),
      },
    });
  }

  private async seedShahryarSupervisorRowLevelPermissionPredicates({
    workspaceId,
    supervisorRoleId,
    ownerFlatApplication,
  }: {
    workspaceId: string;
    supervisorRoleId: string;
    ownerFlatApplication: FlatApplication;
  }): Promise<void> {
    const objectMetadataByName = await this.findObjectMetadataByNames({
      workspaceId,
      objectNames: [
        ...SHAHRYAR_SUPERVISOR_ROW_LEVEL_PERMISSION_SEEDS.map(
          (seed) => seed.objectName,
        ),
        'workspaceMember',
      ],
    });
    const workspaceMemberObjectMetadata = this.findObjectMetadataOrThrow({
      objectMetadataByName,
      objectName: 'workspaceMember',
    });
    const workspaceMemberIdFieldMetadata = this.findFieldMetadataOrThrow({
      objectMetadata: workspaceMemberObjectMetadata,
      fieldName: 'id',
    });
    const rowLevelPermissionPredicateRepository =
      this.coreDataSource.getRepository(RowLevelPermissionPredicateEntity);

    await rowLevelPermissionPredicateRepository.save(
      SHAHRYAR_SUPERVISOR_ROW_LEVEL_PERMISSION_SEEDS.map((seed) => {
        const objectMetadata = this.findObjectMetadataOrThrow({
          objectMetadataByName,
          objectName: seed.objectName,
        });
        const ownerFieldMetadata = this.findFieldMetadataOrThrow({
          objectMetadata,
          fieldName: seed.ownerFieldName,
        });
        const predicateId = v4();

        return rowLevelPermissionPredicateRepository.create({
          id: predicateId,
          universalIdentifier: predicateId,
          workspaceId,
          applicationId: ownerFlatApplication.id,
          fieldMetadataId: ownerFieldMetadata.id,
          objectMetadataId: objectMetadata.id,
          operand: RowLevelPermissionPredicateOperand.IS,
          value: null,
          subFieldName: null,
          workspaceMemberFieldMetadataId: workspaceMemberIdFieldMetadata.id,
          workspaceMemberSubFieldName: null,
          rowLevelPermissionPredicateGroupId: null,
          positionInRowLevelPermissionPredicateGroup: null,
          roleId: supervisorRoleId,
        });
      }),
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatRowLevelPermissionPredicateMaps',
      'rolesPermissions',
    ]);
  }

  private async findObjectMetadataByNames({
    workspaceId,
    objectNames,
  }: {
    workspaceId: string;
    objectNames: string[];
  }): Promise<Map<string, ObjectMetadataEntity>> {
    const uniqueObjectNames = [...new Set(objectNames)];
    const objectMetadatas = await this.objectMetadataRepository.find({
      where: {
        workspaceId,
        nameSingular: In(uniqueObjectNames),
      },
      relations: {
        fields: true,
      },
    });

    return new Map(
      objectMetadatas.map((objectMetadata) => [
        objectMetadata.nameSingular,
        objectMetadata,
      ]),
    );
  }

  private findObjectMetadataOrThrow({
    objectMetadataByName,
    objectName,
  }: {
    objectMetadataByName: Map<string, ObjectMetadataEntity>;
    objectName: string;
  }): ObjectMetadataEntity {
    const objectMetadata = objectMetadataByName.get(objectName);

    if (!isDefined(objectMetadata)) {
      throw new Error(`Object metadata not found for: ${objectName}`);
    }

    return objectMetadata;
  }

  private findFieldMetadataOrThrow({
    objectMetadata,
    fieldName,
  }: {
    objectMetadata: ObjectMetadataEntity;
    fieldName: string;
  }) {
    const fieldMetadata = objectMetadata.fields.find(
      (field) => field.name === fieldName,
    );

    if (!isDefined(fieldMetadata)) {
      throw new Error(
        `Field metadata not found for: ${objectMetadata.nameSingular}.${fieldName}`,
      );
    }

    return fieldMetadata;
  }

  private async createLimitedRoleForSeedWorkspace({
    ownerFlatApplication,
    workspaceId,
  }: {
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
  }) {
    const customRole = await this.roleService.createRole({
      ownerFlatApplication,
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
