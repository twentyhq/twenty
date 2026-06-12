import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { fromCreatePermissionFlagInputToFlatPermissionFlagToCreate } from 'src/engine/metadata-modules/flat-permission-flag/utils/from-create-permission-flag-input-to-flat-permission-flag-to-create.util';
import { fromDeletePermissionFlagInputToFlatPermissionFlagOrThrow } from 'src/engine/metadata-modules/flat-permission-flag/utils/from-delete-permission-flag-input-to-flat-permission-flag-or-throw.util';
import { fromFlatPermissionFlagToPermissionFlagDto } from 'src/engine/metadata-modules/flat-permission-flag/utils/from-flat-permission-flag-to-permission-flag-dto.util';
import { fromUpdatePermissionFlagInputToFlatPermissionFlagToUpdateOrThrow } from 'src/engine/metadata-modules/flat-permission-flag/utils/from-update-permission-flag-input-to-flat-permission-flag-to-update-or-throw.util';
import { type CreatePermissionFlagInput } from 'src/engine/metadata-modules/permission-flag/dtos/create-permission-flag.input';
import { type PermissionFlagDTO } from 'src/engine/metadata-modules/permission-flag/dtos/permission-flag.dto';
import { type UpdatePermissionFlagInput } from 'src/engine/metadata-modules/permission-flag/dtos/update-permission-flag.input';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class PermissionFlagService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async findAll(workspaceId: string): Promise<PermissionFlagDTO[]> {
    const { flatPermissionFlagMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPermissionFlagMaps'],
        },
      );

    return Object.values(flatPermissionFlagMaps.byUniversalIdentifier)
      .filter(isDefined)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(fromFlatPermissionFlagToPermissionFlagDto);
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<PermissionFlagDTO | null> {
    const { flatPermissionFlagMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPermissionFlagMaps'],
        },
      );

    const flatPermissionFlag = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatPermissionFlagMaps,
    });

    if (!isDefined(flatPermissionFlag)) {
      return null;
    }

    return fromFlatPermissionFlagToPermissionFlagDto(flatPermissionFlag);
  }

  async create(
    input: CreatePermissionFlagInput,
    workspaceId: string,
  ): Promise<PermissionFlagDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatToCreate =
      fromCreatePermissionFlagInputToFlatPermissionFlagToCreate({
        createPermissionFlagInput: input,
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            permissionFlag: {
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
        'Validation errors occurred while creating permission flag',
      );
    }

    const { flatPermissionFlagMaps: recomputedMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPermissionFlagMaps'],
        },
      );

    return fromFlatPermissionFlagToPermissionFlagDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatToCreate.id,
        flatEntityMaps: recomputedMaps,
      }),
    );
  }

  async update(
    input: UpdatePermissionFlagInput,
    workspaceId: string,
  ): Promise<PermissionFlagDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatPermissionFlagMaps: existingMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPermissionFlagMaps'],
        },
      );

    const flatToUpdate =
      fromUpdatePermissionFlagInputToFlatPermissionFlagToUpdateOrThrow({
        flatPermissionFlagMaps: existingMaps,
        updatePermissionFlagInput: input,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            permissionFlag: {
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
        'Validation errors occurred while updating permission flag',
      );
    }

    const { flatPermissionFlagMaps: recomputedMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPermissionFlagMaps'],
        },
      );

    return fromFlatPermissionFlagToPermissionFlagDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: input.id,
        flatEntityMaps: recomputedMaps,
      }),
    );
  }

  async delete(id: string, workspaceId: string): Promise<PermissionFlagDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatPermissionFlagMaps: existingMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPermissionFlagMaps'],
        },
      );

    const flatToDelete =
      fromDeletePermissionFlagInputToFlatPermissionFlagOrThrow({
        flatPermissionFlagMaps: existingMaps,
        permissionFlagId: id,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            permissionFlag: {
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
        'Validation errors occurred while deleting permission flag',
      );
    }

    return fromFlatPermissionFlagToPermissionFlagDto(flatToDelete);
  }
}
