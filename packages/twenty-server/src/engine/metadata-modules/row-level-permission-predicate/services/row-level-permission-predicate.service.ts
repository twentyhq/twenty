/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { fromFlatRowLevelPermissionPredicateGroupToDto } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-flat-row-level-permission-predicate-group-to-dto.util';
import { fromFlatRowLevelPermissionPredicateToDto } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-flat-row-level-permission-predicate-to-dto.util';
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
    private readonly configService: ConfigService,
    private readonly applicationService: ApplicationService,
  ) {}

  async findByWorkspaceId(
    workspaceId: string,
  ): Promise<RowLevelPermissionPredicateDTO[]> {
    const hasRowLevelPermissionFeature =
      await this.hasRowLevelPermissionFeature(workspaceId);

    if (!hasRowLevelPermissionFeature) {
      return [];
    }

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
    const hasRowLevelPermissionFeature =
      await this.hasRowLevelPermissionFeature(workspaceId);

    if (!hasRowLevelPermissionFeature) {
      return [];
    }

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
    const hasRowLevelPermissionFeature =
      await this.hasRowLevelPermissionFeature(workspaceId);

    if (!hasRowLevelPermissionFeature) {
      return null;
    }

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
    await this.hasRowLevelPermissionFeatureOrThrow(workspaceId);

    const { roleId, objectMetadataId, predicates, predicateGroups } = input;

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );
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
        workspaceId,
        flatRowLevelPermissionPredicateGroupMaps,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      });

    const { predicatesToCreate, predicatesToUpdate, predicatesToDelete } =
      this.computePredicateOperations({
        existingPredicates,
        inputPredicates: predicates,
        roleId,
        objectMetadataId,
        workspaceId,
        flatRowLevelPermissionPredicateMaps,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
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
    workspaceId,
    flatRowLevelPermissionPredicateGroupMaps,
    workspaceCustomApplicationId,
  }: {
    existingGroups: FlatRowLevelPermissionPredicateGroup[];
    inputGroups: RowLevelPermissionPredicateGroupInput[];
    roleId: string;
    workspaceId: string;
    flatRowLevelPermissionPredicateGroupMaps: FlatEntityMaps<FlatRowLevelPermissionPredicateGroup>;
    workspaceCustomApplicationId: string;
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
          objectMetadataId: inputGroup.objectMetadataId,
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
          applicationId: workspaceCustomApplicationId,
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
    workspaceCustomApplicationId,
  }: {
    existingPredicates: FlatRowLevelPermissionPredicate[];
    inputPredicates: RowLevelPermissionPredicateInput[];
    roleId: string;
    objectMetadataId: string;
    workspaceId: string;
    flatRowLevelPermissionPredicateMaps: FlatEntityMaps<FlatRowLevelPermissionPredicate>;
    workspaceCustomApplicationId: string;
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
          applicationId: workspaceCustomApplicationId,
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

  private async hasRowLevelPermissionFeature(
    workspaceId: string,
  ): Promise<boolean> {
    const hasValidEnterpriseKey = isDefined(
      this.configService.get('ENTERPRISE_KEY'),
    );

    const isRowLevelPermissionEnabled =
      await this.billingService.hasEntitlement(
        workspaceId,
        BillingEntitlementKey.RLS,
      );

    return hasValidEnterpriseKey && isRowLevelPermissionEnabled;
  }

  private async hasRowLevelPermissionFeatureOrThrow(workspaceId: string) {
    const hasRowLevelPermissionFeature =
      await this.hasRowLevelPermissionFeature(workspaceId);

    if (!hasRowLevelPermissionFeature) {
      throw new RowLevelPermissionPredicateException(
        'Row level permission predicate feature is disabled',
        RowLevelPermissionPredicateExceptionCode.ROW_LEVEL_PERMISSION_FEATURE_DISABLED,
      );
    }
  }
}
