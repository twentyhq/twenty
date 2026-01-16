/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { fromFlatRowLevelPermissionPredicateGroupToDto } from 'src/engine/metadata-modules/flat-row-level-permission-predicate-group/utils/from-flat-row-level-permission-predicate-group-to-dto.util';
import { fromCreateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicateToCreate } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-create-row-level-permission-predicate-input-to-flat-row-level-permission-predicate-to-create.util';
import { fromDeleteRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicateOrThrow } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-delete-row-level-permission-predicate-input-to-flat-row-level-permission-predicate-or-throw.util';
import { fromDestroyRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicateOrThrow } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-destroy-row-level-permission-predicate-input-to-flat-row-level-permission-predicate-or-throw.util';
import { fromFlatRowLevelPermissionPredicateToDto } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-flat-row-level-permission-predicate-to-dto.util';
import { fromUpdateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicateToUpdateOrThrow } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-update-row-level-permission-predicate-input-to-flat-row-level-permission-predicate-to-update-or-throw.util';
import { type CreateRowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/create-row-level-permission-predicate.input';
import { type DeleteRowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/delete-row-level-permission-predicate.input';
import { type DestroyRowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/destroy-row-level-permission-predicate.input';
import { type UpdateRowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/update-row-level-permission-predicate.input';
import {
  type RowLevelPermissionPredicateGroupInput,
  type RowLevelPermissionPredicateInput,
  type UpsertRowLevelPermissionPredicatesInput,
} from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';
import { RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';
import { RowLevelPermissionPredicateDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto';
import {
  RowLevelPermissionPredicateException,
  RowLevelPermissionPredicateExceptionCode,
} from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class RowLevelPermissionPredicateService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly billingService: BillingService,
  ) {}

  async createOne({
    createRowLevelPermissionPredicateInput,
    workspaceId,
  }: {
    createRowLevelPermissionPredicateInput: CreateRowLevelPermissionPredicateInput;
    workspaceId: string;
  }): Promise<RowLevelPermissionPredicateDTO> {
    await this.ensureRowLevelPermissionEntitlement(workspaceId);

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
    await this.ensureRowLevelPermissionEntitlement(workspaceId);

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
    await this.ensureRowLevelPermissionEntitlement(workspaceId);

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
    await this.ensureRowLevelPermissionEntitlement(workspaceId);

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
    await this.ensureRowLevelPermissionEntitlement(workspaceId);

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
    await this.ensureRowLevelPermissionEntitlement(workspaceId);

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
    await this.ensureRowLevelPermissionEntitlement(workspaceId);

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

  async upsertRowLevelPermissionPredicates({
    input,
    workspaceId,
  }: {
    input: UpsertRowLevelPermissionPredicatesInput;
    workspaceId: string;
  }): Promise<{
    predicates: RowLevelPermissionPredicateDTO[];
    predicateGroups: RowLevelPermissionPredicateGroupDTO[];
  }> {
    await this.ensureRowLevelPermissionEntitlement(workspaceId);

    const { roleId, objectMetadataId, predicates, predicateGroups } = input;

    const {
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatRowLevelPermissionPredicateMaps',
            'flatRowLevelPermissionPredicateGroupMaps',
          ],
        },
      );

    const existingPredicates = Object.values(
      flatRowLevelPermissionPredicateMaps.byId,
    )
      .filter(isDefined)
      .filter(
        (predicate) =>
          predicate.deletedAt === null &&
          predicate.roleId === roleId &&
          predicate.objectMetadataId === objectMetadataId,
      );

    const existingGroups = Object.values(
      flatRowLevelPermissionPredicateGroupMaps.byId,
    )
      .filter(isDefined)
      .filter(
        (group) =>
          group.deletedAt === null &&
          group.roleId === roleId &&
          group.objectMetadataId === objectMetadataId,
      );

    const { groupsToCreate, groupsToUpdate, groupsToDelete } =
      this.computePredicateGroupOperations({
        existingGroups,
        inputGroups: predicateGroups,
        roleId,
        objectMetadataId,
        workspaceId,
        flatRowLevelPermissionPredicateGroupMaps,
      });

    const { predicatesToCreate, predicatesToUpdate, predicatesToDelete } =
      this.computePredicateOperations({
        existingPredicates,
        inputPredicates: predicates,
        roleId,
        objectMetadataId,
        workspaceId,
        flatRowLevelPermissionPredicateMaps,
      });

    await this.runUpsertMigration({
      workspaceId,
      predicatesToCreate,
      predicatesToUpdate,
      predicatesToDelete,
      groupsToCreate,
      groupsToUpdate,
      groupsToDelete,
    });

    const {
      flatRowLevelPermissionPredicateMaps: updatedPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps: updatedGroupMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatRowLevelPermissionPredicateMaps',
            'flatRowLevelPermissionPredicateGroupMaps',
          ],
        },
      );

    const resultPredicates = Object.values(updatedPredicateMaps.byId)
      .filter(isDefined)
      .filter(
        (predicate) =>
          predicate.deletedAt === null &&
          predicate.roleId === roleId &&
          predicate.objectMetadataId === objectMetadataId,
      )
      .map(fromFlatRowLevelPermissionPredicateToDto);

    const resultGroups = Object.values(updatedGroupMaps.byId)
      .filter(isDefined)
      .filter(
        (group) =>
          group.deletedAt === null &&
          group.roleId === roleId &&
          group.objectMetadataId === objectMetadataId,
      )
      .map(fromFlatRowLevelPermissionPredicateGroupToDto);

    return {
      predicates: resultPredicates,
      predicateGroups: resultGroups,
    };
  }

  private computePredicateGroupOperations({
    existingGroups,
    inputGroups,
    roleId,
    objectMetadataId,
    workspaceId,
    flatRowLevelPermissionPredicateGroupMaps,
  }: {
    existingGroups: FlatRowLevelPermissionPredicateGroup[];
    inputGroups: RowLevelPermissionPredicateGroupInput[];
    roleId: string;
    objectMetadataId: string;
    workspaceId: string;
    flatRowLevelPermissionPredicateGroupMaps: FlatEntityMaps<FlatRowLevelPermissionPredicateGroup>;
  }): {
    groupsToCreate: FlatRowLevelPermissionPredicateGroup[];
    groupsToUpdate: FlatRowLevelPermissionPredicateGroup[];
    groupsToDelete: FlatRowLevelPermissionPredicateGroup[];
  } {
    const groupsToCreate: FlatRowLevelPermissionPredicateGroup[] = [];
    const groupsToUpdate: FlatRowLevelPermissionPredicateGroup[] = [];

    const inputGroupIds = new Set<string>();

    for (const inputGroup of inputGroups) {
      const groupId = inputGroup.id ?? v4();
      const createdAt = new Date().toISOString();

      inputGroupIds.add(groupId);

      const existingGroup =
        flatRowLevelPermissionPredicateGroupMaps.byId[groupId];

      if (isDefined(existingGroup) && existingGroup.deletedAt === null) {
        groupsToUpdate.push({
          ...existingGroup,
          logicalOperator: inputGroup.logicalOperator,
          parentRowLevelPermissionPredicateGroupId:
            inputGroup.parentRowLevelPermissionPredicateGroupId ?? null,
          positionInRowLevelPermissionPredicateGroup:
            inputGroup.positionInRowLevelPermissionPredicateGroup ?? null,
          updatedAt: createdAt,
        });
      } else {
        groupsToCreate.push({
          id: groupId,
          workspaceId,
          roleId,
          objectMetadataId,
          logicalOperator: inputGroup.logicalOperator,
          parentRowLevelPermissionPredicateGroupId:
            inputGroup.parentRowLevelPermissionPredicateGroupId ?? null,
          positionInRowLevelPermissionPredicateGroup:
            inputGroup.positionInRowLevelPermissionPredicateGroup ?? null,
          childRowLevelPermissionPredicateGroupIds: [],
          rowLevelPermissionPredicateIds: [],
          createdAt,
          updatedAt: createdAt,
          deletedAt: null,
          universalIdentifier: groupId,
          applicationId: null,
        });
      }
    }

    const groupsToDelete = existingGroups
      .filter((group) => !inputGroupIds.has(group.id))
      .map((group) => ({
        ...group,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

    return {
      groupsToCreate,
      groupsToUpdate,
      groupsToDelete,
    };
  }

  private computePredicateOperations({
    existingPredicates,
    inputPredicates,
    roleId,
    objectMetadataId,
    workspaceId,
    flatRowLevelPermissionPredicateMaps,
  }: {
    existingPredicates: FlatRowLevelPermissionPredicate[];
    inputPredicates: RowLevelPermissionPredicateInput[];
    roleId: string;
    objectMetadataId: string;
    workspaceId: string;
    flatRowLevelPermissionPredicateMaps: FlatEntityMaps<FlatRowLevelPermissionPredicate>;
  }): {
    predicatesToCreate: FlatRowLevelPermissionPredicate[];
    predicatesToUpdate: FlatRowLevelPermissionPredicate[];
    predicatesToDelete: FlatRowLevelPermissionPredicate[];
  } {
    const predicatesToCreate: FlatRowLevelPermissionPredicate[] = [];
    const predicatesToUpdate: FlatRowLevelPermissionPredicate[] = [];

    const inputPredicateIds = new Set<string>();

    for (const inputPredicate of inputPredicates) {
      const predicateId = inputPredicate.id ?? v4();
      const createdAt = new Date().toISOString();

      inputPredicateIds.add(predicateId);

      const existingPredicate =
        flatRowLevelPermissionPredicateMaps.byId[predicateId];

      if (
        isDefined(existingPredicate) &&
        existingPredicate.deletedAt === null
      ) {
        predicatesToUpdate.push({
          ...existingPredicate,
          fieldMetadataId: inputPredicate.fieldMetadataId,
          operand: inputPredicate.operand,
          value: inputPredicate.value ?? null,
          subFieldName: inputPredicate.subFieldName ?? null,
          workspaceMemberFieldMetadataId:
            inputPredicate.workspaceMemberFieldMetadataId ?? null,
          workspaceMemberSubFieldName:
            inputPredicate.workspaceMemberSubFieldName ?? null,
          rowLevelPermissionPredicateGroupId:
            inputPredicate.rowLevelPermissionPredicateGroupId ?? null,
          positionInRowLevelPermissionPredicateGroup:
            inputPredicate.positionInRowLevelPermissionPredicateGroup ?? null,
          updatedAt: createdAt,
        });
      } else {
        predicatesToCreate.push({
          id: predicateId,
          workspaceId,
          roleId,
          objectMetadataId,
          fieldMetadataId: inputPredicate.fieldMetadataId,
          operand: inputPredicate.operand,
          value: inputPredicate.value ?? null,
          subFieldName: inputPredicate.subFieldName ?? null,
          workspaceMemberFieldMetadataId:
            inputPredicate.workspaceMemberFieldMetadataId ?? null,
          workspaceMemberSubFieldName:
            inputPredicate.workspaceMemberSubFieldName ?? null,
          rowLevelPermissionPredicateGroupId:
            inputPredicate.rowLevelPermissionPredicateGroupId ?? null,
          positionInRowLevelPermissionPredicateGroup:
            inputPredicate.positionInRowLevelPermissionPredicateGroup ?? null,
          createdAt,
          updatedAt: createdAt,
          deletedAt: null,
          universalIdentifier: predicateId,
          applicationId: null,
        });
      }
    }

    const predicatesToDelete = existingPredicates
      .filter((predicate) => !inputPredicateIds.has(predicate.id))
      .map((predicate) => ({
        ...predicate,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

    return {
      predicatesToCreate,
      predicatesToUpdate,
      predicatesToDelete,
    };
  }

  private async runUpsertMigration({
    workspaceId,
    predicatesToCreate,
    predicatesToUpdate,
    predicatesToDelete,
    groupsToCreate,
    groupsToUpdate,
    groupsToDelete,
  }: {
    workspaceId: string;
    predicatesToCreate: FlatRowLevelPermissionPredicate[];
    predicatesToUpdate: FlatRowLevelPermissionPredicate[];
    predicatesToDelete: FlatRowLevelPermissionPredicate[];
    groupsToCreate: FlatRowLevelPermissionPredicateGroup[];
    groupsToUpdate: FlatRowLevelPermissionPredicateGroup[];
    groupsToDelete: FlatRowLevelPermissionPredicateGroup[];
  }): Promise<void> {
    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            rowLevelPermissionPredicateGroup: {
              flatEntityToCreate: groupsToCreate,
              flatEntityToUpdate: [...groupsToUpdate, ...groupsToDelete],
              flatEntityToDelete: [],
            },
            rowLevelPermissionPredicate: {
              flatEntityToCreate: predicatesToCreate,
              flatEntityToUpdate: [
                ...predicatesToUpdate,
                ...predicatesToDelete,
              ],
              flatEntityToDelete: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Validation errors occurred while upserting row level permission predicates',
      );
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'rolesPermissions',
    ]);
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
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Validation errors occurred while applying row level permission predicate mutation',
      );
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'rolesPermissions',
      'flatRowLevelPermissionPredicateGroupMaps',
    ]);
  }

  private async ensureRowLevelPermissionEntitlement(workspaceId: string) {
    const isRowLevelPermissionEnabled =
      await this.billingService.hasEntitlement(
        workspaceId,
        BillingEntitlementKey.RLS,
      );

    if (!isRowLevelPermissionEnabled) {
      throw new RowLevelPermissionPredicateException(
        'No entitlement found for this workspace',
        RowLevelPermissionPredicateExceptionCode.ROW_LEVEL_PERMISSION_FEATURE_DISABLED,
      );
    }
  }
}
