import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { CreateRoleTargetInput } from 'src/engine/metadata-modules/role-target/types/create-role-target.input';
import { fromCreateRoleTargetInputToFlatRoleTargetToCreate } from 'src/engine/metadata-modules/role-target/utils/from-create-role-target-input-to-flat-role-target-to-create.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

export type DeleteRoleTargetInput = {
  id: string;
  workspaceId: string;
};

export type FindRoleTargetInput = {
  id: string;
  workspaceId: string;
};

@Injectable()
export class RoleTargetService {
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
    const [flatRoleTarget] = await this.createMany({
      createRoleTargetInputs: [createRoleTargetInput],
      workspaceId,
    });

    return flatRoleTarget;
  }

  async createMany({
    createRoleTargetInputs,
    workspaceId,
  }: {
    createRoleTargetInputs: CreateRoleTargetInput[];
    workspaceId: string;
  }): Promise<FlatRoleTarget[]> {
    if (createRoleTargetInputs.length === 0) {
      return [];
    }

    const { flatRoleTargetMaps, flatApplicationMaps, flatRoleMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatRoleTargetMaps',
            'flatApplicationMaps',
            'flatRoleMaps',
          ],
        },
      );

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const allFlatRoleTargetsToCreate: FlatRoleTarget[] = [];
    const allFlatRoleTargetsToDelete: FlatRoleTarget[] = [];

    for (const createRoleTargetInput of createRoleTargetInputs) {
      const flatApplication = isDefined(createRoleTargetInput.applicationId)
        ? flatApplicationMaps.byId[createRoleTargetInput.applicationId]
        : undefined;

      const { flatRoleTargetToCreate, flatRoleTargetsToDelete } =
        fromCreateRoleTargetInputToFlatRoleTargetToCreate({
          createRoleTargetInput,
          flatRoleTargetMaps,
          flatRoleMaps,
          workspaceId,
          flatApplication: flatApplication ?? workspaceCustomFlatApplication,
        });

      allFlatRoleTargetsToCreate.push(flatRoleTargetToCreate);
      allFlatRoleTargetsToDelete.push(...flatRoleTargetsToDelete);
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            roleTarget: {
              flatEntityToCreate: allFlatRoleTargetsToCreate,
              flatEntityToDelete: allFlatRoleTargetsToDelete,
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating role targets',
      );
    }

    const { flatRoleTargetMaps: recomputedFlatRoleTargetMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleTargetMaps'],
        },
      );

    return allFlatRoleTargetsToCreate.map((flatRoleTargetToCreate) =>
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatRoleTargetToCreate.id,
        flatEntityMaps: recomputedFlatRoleTargetMaps,
      }),
    );
  }

  async delete({ id, workspaceId }: DeleteRoleTargetInput): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

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
          allFlatEntityOperationByMetadataName: {
            roleTarget: {
              flatEntityToCreate: [],
              flatEntityToDelete: [roleTargetToDelete],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
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

    const roleTarget = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatRoleTargetMaps,
    });

    return roleTarget ?? null;
  }
}
