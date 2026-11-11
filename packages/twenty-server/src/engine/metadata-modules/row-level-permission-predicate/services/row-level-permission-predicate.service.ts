/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
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
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type FlatRowLevelPermissionRule } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-rule.type';
import { buildRowLevelPermissionRules } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/build-row-level-permission-rules.util';
import { removeDisabledOperationsFromRowLevelPermissionRule } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/remove-disabled-operations-from-row-level-permission-rule.util';
import { validateRowLevelPermissionRuleOwnershipOrThrow } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/validate-row-level-permission-rule-ownership.util';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const RULE_OPERATION_KEYS = [
  'canCreateRecords',
  'canReadRecords',
  'canUpdateRecords',
  'canSoftDeleteRecords',
  'canDestroyRecords',
] as const;

type RuleOperationKey = (typeof RULE_OPERATION_KEYS)[number];

const withDefinedRuleOperations = (
  ruleOperations: Partial<Record<RuleOperationKey, boolean>>,
): Partial<Record<RuleOperationKey, boolean>> =>
  Object.fromEntries(
    RULE_OPERATION_KEYS.flatMap((ruleOperationKey) =>
      isDefined(ruleOperations[ruleOperationKey])
        ? [[ruleOperationKey, ruleOperations[ruleOperationKey]]]
        : [],
    ),
  );

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

    validateRowLevelPermissionRuleOwnershipOrThrow({
      roleId,
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

    const existingPredicates = Object.values(
      flatRowLevelPermissionPredicateMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (predicate) =>
          predicate.deletedAt === null &&
          predicate.roleId === roleId &&
          predicate.objectMetadataId === objectMetadataId,
      );

    const existingGroups = Object.values(
      flatRowLevelPermissionPredicateGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (group) =>
          group.deletedAt === null &&
          group.roleId === roleId &&
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
      roleId,
      workspaceId,
      flatApplication: workspaceCustomFlatApplication,
      flatRowLevelPermissionPredicateGroupMaps,
      flatRoleMaps,
      flatObjectMetadataMaps,
    });

    const { predicatesToCreate, predicatesToUpdate, predicatesToDelete } =
      this.computePredicateOperations({
        existingPredicates,
        inputPredicates: predicates,
        roleId,
        objectMetadataId,
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
        flatRowLevelPermissionPredicateMaps,
        flatRowLevelPermissionPredicateGroupMaps:
          flatRowLevelPermissionPredicateGroupMapsWithCreatedGroups,
        flatRoleMaps,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

    const ruleChanges = this.computeRuleChanges({
      existingGroups,
      existingPredicates,
      groupsToCreate,
      groupsToUpdate,
      groupsToDelete,
      predicatesToCreate,
      predicatesToUpdate,
      predicatesToDelete,
      roleId,
      objectMetadataId,
      workspaceId,
      flatApplication: workspaceCustomFlatApplication,
      flatRowLevelPermissionRuleMaps,
      flatFieldPermissionMaps,
      ruleOperations: removeDisabledOperationsFromRowLevelPermissionRule({
        ruleOperations: {
          canCreateRecords: input.canCreateRecords,
          canReadRecords: input.canReadRecords,
          canUpdateRecords: input.canUpdateRecords,
          canSoftDeleteRecords: input.canSoftDeleteRecords,
          canDestroyRecords: input.canDestroyRecords,
        },
        flatObjectMetadata: findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: objectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        }),
      }),
    });

    await this.runUpsertMigration({
      workspaceId,
      ...ruleChanges,
      predicatesToDelete,
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
          predicate.roleId === roleId &&
          predicate.objectMetadataId === objectMetadataId,
      )
      .map(fromFlatRowLevelPermissionPredicateToDto);

    const resultGroups = Object.values(updatedGroupMaps.byUniversalIdentifier)
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
    flatApplication,
    flatRowLevelPermissionPredicateGroupMaps,
    flatRoleMaps,
    flatObjectMetadataMaps,
  }: {
    existingGroups: FlatRowLevelPermissionPredicateGroup[];
    inputGroups: RowLevelPermissionPredicateGroupInput[];
    roleId: string;
    workspaceId: string;
    flatApplication: FlatApplication;
    flatRowLevelPermissionPredicateGroupMaps: FlatEntityMaps<FlatRowLevelPermissionPredicateGroup>;
    flatRoleMaps: AllFlatEntityMaps['flatRoleMaps'];
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

    const { roleUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'rowLevelPermissionPredicateGroup',
        foreignKeyValues: { roleId },
        flatEntityMaps: { flatRoleMaps },
      });

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
              roleId,
              workspaceId,
              roleUniversalIdentifier,
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

    const groupsToDelete = existingGroups.filter(
      (group) => !inputGroupIds.has(group.id),
    );

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
    roleId,
    objectMetadataId,
    workspaceId,
    flatApplication,
    flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps,
    flatRoleMaps,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    existingPredicates: FlatRowLevelPermissionPredicate[];
    inputPredicates: RowLevelPermissionPredicateInput[];
    roleId: string;
    objectMetadataId: string;
    workspaceId: string;
    flatApplication: FlatApplication;
    flatRowLevelPermissionPredicateMaps: FlatEntityMaps<FlatRowLevelPermissionPredicate>;
    flatRowLevelPermissionPredicateGroupMaps: FlatEntityMaps<FlatRowLevelPermissionPredicateGroup>;
    flatRoleMaps: AllFlatEntityMaps['flatRoleMaps'];
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

    const { roleUniversalIdentifier, objectMetadataUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'rowLevelPermissionPredicate',
        foreignKeyValues: { roleId, objectMetadataId },
        flatEntityMaps: { flatRoleMaps, flatObjectMetadataMaps },
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
              roleId,
              objectMetadataId,
              workspaceId,
              roleUniversalIdentifier,
              objectMetadataUniversalIdentifier,
              flatApplication,
              flatFieldMetadataMaps,
              flatRowLevelPermissionPredicateGroupMaps,
            },
          ),
        );
      }
    }

    const predicatesToDelete = existingPredicates.filter(
      (predicate) => !inputPredicateIds.has(predicate.id),
    );

    return {
      predicatesToCreate,
      predicatesToUpdate,
      predicatesToDelete,
    };
  }

  private computeRuleChanges({
    existingGroups,
    existingPredicates,
    groupsToCreate,
    groupsToUpdate,
    groupsToDelete,
    predicatesToCreate,
    predicatesToUpdate,
    predicatesToDelete,
    roleId,
    objectMetadataId,
    workspaceId,
    flatApplication,
    flatRowLevelPermissionRuleMaps,
    flatFieldPermissionMaps,
    ruleOperations,
  }: {
    existingGroups: FlatRowLevelPermissionPredicateGroup[];
    existingPredicates: FlatRowLevelPermissionPredicate[];
    groupsToCreate: FlatRowLevelPermissionPredicateGroup[];
    groupsToUpdate: FlatRowLevelPermissionPredicateGroup[];
    groupsToDelete: FlatRowLevelPermissionPredicateGroup[];
    predicatesToCreate: FlatRowLevelPermissionPredicate[];
    predicatesToUpdate: FlatRowLevelPermissionPredicate[];
    predicatesToDelete: FlatRowLevelPermissionPredicate[];
    roleId: string;
    objectMetadataId: string;
    workspaceId: string;
    flatApplication: FlatApplication;
    flatRowLevelPermissionRuleMaps: FlatEntityMaps<FlatRowLevelPermissionRule>;
    flatFieldPermissionMaps: FlatEntityMaps<FlatFieldPermission>;
    ruleOperations: Partial<Pick<FlatRowLevelPermissionRule, RuleOperationKey>>;
  }): {
    rulesToCreate: FlatRowLevelPermissionRule[];
    rulesToUpdate: FlatRowLevelPermissionRule[];
    fieldPermissionsToUpdate: FlatFieldPermission[];
    rulesToDelete: FlatRowLevelPermissionRule[];
    groupsToCreate: FlatRowLevelPermissionPredicateGroup[];
    groupsToUpdate: FlatRowLevelPermissionPredicateGroup[];
    predicatesToCreate: FlatRowLevelPermissionPredicate[];
    predicatesToUpdate: FlatRowLevelPermissionPredicate[];
  } {
    const keepAfterUpsert = <TEntity extends { id: string }>({
      existing,
      toCreate,
      toUpdate,
      toDelete,
    }: {
      existing: TEntity[];
      toCreate: TEntity[];
      toUpdate: TEntity[];
      toDelete: TEntity[];
    }): TEntity[] => {
      const entityById = new Map(existing.map((entity) => [entity.id, entity]));

      for (const entity of toDelete) {
        entityById.delete(entity.id);
      }

      for (const entity of [...toUpdate, ...toCreate]) {
        entityById.set(entity.id, entity);
      }

      return [...entityById.values()];
    };

    const groups = keepAfterUpsert({
      existing: existingGroups,
      toCreate: groupsToCreate,
      toUpdate: groupsToUpdate,
      toDelete: groupsToDelete,
    });
    const predicates = keepAfterUpsert({
      existing: existingPredicates,
      toCreate: predicatesToCreate,
      toUpdate: predicatesToUpdate,
      toDelete: predicatesToDelete,
    });

    const {
      rules,
      ruleUniversalIdentifierByPredicateGroupUniversalIdentifier,
      ruleUniversalIdentifierByPredicateUniversalIdentifier,
    } = buildRowLevelPermissionRules({
      predicateGroups: groups,
      predicates,
      now: new Date().toISOString(),
    });

    const existingRules = Object.values(
      flatRowLevelPermissionRuleMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (rule) =>
          rule.roleId === roleId && rule.objectMetadataId === objectMetadataId,
      );
    const existingRuleByUniversalIdentifier = new Map(
      existingRules.map((rule) => [rule.universalIdentifier, rule]),
    );

    const rulesToCreate: FlatRowLevelPermissionRule[] = rules
      .filter(
        ({ universalIdentifier }) =>
          !existingRuleByUniversalIdentifier.has(universalIdentifier),
      )
      .map((rule) => ({
        ...rule,
        ...withDefinedRuleOperations(ruleOperations),
        id: v4(),
        workspaceId,
        applicationId: flatApplication.id,
        roleId,
        objectMetadataId,
      }));
    const rulesToUpdate = existingRules.flatMap((existingRule) => {
      const updatedRule = {
        ...existingRule,
        ...withDefinedRuleOperations(ruleOperations),
      };

      return RULE_OPERATION_KEYS.some(
        (ruleOperationKey) =>
          updatedRule[ruleOperationKey] !== existingRule[ruleOperationKey],
      )
        ? [updatedRule]
        : [];
    });
    const ruleUniversalIdentifiers = new Set(
      rules.map(({ universalIdentifier }) => universalIdentifier),
    );
    const rulesToDelete = existingRules.filter(
      ({ universalIdentifier }) =>
        !ruleUniversalIdentifiers.has(universalIdentifier),
    );
    const ruleIdByUniversalIdentifier = new Map(
      [...existingRules, ...rulesToCreate].map((rule) => [
        rule.universalIdentifier,
        rule.id,
      ]),
    );

    const linkToRule = <
      TEntity extends {
        id: string;
        universalIdentifier: string;
        rowLevelPermissionRuleId: string | null;
        rowLevelPermissionRuleUniversalIdentifier: string | null;
      },
    >({
      entities,
      toCreate,
      ruleUniversalIdentifierByEntityUniversalIdentifier,
    }: {
      entities: TEntity[];
      toCreate: TEntity[];
      ruleUniversalIdentifierByEntityUniversalIdentifier: Map<string, string>;
    }): { linkedToCreate: TEntity[]; linkedToUpdate: TEntity[] } => {
      const idsToCreate = new Set(toCreate.map(({ id }) => id));
      const linkedToCreate: TEntity[] = [];
      const linkedToUpdate: TEntity[] = [];

      for (const entity of entities) {
        const rowLevelPermissionRuleUniversalIdentifier =
          ruleUniversalIdentifierByEntityUniversalIdentifier.get(
            entity.universalIdentifier,
          ) ?? null;
        const linkedEntity = {
          ...entity,
          rowLevelPermissionRuleUniversalIdentifier,
          rowLevelPermissionRuleId: isDefined(
            rowLevelPermissionRuleUniversalIdentifier,
          )
            ? (ruleIdByUniversalIdentifier.get(
                rowLevelPermissionRuleUniversalIdentifier,
              ) ?? null)
            : null,
        };

        if (idsToCreate.has(entity.id)) {
          linkedToCreate.push(linkedEntity);
        } else {
          linkedToUpdate.push(linkedEntity);
        }
      }

      return { linkedToCreate, linkedToUpdate };
    };

    const groupIdsToUpdate = new Set(groupsToUpdate.map(({ id }) => id));
    const predicateIdsToUpdate = new Set(
      predicatesToUpdate.map(({ id }) => id),
    );

    const linkedGroups = linkToRule({
      entities: groups,
      toCreate: groupsToCreate,
      ruleUniversalIdentifierByEntityUniversalIdentifier:
        ruleUniversalIdentifierByPredicateGroupUniversalIdentifier,
    });
    const linkedPredicates = linkToRule({
      entities: predicates,
      toCreate: predicatesToCreate,
      ruleUniversalIdentifierByEntityUniversalIdentifier:
        ruleUniversalIdentifierByPredicateUniversalIdentifier,
    });

    const existingGroupById = new Map(
      existingGroups.map((group) => [group.id, group]),
    );
    const existingPredicateById = new Map(
      existingPredicates.map((predicate) => [predicate.id, predicate]),
    );

    // Rule-level field permissions cascade with their rule, so they must follow a group that moves to another rule
    const ruleIdByGroupId = new Map(
      [...linkedGroups.linkedToCreate, ...linkedGroups.linkedToUpdate].map(
        (group) => [group.id, group.rowLevelPermissionRuleId],
      ),
    );
    const fieldPermissionsToUpdate = Object.values(
      flatFieldPermissionMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .flatMap((fieldPermission) => {
        if (
          !isDefined(fieldPermission.rowLevelPermissionPredicateGroupId) ||
          !ruleIdByGroupId.has(
            fieldPermission.rowLevelPermissionPredicateGroupId,
          )
        ) {
          return [];
        }

        const rowLevelPermissionRuleId =
          ruleIdByGroupId.get(
            fieldPermission.rowLevelPermissionPredicateGroupId,
          ) ?? null;

        if (
          rowLevelPermissionRuleId === fieldPermission.rowLevelPermissionRuleId
        ) {
          return [];
        }

        const rule = [...existingRules, ...rulesToCreate].find(
          ({ id }) => id === rowLevelPermissionRuleId,
        );

        return [
          {
            ...fieldPermission,
            rowLevelPermissionRuleId,
            rowLevelPermissionRuleUniversalIdentifier:
              rule?.universalIdentifier ?? null,
          },
        ];
      });

    return {
      rulesToCreate,
      rulesToUpdate: rulesToUpdate.filter(({ universalIdentifier }) =>
        ruleUniversalIdentifiers.has(universalIdentifier),
      ),
      rulesToDelete,
      fieldPermissionsToUpdate,
      groupsToCreate: linkedGroups.linkedToCreate,
      groupsToUpdate: linkedGroups.linkedToUpdate.filter(
        (group) =>
          groupIdsToUpdate.has(group.id) ||
          existingGroupById.get(group.id)?.rowLevelPermissionRuleId !==
            group.rowLevelPermissionRuleId,
      ),
      predicatesToCreate: linkedPredicates.linkedToCreate,
      predicatesToUpdate: linkedPredicates.linkedToUpdate.filter(
        (predicate) =>
          predicateIdsToUpdate.has(predicate.id) ||
          existingPredicateById.get(predicate.id)?.rowLevelPermissionRuleId !==
            predicate.rowLevelPermissionRuleId,
      ),
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
