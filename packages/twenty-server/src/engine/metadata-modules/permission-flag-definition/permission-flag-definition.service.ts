import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { fromCreatePermissionFlagDefinitionInputToFlatPermissionFlagDefinitionToCreate } from 'src/engine/metadata-modules/flat-permission-flag-definition/utils/from-create-permission-flag-definition-input-to-flat-permission-flag-definition-to-create.util';
import { fromDeletePermissionFlagDefinitionInputToFlatPermissionFlagDefinitionOrThrow } from 'src/engine/metadata-modules/flat-permission-flag-definition/utils/from-delete-permission-flag-definition-input-to-flat-permission-flag-definition-or-throw.util';
import { fromFlatPermissionFlagDefinitionToPermissionFlagDefinitionDto } from 'src/engine/metadata-modules/flat-permission-flag-definition/utils/from-flat-permission-flag-definition-to-permission-flag-definition-dto.util';
import { fromUpdatePermissionFlagDefinitionInputToFlatPermissionFlagDefinitionToUpdateOrThrow } from 'src/engine/metadata-modules/flat-permission-flag-definition/utils/from-update-permission-flag-definition-input-to-flat-permission-flag-definition-to-update-or-throw.util';
import { type CreatePermissionFlagDefinitionInput } from 'src/engine/metadata-modules/permission-flag-definition/dtos/create-permission-flag-definition.input';
import { type PermissionFlagDefinitionDTO } from 'src/engine/metadata-modules/permission-flag-definition/dtos/permission-flag-definition.dto';
import { type UpdatePermissionFlagDefinitionInput } from 'src/engine/metadata-modules/permission-flag-definition/dtos/update-permission-flag-definition.input';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class PermissionFlagDefinitionService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async findAll(workspaceId: string): Promise<PermissionFlagDefinitionDTO[]> {
    const { flatPermissionFlagDefinitionMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPermissionFlagDefinitionMaps'],
        },
      );

    return Object.values(flatPermissionFlagDefinitionMaps.byUniversalIdentifier)
      .filter(isDefined)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(fromFlatPermissionFlagDefinitionToPermissionFlagDefinitionDto);
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<PermissionFlagDefinitionDTO | null> {
    const { flatPermissionFlagDefinitionMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPermissionFlagDefinitionMaps'],
        },
      );

    const flatPermissionFlagDefinition = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatPermissionFlagDefinitionMaps,
    });

    if (!isDefined(flatPermissionFlagDefinition)) {
      return null;
    }

    return fromFlatPermissionFlagDefinitionToPermissionFlagDefinitionDto(
      flatPermissionFlagDefinition,
    );
  }

  async create(
    input: CreatePermissionFlagDefinitionInput,
    workspaceId: string,
  ): Promise<PermissionFlagDefinitionDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatToCreate =
      fromCreatePermissionFlagDefinitionInputToFlatPermissionFlagDefinitionToCreate(
        {
          createPermissionFlagDefinitionInput: input,
          workspaceId,
          flatApplication: workspaceCustomFlatApplication,
        },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            permissionFlagDefinition: {
              flatEntityToCreate: [flatToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating permission flag definition',
      );
    }

    const { flatPermissionFlagDefinitionMaps: recomputedMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPermissionFlagDefinitionMaps'],
        },
      );

    return fromFlatPermissionFlagDefinitionToPermissionFlagDefinitionDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatToCreate.id,
        flatEntityMaps: recomputedMaps,
      }),
    );
  }

  async update(
    input: UpdatePermissionFlagDefinitionInput,
    workspaceId: string,
  ): Promise<PermissionFlagDefinitionDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatPermissionFlagDefinitionMaps: existingMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPermissionFlagDefinitionMaps'],
        },
      );

    const flatToUpdate =
      fromUpdatePermissionFlagDefinitionInputToFlatPermissionFlagDefinitionToUpdateOrThrow(
        {
          flatPermissionFlagDefinitionMaps: existingMaps,
          updatePermissionFlagDefinitionInput: input,
        },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            permissionFlagDefinition: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatToUpdate],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating permission flag definition',
      );
    }

    const { flatPermissionFlagDefinitionMaps: recomputedMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPermissionFlagDefinitionMaps'],
        },
      );

    return fromFlatPermissionFlagDefinitionToPermissionFlagDefinitionDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: input.id,
        flatEntityMaps: recomputedMaps,
      }),
    );
  }

  async delete(
    id: string,
    workspaceId: string,
  ): Promise<PermissionFlagDefinitionDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatPermissionFlagDefinitionMaps: existingMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPermissionFlagDefinitionMaps'],
        },
      );

    const flatToDelete =
      fromDeletePermissionFlagDefinitionInputToFlatPermissionFlagDefinitionOrThrow(
        {
          flatPermissionFlagDefinitionMaps: existingMaps,
          permissionFlagDefinitionId: id,
        },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            permissionFlagDefinition: {
              flatEntityToCreate: [],
              flatEntityToDelete: [flatToDelete],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting permission flag definition',
      );
    }

    return fromFlatPermissionFlagDefinitionToPermissionFlagDefinitionDto(
      flatToDelete,
    );
  }
}
