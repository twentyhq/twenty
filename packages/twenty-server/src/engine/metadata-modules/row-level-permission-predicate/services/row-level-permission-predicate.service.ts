/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { fromCreateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-create-row-level-permission-predicate-group-input-to-flat-row-level-permission-predicate-group.util';
import { fromCreateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-create-row-level-permission-predicate-input-to-flat-row-level-permission-predicate.util';
import { fromFlatRowLevelPermissionPredicateGroupToDto } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-flat-row-level-permission-predicate-group-to-dto.util';
import { fromFlatRowLevelPermissionPredicateToDto } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-flat-row-level-permission-predicate-to-dto.util';
import { isRoleFlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/is-role-flat-row-level-permission-predicate.util';
import { fromUpdateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-update-row-level-permission-predicate-group-input-to-flat-row-level-permission-predicate-group.util';
import { fromUpdateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-update-row-level-permission-predicate-input-to-flat-row-level-permission-predicate.util';
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
import {
  type FlatRowLevelPermissionPredicateParent,
  isRowLevelPermissionPredicateOfParent,
  type RowLevelPermissionPredicateParentIds,
} from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-parent.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { hasRowLevelPermissionFeature } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/has-row-level-permission-feature.util';
import { validateRowLevelPermissionRuleOwnershipOrThrow } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/validate-row-level-permission-rule-ownership.util';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
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
    private readonly applicationService: ApplicationService,
    private readonly enterprisePlanService: EnterprisePlanService,
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

    return Object.values(
      flatRowLevelPermissionPredicateMaps.byUniversalIdentifier,
    )
      .filter(isRoleFlatRowLevelPermissionPredicate)
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

    return Object.values(
      flatRowLevelPermissionPredicateMaps.byUniversalIdentifier,
    )
      .filter(isRoleFlatRowLevelPermissionPredicate)
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

    if (
      !isDefined(flatPredicate) ||
      flatPredicate.deletedAt !== null ||
      !isRoleFlatRowLevelPermissionPredicate(flatPredicate)
    ) {
      return null;
    }

    return fromFlatRowLevelPermissionPredicateToDto(flatPredicate);
  }

  async findBySharingRule(
    workspaceId: string,
    sharingRuleId: string,
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

    return Object.values(
      flatRowLevelPermissionPredicateMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (predicate) =>
          predicate.deletedAt === null &&
          predicate.sharingRuleId === sharingRuleId,
      )
      .sort(
        (a, b) =>
          (a.positionInRowLevelPermissionPredicateGroup ?? 0) -
          (b.positionInRowLevelPermissionPredicateGroup ?? 0),
      )
      .map(fromFlatRowLevelPermissionPredicateToDto);
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

    const { objectMetadataId, predicates, predicateGroups } = input;
    const parentIds = this.getParentIdsOrThrow(input);

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );
    const {
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatRoleMaps,
      flatSharingRuleMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatRowLevelPermissionPredicateMaps',
            'flatRowLevelPermissionPredicateGroupMaps',
            'flatRoleMaps',
            'flatSharingRuleMaps',
            'flatObjectMetadataMaps',
            'flatFieldMetadataMaps',
          ],
        },
      );

    validateRowLevelPermissionRuleOwnershipOrThrow({
      ...parentIds,
      objectMetadataId,
      predicates,
      predicateGroups,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps,
      workspaceMemberObjectMetadataId: buildObjectIdByNameMaps(
        flatObjectMetadataMaps,
      ).idByNameSingular.workspaceMember,
    });

    const parent = this.resolveParentOrThrow({
      parentIds,
      objectMetadataId,
      flatRoleMaps,
      flatSharingRuleMaps,
    });

    const existingPredicates = Object.values(
      flatRowLevelPermissionPredicateMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (predicate) =>
          predicate.deletedAt === null &&
          isRowLevelPermissionPredicateOfParent(predicate, parent) &&
          predicate.objectMetadataId === objectMetadataId,
      );

    const existingGroups = Object.values(
      flatRowLevelPermissionPredicateGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (group) =>
          group.deletedAt === null &&
          isRowLevelPermissionPredicateOfParent(group, parent) &&
          group.objectMetadataId === objectMetadataId,
      );

    const {
      groupsToCreate,
      groupsToUpdate,
      groupsToDelete,
      flatRowLevelPermissionPredicateGroupMaps:
        flatRowLevelPermissionPredicateGroupMapsWithCreatedGroups,
    } = this.computePredicateGroupOperations({
      existingGroups,
      inputGroups: predicateGroups,
      parent,
      workspaceId,
      flatApplication: workspaceCustomFlatApplication,
      flatRowLevelPermissionPredicateGroupMaps,
      flatObjectMetadataMaps,
    });

    const { predicatesToCreate, predicatesToUpdate, predicatesToDelete } =
      this.computePredicateOperations({
        existingPredicates,
        inputPredicates: predicates,
        parent,
        objectMetadataId,
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
        flatRowLevelPermissionPredicateMaps,
        flatRowLevelPermissionPredicateGroupMaps:
          flatRowLevelPermissionPredicateGroupMapsWithCreatedGroups,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
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

    const resultPredicates = Object.values(
      updatedPredicateMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (predicate) =>
          predicate.deletedAt === null &&
          isRowLevelPermissionPredicateOfParent(predicate, parent) &&
          predicate.objectMetadataId === objectMetadataId,
      )
      .map(fromFlatRowLevelPermissionPredicateToDto);

    const resultGroups = Object.values(updatedGroupMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (group) =>
          group.deletedAt === null &&
          isRowLevelPermissionPredicateOfParent(group, parent) &&
          group.objectMetadataId === objectMetadataId,
      )
      .map(fromFlatRowLevelPermissionPredicateGroupToDto);

    return {
      predicates: resultPredicates,
      predicateGroups: resultGroups,
    };
  }

  private getParentIdsOrThrow({
    roleId,
    sharingRuleId,
  }: Pick<
    UpsertRowLevelPermissionPredicatesInput,
    'roleId' | 'sharingRuleId'
  >): RowLevelPermissionPredicateParentIds {
    if (isDefined(roleId) === isDefined(sharingRuleId)) {
      throw new RowLevelPermissionPredicateException(
        'Exactly one of roleId and sharingRuleId must be provided',
        RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
      );
    }

    return { roleId: roleId ?? null, sharingRuleId: sharingRuleId ?? null };
  }

  private resolveParentOrThrow({
    parentIds,
    objectMetadataId,
    flatRoleMaps,
    flatSharingRuleMaps,
  }: {
    parentIds: RowLevelPermissionPredicateParentIds;
    objectMetadataId: string;
    flatRoleMaps: AllFlatEntityMaps['flatRoleMaps'];
    flatSharingRuleMaps: AllFlatEntityMaps['flatSharingRuleMaps'];
  }): FlatRowLevelPermissionPredicateParent {
    if (isDefined(parentIds.roleId)) {
      const { roleUniversalIdentifier } =
        resolveEntityRelationUniversalIdentifiers({
          metadataName: 'rowLevelPermissionPredicate',
          foreignKeyValues: { roleId: parentIds.roleId },
          flatEntityMaps: { flatRoleMaps },
        });

      if (!isDefined(roleUniversalIdentifier)) {
        throw new RowLevelPermissionPredicateException(
          'Role not found',
          RowLevelPermissionPredicateExceptionCode.ROLE_NOT_FOUND,
        );
      }

      return {
        roleId: parentIds.roleId,
        roleUniversalIdentifier,
        sharingRuleId: null,
        sharingRuleUniversalIdentifier: null,
      };
    }

    const flatSharingRule = isDefined(parentIds.sharingRuleId)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: parentIds.sharingRuleId,
          flatEntityMaps: flatSharingRuleMaps,
        })
      : undefined;

    if (!isDefined(flatSharingRule)) {
      throw new RowLevelPermissionPredicateException(
        'Sharing rule not found',
        RowLevelPermissionPredicateExceptionCode.SHARING_RULE_NOT_FOUND,
      );
    }

    if (flatSharingRule.objectMetadataId !== objectMetadataId) {
      throw new RowLevelPermissionPredicateException(
        'Sharing rule applies to another object. Its criteria must filter on a field of the object it shares.',
        RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
      );
    }

    return {
      roleId: null,
      roleUniversalIdentifier: null,
      sharingRuleId: flatSharingRule.id,
      sharingRuleUniversalIdentifier: flatSharingRule.universalIdentifier,
    };
  }

  private computePredicateGroupOperations({
    existingGroups,
    inputGroups,
    parent,
    workspaceId,
    flatApplication,
    flatRowLevelPermissionPredicateGroupMaps,
    flatObjectMetadataMaps,
  }: {
    existingGroups: FlatRowLevelPermissionPredicateGroup[];
    inputGroups: RowLevelPermissionPredicateGroupInput[];
    parent: FlatRowLevelPermissionPredicateParent;
    workspaceId: string;
    flatApplication: FlatApplication;
    flatRowLevelPermissionPredicateGroupMaps: FlatEntityMaps<FlatRowLevelPermissionPredicateGroup>;
    flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
  }): {
    groupsToCreate: FlatRowLevelPermissionPredicateGroup[];
    groupsToUpdate: FlatRowLevelPermissionPredicateGroup[];
    groupsToDelete: FlatRowLevelPermissionPredicateGroup[];
    flatRowLevelPermissionPredicateGroupMaps: FlatEntityMaps<FlatRowLevelPermissionPredicateGroup>;
  } {
    const groupsToCreate: FlatRowLevelPermissionPredicateGroup[] = [];
    const groupsToUpdate: FlatRowLevelPermissionPredicateGroup[] = [];

    const inputGroupIds = new Set<string>();

    let currentGroupMaps = flatRowLevelPermissionPredicateGroupMaps;

    for (const inputGroup of inputGroups) {
      const groupId = inputGroup.id ?? v4();

      inputGroupIds.add(groupId);

      const existingGroup = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: groupId,
        flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
      });

      if (isDefined(existingGroup) && existingGroup.deletedAt === null) {
        groupsToUpdate.push(
          fromUpdateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroup(
            {
              input: inputGroup,
              existingGroup,
              flatRowLevelPermissionPredicateGroupMaps: currentGroupMaps,
            },
          ),
        );
      } else {
        const flatGroupToCreate =
          fromCreateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroup(
            {
              input: { ...inputGroup, id: groupId },
              parent,
              workspaceId,
              flatApplication,
              flatObjectMetadataMaps,
              flatRowLevelPermissionPredicateGroupMaps: currentGroupMaps,
            },
          );

        groupsToCreate.push(flatGroupToCreate);

        currentGroupMaps = addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: flatGroupToCreate,
          flatEntityMaps: currentGroupMaps,
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
      flatRowLevelPermissionPredicateGroupMaps: currentGroupMaps,
    };
  }

  private computePredicateOperations({
    existingPredicates,
    inputPredicates,
    parent,
    objectMetadataId,
    workspaceId,
    flatApplication,
    flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    existingPredicates: FlatRowLevelPermissionPredicate[];
    inputPredicates: RowLevelPermissionPredicateInput[];
    parent: FlatRowLevelPermissionPredicateParent;
    objectMetadataId: string;
    workspaceId: string;
    flatApplication: FlatApplication;
    flatRowLevelPermissionPredicateMaps: FlatEntityMaps<FlatRowLevelPermissionPredicate>;
    flatRowLevelPermissionPredicateGroupMaps: FlatEntityMaps<FlatRowLevelPermissionPredicateGroup>;
    flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
    flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
  }): {
    predicatesToCreate: FlatRowLevelPermissionPredicate[];
    predicatesToUpdate: FlatRowLevelPermissionPredicate[];
    predicatesToDelete: FlatRowLevelPermissionPredicate[];
  } {
    const predicatesToCreate: FlatRowLevelPermissionPredicate[] = [];
    const predicatesToUpdate: FlatRowLevelPermissionPredicate[] = [];

    const inputPredicateIds = new Set<string>();

    const { objectMetadataUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'rowLevelPermissionPredicate',
        foreignKeyValues: { objectMetadataId },
        flatEntityMaps: { flatObjectMetadataMaps },
      });

    for (const inputPredicate of inputPredicates) {
      const predicateId = inputPredicate.id ?? v4();

      inputPredicateIds.add(predicateId);

      const existingPredicate = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: predicateId,
        flatEntityMaps: flatRowLevelPermissionPredicateMaps,
      });

      if (
        isDefined(existingPredicate) &&
        existingPredicate.deletedAt === null
      ) {
        predicatesToUpdate.push(
          fromUpdateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicate(
            {
              input: inputPredicate,
              existingPredicate,
              flatFieldMetadataMaps,
              flatRowLevelPermissionPredicateGroupMaps,
            },
          ),
        );
      } else {
        predicatesToCreate.push(
          fromCreateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicate(
            {
              input: { ...inputPredicate, id: predicateId },
              parent,
              objectMetadataId,
              workspaceId,
              objectMetadataUniversalIdentifier,
              flatApplication,
              flatFieldMetadataMaps,
              flatRowLevelPermissionPredicateGroupMaps,
            },
          ),
        );
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
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

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
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
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
    return hasRowLevelPermissionFeature({
      workspaceId,
      billingService: this.billingService,
      enterprisePlanService: this.enterprisePlanService,
    });
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
