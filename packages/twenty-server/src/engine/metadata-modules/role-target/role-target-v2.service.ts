import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeFlatEntityMapsFromTo } from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-maps-from-to.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';
import { v4 } from 'uuid';

export type CreateRoleTargetInput = {
  roleId: string;
  workspaceId: string;
  applicationId: string;
  universalIdentifier: string;
} & (
  | { userWorkspaceId: string; agentId?: never; apiKeyId?: never }
  | { agentId: string; userWorkspaceId?: never; apiKeyId?: never }
  | { apiKeyId: string; userWorkspaceId?: never; agentId?: never }
);

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
  ) {}

  async create({
    applicationId,
    roleId,
    universalIdentifier,
    workspaceId,
    agentId,
    apiKeyId,
    userWorkspaceId,
  }: CreateRoleTargetInput): Promise<FlatRoleTarget> {
    const { flatRoleTargetMaps: existingFlatRoleTargetMaps, flatRoleMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleTargetMaps', 'flatRoleMaps'],
        },
      );

    const flatRoleTargetToCreate: FlatRoleTarget = {
      id: v4(),
      workspaceId,
      roleId,
      userWorkspaceId: userWorkspaceId ?? null,
      agentId: agentId ?? null,
      apiKeyId: apiKeyId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier,
      applicationId,
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatRoleTargetMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatRoleTargetMaps,
              flatEntityToCreate: [flatRoleTargetToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatRoleMaps,
          },
          buildOptions: {
            isSystemBuild: false,
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
