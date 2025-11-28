import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeFlatEntityMapsFromTo } from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-maps-from-to.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { CreateRoleTargetInput } from 'src/engine/metadata-modules/role-target/types/create-role-target.input';
import { fromCreateRoleTargetInputToFlatRoleTargetToCreate } from 'src/engine/metadata-modules/role-target/utils/from-create-role-target-input-to-flat-role-target-to-create.util';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

export type DeleteRoleTargetInput = {
  id: string;
  workspaceId: string;
};

export type FindRoleTargetInput = {
  id: string;
  workspaceId: string;
};

@Injectable()
export class RoleTargetServiceV2 {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
  ) {}

  async create({
    createRoleTargetInput,
    workspaceId,
  }: {
    createRoleTargetInput: CreateRoleTargetInput;
    workspaceId: string;
  }): Promise<FlatRoleTarget> {
    const { flatRoleTargetMaps, flatRoleMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleTargetMaps', 'flatRoleMaps'],
        },
      );
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatRoleTargetToCreate, flatRoleTargetsToDelete } =
      fromCreateRoleTargetInputToFlatRoleTargetToCreate({
        createRoleTargetInput: {
          ...createRoleTargetInput,
          applicationId:
            createRoleTargetInput.applicationId ??
            workspaceCustomFlatApplication.id,
        },
        flatRoleTargetMaps,
        workspaceId,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatRoleTargetMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: flatRoleTargetMaps,
              flatEntityToCreate: [flatRoleTargetToCreate],
              flatEntityToDelete: flatRoleTargetsToDelete,
              flatEntityToUpdate: [],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatRoleMaps,
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: {
              roleTarget: true,
            },
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating role target',
      );
    }

    const { flatRoleTargetMaps: recomputedFlatRoleTargetMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleTargetMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatRoleTargetToCreate.id,
      flatEntityMaps: recomputedFlatRoleTargetMaps,
    });
  }

  async delete({ id, workspaceId }: DeleteRoleTargetInput): Promise<void> {
    const { flatRoleTargetMaps: existingFlatRoleTargetMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleTargetMaps'],
        },
      );

    const roleTargetToDelete = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: existingFlatRoleTargetMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatRoleTargetMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatRoleTargetMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [roleTargetToDelete],
              flatEntityToUpdate: [],
            }),
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: {
              roleTarget: true,
            },
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting role target',
      );
    }
  }

  async findOne({
    findRoleTargetInput,
  }: {
    findRoleTargetInput: FindRoleTargetInput;
  }): Promise<FlatRoleTarget | null> {
    const { workspaceId, id } = findRoleTargetInput;

    const { flatRoleTargetMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleTargetMaps'],
        },
      );

    const roleTarget = flatRoleTargetMaps.byId[id];

    return roleTarget ?? null;
  }
}
