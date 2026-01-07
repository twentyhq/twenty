/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { fromCreateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroupToCreate } from 'src/engine/metadata-modules/flat-row-level-permission-predicate-group/utils/from-create-row-level-permission-predicate-group-input-to-flat-row-level-permission-predicate-group-to-create.util';
import { fromDeleteRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroupOrThrow } from 'src/engine/metadata-modules/flat-row-level-permission-predicate-group/utils/from-delete-row-level-permission-predicate-group-input-to-flat-row-level-permission-predicate-group-or-throw.util';
import { fromDestroyRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroupOrThrow } from 'src/engine/metadata-modules/flat-row-level-permission-predicate-group/utils/from-destroy-row-level-permission-predicate-group-input-to-flat-row-level-permission-predicate-group-or-throw.util';
import { fromFlatRowLevelPermissionPredicateGroupToDto } from 'src/engine/metadata-modules/flat-row-level-permission-predicate-group/utils/from-flat-row-level-permission-predicate-group-to-dto.util';
import { fromUpdateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroupToUpdateOrThrow } from 'src/engine/metadata-modules/flat-row-level-permission-predicate-group/utils/from-update-row-level-permission-predicate-group-input-to-flat-row-level-permission-predicate-group-to-update-or-throw.util';
import { type CreateRowLevelPermissionPredicateGroupInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/create-row-level-permission-predicate-group.input';
import { type DeleteRowLevelPermissionPredicateGroupInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/delete-row-level-permission-predicate-group.input';
import { type DestroyRowLevelPermissionPredicateGroupInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/destroy-row-level-permission-predicate-group.input';
import { type UpdateRowLevelPermissionPredicateGroupInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/update-row-level-permission-predicate-group.input';
import { RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

const RLP_CACHE_KEYS = [
  'flatRowLevelPermissionPredicateMaps',
  'flatRowLevelPermissionPredicateGroupMaps',
] as const;

@Injectable()
export class RowLevelPermissionPredicateGroupService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async createOne({
    createRowLevelPermissionPredicateGroupInput,
    workspaceId,
  }: {
    createRowLevelPermissionPredicateGroupInput: CreateRowLevelPermissionPredicateGroupInput;
    workspaceId: string;
  }): Promise<RowLevelPermissionPredicateGroupDTO> {
    const flatGroupToCreate =
      fromCreateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroupToCreate(
        {
          createRowLevelPermissionPredicateGroupInput,
          workspaceId,
        },
      );

    await this.runMigration({
      workspaceId,
      flatEntityToCreate: [flatGroupToCreate],
    });

    const { flatRowLevelPermissionPredicateGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateGroupMaps'],
        },
      );

    return fromFlatRowLevelPermissionPredicateGroupToDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatGroupToCreate.id,
        flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
      }),
    );
  }

  async updateOne({
    updateRowLevelPermissionPredicateGroupInput,
    workspaceId,
  }: {
    updateRowLevelPermissionPredicateGroupInput: UpdateRowLevelPermissionPredicateGroupInput;
    workspaceId: string;
  }): Promise<RowLevelPermissionPredicateGroupDTO> {
    const { flatRowLevelPermissionPredicateGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateGroupMaps'],
        },
      );

    const flatGroupToUpdate =
      fromUpdateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroupToUpdateOrThrow(
        {
          flatRowLevelPermissionPredicateGroupMaps,
          updateRowLevelPermissionPredicateGroupInput,
        },
      );

    await this.runMigration({
      workspaceId,
      flatEntityToUpdate: [flatGroupToUpdate],
    });

    const { flatRowLevelPermissionPredicateGroupMaps: recomputedFlatMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateGroupMaps'],
        },
      );

    return fromFlatRowLevelPermissionPredicateGroupToDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatGroupToUpdate.id,
        flatEntityMaps: recomputedFlatMaps,
      }),
    );
  }

  async deleteOne({
    deleteRowLevelPermissionPredicateGroupInput,
    workspaceId,
  }: {
    deleteRowLevelPermissionPredicateGroupInput: DeleteRowLevelPermissionPredicateGroupInput;
    workspaceId: string;
  }): Promise<RowLevelPermissionPredicateGroupDTO> {
    const { flatRowLevelPermissionPredicateGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateGroupMaps'],
        },
      );

    const flatGroupWithDeletedAt =
      fromDeleteRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroupOrThrow(
        {
          deleteRowLevelPermissionPredicateGroupInput,
          flatRowLevelPermissionPredicateGroupMaps,
        },
      );

    await this.runMigration({
      workspaceId,
      flatEntityToUpdate: [flatGroupWithDeletedAt],
    });

    const { flatRowLevelPermissionPredicateGroupMaps: recomputedFlatMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateGroupMaps'],
        },
      );

    return fromFlatRowLevelPermissionPredicateGroupToDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatGroupWithDeletedAt.id,
        flatEntityMaps: recomputedFlatMaps,
      }),
    );
  }

  async destroyOne({
    destroyRowLevelPermissionPredicateGroupInput,
    workspaceId,
  }: {
    destroyRowLevelPermissionPredicateGroupInput: DestroyRowLevelPermissionPredicateGroupInput;
    workspaceId: string;
  }): Promise<RowLevelPermissionPredicateGroupDTO> {
    const { flatRowLevelPermissionPredicateGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateGroupMaps'],
        },
      );

    const flatGroupToDelete =
      fromDestroyRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroupOrThrow(
        {
          destroyRowLevelPermissionPredicateGroupInput,
          flatRowLevelPermissionPredicateGroupMaps,
        },
      );

    await this.runMigration({
      workspaceId,
      flatEntityToDelete: [flatGroupToDelete],
    });

    return fromFlatRowLevelPermissionPredicateGroupToDto(flatGroupToDelete);
  }

  async findByWorkspaceId(
    workspaceId: string,
  ): Promise<RowLevelPermissionPredicateGroupDTO[]> {
    const { flatRowLevelPermissionPredicateGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateGroupMaps'],
        },
      );

    return Object.values(flatRowLevelPermissionPredicateGroupMaps.byId)
      .filter(isDefined)
      .filter((group) => group.deletedAt === null)
      .sort(
        (a, b) =>
          (a.positionInRowLevelPermissionPredicateGroup ?? 0) -
          (b.positionInRowLevelPermissionPredicateGroup ?? 0),
      )
      .map(fromFlatRowLevelPermissionPredicateGroupToDto);
  }

  async findByRole(
    workspaceId: string,
    roleId: string,
  ): Promise<RowLevelPermissionPredicateGroupDTO[]> {
    const { flatRowLevelPermissionPredicateGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateGroupMaps'],
        },
      );

    return Object.values(flatRowLevelPermissionPredicateGroupMaps.byId)
      .filter(isDefined)
      .filter((group) => group.deletedAt === null && group.roleId === roleId)
      .sort(
        (a, b) =>
          (a.positionInRowLevelPermissionPredicateGroup ?? 0) -
          (b.positionInRowLevelPermissionPredicateGroup ?? 0),
      )
      .map(fromFlatRowLevelPermissionPredicateGroupToDto);
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<RowLevelPermissionPredicateGroupDTO | null> {
    const { flatRowLevelPermissionPredicateGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateGroupMaps'],
        },
      );

    const flatGroup = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
    });

    if (!isDefined(flatGroup) || flatGroup.deletedAt !== null) {
      return null;
    }

    return fromFlatRowLevelPermissionPredicateGroupToDto(flatGroup);
  }

  private async runMigration({
    workspaceId,
    flatEntityToCreate = [],
    flatEntityToUpdate = [],
    flatEntityToDelete = [],
  }: {
    workspaceId: string;
    flatEntityToCreate?: FlatRowLevelPermissionPredicateGroup[];
    flatEntityToUpdate?: FlatRowLevelPermissionPredicateGroup[];
    flatEntityToDelete?: FlatRowLevelPermissionPredicateGroup[];
  }): Promise<void> {
    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            rowLevelPermissionPredicateGroup: {
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
        'Validation errors occurred while applying row level permission predicate group mutation',
      );
    }

    await this.flatEntityMapsCacheService.invalidateFlatEntityMaps({
      workspaceId,
      flatMapsKeys: [...RLP_CACHE_KEYS],
    });
  }
}
