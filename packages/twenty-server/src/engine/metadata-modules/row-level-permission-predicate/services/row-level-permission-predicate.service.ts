/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { fromCreateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicateToCreate } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-create-row-level-permission-predicate-input-to-flat-row-level-permission-predicate-to-create.util';
import { fromDeleteRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicateOrThrow } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-delete-row-level-permission-predicate-input-to-flat-row-level-permission-predicate-or-throw.util';
import { fromDestroyRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicateOrThrow } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-destroy-row-level-permission-predicate-input-to-flat-row-level-permission-predicate-or-throw.util';
import { fromFlatRowLevelPermissionPredicateToDto } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-flat-row-level-permission-predicate-to-dto.util';
import { fromUpdateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicateToUpdateOrThrow } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-update-row-level-permission-predicate-input-to-flat-row-level-permission-predicate-to-update-or-throw.util';
import { type CreateRowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/create-row-level-permission-predicate.input';
import { type DeleteRowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/delete-row-level-permission-predicate.input';
import { type DestroyRowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/destroy-row-level-permission-predicate.input';
import { type UpdateRowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/update-row-level-permission-predicate.input';
import { RowLevelPermissionPredicateDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

const RLP_CACHE_KEYS = [
  'flatRowLevelPermissionPredicateMaps',
  'flatRowLevelPermissionPredicateGroupMaps',
] as const;

@Injectable()
export class RowLevelPermissionPredicateService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async createOne({
    createRowLevelPermissionPredicateInput,
    workspaceId,
  }: {
    createRowLevelPermissionPredicateInput: CreateRowLevelPermissionPredicateInput;
    workspaceId: string;
  }): Promise<RowLevelPermissionPredicateDTO> {
    const flatPredicateToCreate =
      fromCreateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicateToCreate(
        {
          createRowLevelPermissionPredicateInput,
          workspaceId,
        },
      );

    await this.runMigration({
      workspaceId,
      flatEntityToCreate: [flatPredicateToCreate],
    });

    const { flatRowLevelPermissionPredicateMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateMaps'],
        },
      );

    return fromFlatRowLevelPermissionPredicateToDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatPredicateToCreate.id,
        flatEntityMaps: flatRowLevelPermissionPredicateMaps,
      }),
    );
  }

  async updateOne({
    updateRowLevelPermissionPredicateInput,
    workspaceId,
  }: {
    updateRowLevelPermissionPredicateInput: UpdateRowLevelPermissionPredicateInput;
    workspaceId: string;
  }): Promise<RowLevelPermissionPredicateDTO> {
    const { flatRowLevelPermissionPredicateMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateMaps'],
        },
      );

    const flatPredicateToUpdate =
      fromUpdateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicateToUpdateOrThrow(
        {
          flatRowLevelPermissionPredicateMaps,
          updateRowLevelPermissionPredicateInput,
        },
      );

    await this.runMigration({
      workspaceId,
      flatEntityToUpdate: [flatPredicateToUpdate],
    });

    const { flatRowLevelPermissionPredicateMaps: recomputedFlatMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateMaps'],
        },
      );

    return fromFlatRowLevelPermissionPredicateToDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatPredicateToUpdate.id,
        flatEntityMaps: recomputedFlatMaps,
      }),
    );
  }

  async deleteOne({
    deleteRowLevelPermissionPredicateInput,
    workspaceId,
  }: {
    deleteRowLevelPermissionPredicateInput: DeleteRowLevelPermissionPredicateInput;
    workspaceId: string;
  }): Promise<RowLevelPermissionPredicateDTO> {
    const { flatRowLevelPermissionPredicateMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateMaps'],
        },
      );

    const flatPredicateWithDeletedAt =
      fromDeleteRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicateOrThrow(
        {
          deleteRowLevelPermissionPredicateInput,
          flatRowLevelPermissionPredicateMaps,
        },
      );

    await this.runMigration({
      workspaceId,
      flatEntityToUpdate: [flatPredicateWithDeletedAt],
    });

    const { flatRowLevelPermissionPredicateMaps: recomputedFlatMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateMaps'],
        },
      );

    return fromFlatRowLevelPermissionPredicateToDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatPredicateWithDeletedAt.id,
        flatEntityMaps: recomputedFlatMaps,
      }),
    );
  }

  async destroyOne({
    destroyRowLevelPermissionPredicateInput,
    workspaceId,
  }: {
    destroyRowLevelPermissionPredicateInput: DestroyRowLevelPermissionPredicateInput;
    workspaceId: string;
  }): Promise<RowLevelPermissionPredicateDTO> {
    const { flatRowLevelPermissionPredicateMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateMaps'],
        },
      );

    const flatPredicateToDelete =
      fromDestroyRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicateOrThrow(
        {
          destroyRowLevelPermissionPredicateInput,
          flatRowLevelPermissionPredicateMaps,
        },
      );

    await this.runMigration({
      workspaceId,
      flatEntityToDelete: [flatPredicateToDelete],
    });

    return fromFlatRowLevelPermissionPredicateToDto(flatPredicateToDelete);
  }

  async findByWorkspaceId(
    workspaceId: string,
  ): Promise<RowLevelPermissionPredicateDTO[]> {
    const { flatRowLevelPermissionPredicateMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateMaps'],
        },
      );

    return Object.values(flatRowLevelPermissionPredicateMaps.byId)
      .filter(isDefined)
      .filter((predicate) => predicate.deletedAt === null)
      .sort(
        (a, b) =>
          (a.positionInRowLevelPermissionPredicateGroup ?? 0) -
          (b.positionInRowLevelPermissionPredicateGroup ?? 0),
      )
      .map(fromFlatRowLevelPermissionPredicateToDto);
  }

  async findByRoleAndObject(
    workspaceId: string,
    roleId: string,
    objectMetadataId: string,
  ): Promise<RowLevelPermissionPredicateDTO[]> {
    const { flatRowLevelPermissionPredicateMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateMaps'],
        },
      );

    return Object.values(flatRowLevelPermissionPredicateMaps.byId)
      .filter(isDefined)
      .filter(
        (predicate) =>
          predicate.deletedAt === null &&
          predicate.roleId === roleId &&
          predicate.objectMetadataId === objectMetadataId,
      )
      .sort(
        (a, b) =>
          (a.positionInRowLevelPermissionPredicateGroup ?? 0) -
          (b.positionInRowLevelPermissionPredicateGroup ?? 0),
      )
      .map(fromFlatRowLevelPermissionPredicateToDto);
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<RowLevelPermissionPredicateDTO | null> {
    const { flatRowLevelPermissionPredicateMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateMaps'],
        },
      );

    const flatPredicate = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatRowLevelPermissionPredicateMaps,
    });

    if (!isDefined(flatPredicate) || flatPredicate.deletedAt !== null) {
      return null;
    }

    return fromFlatRowLevelPermissionPredicateToDto(flatPredicate);
  }

  private async runMigration({
    workspaceId,
    flatEntityToCreate = [],
    flatEntityToUpdate = [],
    flatEntityToDelete = [],
  }: {
    workspaceId: string;
    flatEntityToCreate?: FlatRowLevelPermissionPredicate[];
    flatEntityToUpdate?: FlatRowLevelPermissionPredicate[];
    flatEntityToDelete?: FlatRowLevelPermissionPredicate[];
  }): Promise<void> {
    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            rowLevelPermissionPredicate: {
              flatEntityToCreate,
              flatEntityToDelete,
              flatEntityToUpdate,
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Validation errors occurred while applying row level permission predicate mutation',
      );
    }

    await this.flatEntityMapsCacheService.invalidateFlatEntityMaps({
      workspaceId,
      flatMapsKeys: [...RLP_CACHE_KEYS],
    });
  }
}
