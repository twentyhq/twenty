/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { fromCreateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-create-row-level-permission-predicate-group-input-to-flat-row-level-permission-predicate-group.util';
import { fromCreateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-create-row-level-permission-predicate-input-to-flat-row-level-permission-predicate.util';
import { fromFlatRowLevelPermissionPredicateGroupToDto } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-flat-row-level-permission-predicate-group-to-dto.util';
import { fromFlatRowLevelPermissionPredicateToDto } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-flat-row-level-permission-predicate-to-dto.util';
import { fromUpdateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-update-row-level-permission-predicate-group-input-to-flat-row-level-permission-predicate-group.util';
import { fromUpdateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-update-row-level-permission-predicate-input-to-flat-row-level-permission-predicate.util';
import { type UpsertRowLevelPermissionRulesInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-rules.input';
import { RowLevelPermissionPredicateDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto';
import { type UpsertRowLevelPermissionRulesResultDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/upsert-row-level-permission-rules-result.dto';
import {
  RowLevelPermissionPredicateException,
  RowLevelPermissionPredicateExceptionCode,
} from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type FlatRowLevelPermissionRule } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-rule.type';
import { flattenRowLevelPermissionRuleInputs } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/flatten-row-level-permission-rule-inputs.util';
import { removeDisabledOperationsFromRowLevelPermissionRule } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/remove-disabled-operations-from-row-level-permission-rule.util';
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
      .filter(isDefined)
      .filter((predicate) => predicate.deletedAt === null)
      .sort(
        (a, b) =>
          (a.positionInRowLevelPermissionPredicateGroup ?? 0) -
          (b.positionInRowLevelPermissionPredicateGroup ?? 0),
      )
      .map(fromFlatRowLevelPermissionPredicateToDto);
  }

  async upsertRowLevelPermissionRules({
    input,
    workspaceId,
  }: {
    input: UpsertRowLevelPermissionRulesInput;
    workspaceId: string;
  }): Promise<UpsertRowLevelPermissionRulesResultDTO> {
    await this.hasRowLevelPermissionFeatureOrThrow(workspaceId);

    const { roleId, objectMetadataId } = input;

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const {
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatRowLevelPermissionRuleMaps,
      flatFieldPermissionMaps,
      flatRoleMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatRowLevelPermissionPredicateMaps',
            'flatRowLevelPermissionPredicateGroupMaps',
            'flatRowLevelPermissionRuleMaps',
            'flatFieldPermissionMaps',
            'flatRoleMaps',
            'flatObjectMetadataMaps',
            'flatFieldMetadataMaps',
          ],
        },
      );

    const flattened = flattenRowLevelPermissionRuleInputs(input.rules);

    const inputIds = [
      ...flattened.rules,
      ...flattened.predicateGroups,
      ...flattened.predicates,
    ].map(({ id }) => id);

    if (new Set(inputIds).size !== inputIds.length) {
      throw new RowLevelPermissionPredicateException(
        'The same id is used more than once across rules, predicate groups and predicates',
        RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
      );
    }

    validateRowLevelPermissionRuleOwnershipOrThrow({
      roleId,
      objectMetadataId,
      ...flattened,
      flatRowLevelPermissionRuleMaps,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps,
      workspaceMemberObjectMetadataId: buildObjectIdByNameMaps(
        flatObjectMetadataMaps,
      ).idByNameSingular.workspaceMember,
    });

    const isOfRoleAndObject = (entity: {
      roleId: string;
      objectMetadataId: string;
    }) =>
      entity.roleId === roleId && entity.objectMetadataId === objectMetadataId;

    const existingRules = Object.values(
      flatRowLevelPermissionRuleMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(isOfRoleAndObject);
    const existingGroups = Object.values(
      flatRowLevelPermissionPredicateGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((group) => group.deletedAt === null && isOfRoleAndObject(group));
    const existingPredicates = Object.values(
      flatRowLevelPermissionPredicateMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (predicate) =>
          predicate.deletedAt === null && isOfRoleAndObject(predicate),
      );

    const { roleUniversalIdentifier, objectMetadataUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'rowLevelPermissionPredicate',
        foreignKeyValues: { roleId, objectMetadataId },
        flatEntityMaps: { flatRoleMaps, flatObjectMetadataMaps },
      });
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });
    const now = new Date().toISOString();

    const rulesToCreate: FlatRowLevelPermissionRule[] = [];
    const rulesToUpdate: FlatRowLevelPermissionRule[] = [];

    for (const { id, ...ruleOperations } of flattened.rules) {
      const enabledRuleOperations = {
        ...ruleOperations,
        ...removeDisabledOperationsFromRowLevelPermissionRule({
          ruleOperations,
          flatObjectMetadata,
        }),
      };
      const existingRule = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: id,
        flatEntityMaps: flatRowLevelPermissionRuleMaps,
      });

      if (isDefined(existingRule)) {
        rulesToUpdate.push({
          ...existingRule,
          ...enabledRuleOperations,
          updatedAt: now,
        });
      } else {
        rulesToCreate.push({
          ...enabledRuleOperations,
          id,
          universalIdentifier: id,
          workspaceId,
          applicationId: workspaceCustomFlatApplication.id,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          roleId,
          roleUniversalIdentifier,
          objectMetadataId,
          objectMetadataUniversalIdentifier,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    const ruleUniversalIdentifierById = new Map(
      [...rulesToCreate, ...rulesToUpdate].map((rule) => [
        rule.id,
        rule.universalIdentifier,
      ]),
    );
    const getRuleUniversalIdentifierOrThrow = (
      rowLevelPermissionRuleId: string,
    ) => {
      const ruleUniversalIdentifier = ruleUniversalIdentifierById.get(
        rowLevelPermissionRuleId,
      );

      if (!isDefined(ruleUniversalIdentifier)) {
        throw new RowLevelPermissionPredicateException(
          `Rule ${rowLevelPermissionRuleId} is not part of this upsert`,
          RowLevelPermissionPredicateExceptionCode.INTERNAL_SERVER_ERROR,
        );
      }

      return ruleUniversalIdentifier;
    };

    const existingGroupById = new Map(
      existingGroups.map((group) => [group.id, group]),
    );
    const existingPredicateById = new Map(
      existingPredicates.map((predicate) => [predicate.id, predicate]),
    );

    const groupsToCreate: FlatRowLevelPermissionPredicateGroup[] = [];
    const groupsToUpdate: FlatRowLevelPermissionPredicateGroup[] = [];
    let groupMapsWithCreatedGroups = flatRowLevelPermissionPredicateGroupMaps;

    for (const predicateGroup of flattened.predicateGroups) {
      const existingGroup = existingGroupById.get(predicateGroup.id);
      const rowLevelPermissionRuleUniversalIdentifier =
        getRuleUniversalIdentifierOrThrow(
          predicateGroup.rowLevelPermissionRuleId,
        );

      if (isDefined(existingGroup)) {
        groupsToUpdate.push(
          fromUpdateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroup(
            {
              input: predicateGroup,
              existingGroup,
              rowLevelPermissionRuleUniversalIdentifier,
              flatRowLevelPermissionPredicateGroupMaps:
                groupMapsWithCreatedGroups,
            },
          ),
        );
        continue;
      }

      const groupToCreate =
        fromCreateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroup(
          {
            input: predicateGroup,
            roleId,
            objectMetadataId,
            workspaceId,
            roleUniversalIdentifier,
            rowLevelPermissionRuleUniversalIdentifier,
            flatApplication: workspaceCustomFlatApplication,
            flatObjectMetadataMaps,
            flatRowLevelPermissionPredicateGroupMaps:
              groupMapsWithCreatedGroups,
          },
        );

      groupsToCreate.push(groupToCreate);
      groupMapsWithCreatedGroups = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: groupToCreate,
        flatEntityMaps: groupMapsWithCreatedGroups,
      });
    }

    const predicatesToCreate: FlatRowLevelPermissionPredicate[] = [];
    const predicatesToUpdate: FlatRowLevelPermissionPredicate[] = [];

    for (const predicate of flattened.predicates) {
      const existingPredicate = existingPredicateById.get(predicate.id);
      const rowLevelPermissionRuleUniversalIdentifier =
        getRuleUniversalIdentifierOrThrow(predicate.rowLevelPermissionRuleId);

      if (isDefined(existingPredicate)) {
        predicatesToUpdate.push(
          fromUpdateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicate(
            {
              input: predicate,
              existingPredicate,
              rowLevelPermissionRuleUniversalIdentifier,
              flatFieldMetadataMaps,
              flatRowLevelPermissionPredicateGroupMaps:
                groupMapsWithCreatedGroups,
            },
          ),
        );
        continue;
      }

      predicatesToCreate.push(
        fromCreateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicate(
          {
            input: predicate,
            roleId,
            objectMetadataId,
            workspaceId,
            roleUniversalIdentifier,
            objectMetadataUniversalIdentifier,
            rowLevelPermissionRuleUniversalIdentifier,
            flatApplication: workspaceCustomFlatApplication,
            flatFieldMetadataMaps,
            flatRowLevelPermissionPredicateGroupMaps:
              groupMapsWithCreatedGroups,
          },
        ),
      );
    }

    const isNotIn = (inputEntities: { id: string }[]) => {
      const inputIds = new Set(inputEntities.map(({ id }) => id));

      return (entity: { id: string }) => !inputIds.has(entity.id);
    };

    const ruleIdByGroupId = new Map(
      flattened.predicateGroups.map(({ id, rowLevelPermissionRuleId }) => [
        id,
        rowLevelPermissionRuleId,
      ]),
    );
    // A rule's field permissions are keyed by one of its groups, so they follow that group to its rule
    const fieldPermissionsToUpdate = Object.values(
      flatFieldPermissionMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .flatMap((fieldPermission) => {
        if (!isDefined(fieldPermission.rowLevelPermissionPredicateGroupId)) {
          return [];
        }

        const rowLevelPermissionRuleId = ruleIdByGroupId.get(
          fieldPermission.rowLevelPermissionPredicateGroupId,
        );

        if (
          !isDefined(rowLevelPermissionRuleId) ||
          rowLevelPermissionRuleId === fieldPermission.rowLevelPermissionRuleId
        ) {
          return [];
        }

        return [
          {
            ...fieldPermission,
            rowLevelPermissionRuleId,
            rowLevelPermissionRuleUniversalIdentifier:
              getRuleUniversalIdentifierOrThrow(rowLevelPermissionRuleId),
          },
        ];
      });

    await this.runUpsertMigration({
      workspaceId,
      rulesToCreate,
      rulesToUpdate,
      rulesToDelete: existingRules.filter(isNotIn(flattened.rules)),
      fieldPermissionsToUpdate,
      groupsToCreate,
      groupsToUpdate,
      groupsToDelete: existingGroups.filter(isNotIn(flattened.predicateGroups)),
      predicatesToCreate,
      predicatesToUpdate,
      predicatesToDelete: existingPredicates.filter(
        isNotIn(flattened.predicates),
      ),
    });

    const {
      flatRowLevelPermissionRuleMaps: updatedRuleMaps,
      flatRowLevelPermissionPredicateMaps: updatedPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps: updatedGroupMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatRowLevelPermissionRuleMaps',
          'flatRowLevelPermissionPredicateMaps',
          'flatRowLevelPermissionPredicateGroupMaps',
        ],
      },
    );

    return {
      rules: Object.values(updatedRuleMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(isOfRoleAndObject),
      predicateGroups: Object.values(updatedGroupMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter((group) => group.deletedAt === null && isOfRoleAndObject(group))
        .map(fromFlatRowLevelPermissionPredicateGroupToDto),
      predicates: Object.values(updatedPredicateMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(
          (predicate) =>
            predicate.deletedAt === null && isOfRoleAndObject(predicate),
        )
        .map(fromFlatRowLevelPermissionPredicateToDto),
    };
  }

  private async runUpsertMigration({
    workspaceId,
    rulesToCreate,
    rulesToUpdate,
    rulesToDelete,
    fieldPermissionsToUpdate,
    predicatesToCreate,
    predicatesToUpdate,
    predicatesToDelete,
    groupsToCreate,
    groupsToUpdate,
    groupsToDelete,
  }: {
    workspaceId: string;
    rulesToCreate: FlatRowLevelPermissionRule[];
    rulesToUpdate: FlatRowLevelPermissionRule[];
    rulesToDelete: FlatRowLevelPermissionRule[];
    fieldPermissionsToUpdate: FlatFieldPermission[];
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
            rowLevelPermissionRule: {
              flatEntityToCreate: rulesToCreate,
              flatEntityToUpdate: rulesToUpdate,
              flatEntityToDelete: rulesToDelete,
            },
            rowLevelPermissionPredicateGroup: {
              flatEntityToCreate: groupsToCreate,
              flatEntityToUpdate: groupsToUpdate,
              flatEntityToDelete: groupsToDelete,
            },
            rowLevelPermissionPredicate: {
              flatEntityToCreate: predicatesToCreate,
              flatEntityToUpdate: predicatesToUpdate,
              flatEntityToDelete: predicatesToDelete,
            },
            fieldPermission: {
              flatEntityToCreate: [],
              flatEntityToUpdate: fieldPermissionsToUpdate,
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

  async hasRowLevelPermissionFeature(workspaceId: string): Promise<boolean> {
    const hasValidEnterprisePlan = this.enterprisePlanService.isValid();

    const isRowLevelPermissionEnabled =
      await this.billingService.hasEntitlement(
        workspaceId,
        BillingEntitlementKey.RLS,
      );

    return hasValidEnterprisePlan && isRowLevelPermissionEnabled;
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
