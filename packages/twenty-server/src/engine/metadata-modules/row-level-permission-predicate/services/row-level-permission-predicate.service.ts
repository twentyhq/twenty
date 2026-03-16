/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { RowLevelPermissionPredicateScope } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
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
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class RowLevelPermissionPredicateService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
            'flatRoleMaps',
            'flatObjectMetadataMaps',
            'flatFieldMetadataMaps',
          ],
        },
      );

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

    this.validateScopedPredicateTree({
      inputGroups: predicateGroups,
      inputPredicates: predicates,
      existingGroups,
      existingPredicates,
    });

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

  private validateScopedPredicateTree({
    inputGroups,
    inputPredicates,
    existingGroups,
    existingPredicates,
  }: {
    inputGroups: RowLevelPermissionPredicateGroupInput[];
    inputPredicates: RowLevelPermissionPredicateInput[];
    existingGroups: FlatRowLevelPermissionPredicateGroup[];
    existingPredicates: FlatRowLevelPermissionPredicate[];
  }): void {
    const existingGroupScopeById = new Map(
      existingGroups.map((group) => [group.id, group.scope]),
    );
    const existingPredicateScopeById = new Map(
      existingPredicates.map((predicate) => [predicate.id, predicate.scope]),
    );
    const resolvedGroupScopesById = new Map<
      string,
      RowLevelPermissionPredicateScope
    >();

    for (const inputGroup of inputGroups) {
      if (!isDefined(inputGroup.id)) {
        continue;
      }

      resolvedGroupScopesById.set(
        inputGroup.id,
        this.resolveRowLevelPermissionPredicateScope({
          inputScope: inputGroup.scope,
          existingScope: existingGroupScopeById.get(inputGroup.id),
        }),
      );
    }

    for (const inputGroup of inputGroups) {
      const groupId = inputGroup.id;
      const groupScope = this.resolveRowLevelPermissionPredicateScope({
        inputScope: inputGroup.scope,
        existingScope: groupId
          ? existingGroupScopeById.get(groupId)
          : undefined,
      });

      if (!isDefined(inputGroup.parentRowLevelPermissionPredicateGroupId)) {
        continue;
      }

      const parentGroupScope = resolvedGroupScopesById.get(
        inputGroup.parentRowLevelPermissionPredicateGroupId,
      );

      if (!isDefined(parentGroupScope)) {
        throw new RowLevelPermissionPredicateException(
          `Predicate group ${groupId ?? '<new>'} references missing parent group ${inputGroup.parentRowLevelPermissionPredicateGroupId}`,
          RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        );
      }

      if (parentGroupScope !== groupScope) {
        throw new RowLevelPermissionPredicateException(
          `Predicate group ${groupId ?? '<new>'} scope ${groupScope} must match parent group scope ${parentGroupScope}`,
          RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        );
      }
    }

    for (const inputPredicate of inputPredicates) {
      const predicateScope = this.resolveRowLevelPermissionPredicateScope({
        inputScope: inputPredicate.scope,
        existingScope: inputPredicate.id
          ? existingPredicateScopeById.get(inputPredicate.id)
          : undefined,
      });

      if (!isDefined(inputPredicate.rowLevelPermissionPredicateGroupId)) {
        continue;
      }

      const predicateGroupScope = resolvedGroupScopesById.get(
        inputPredicate.rowLevelPermissionPredicateGroupId,
      );

      if (!isDefined(predicateGroupScope)) {
        throw new RowLevelPermissionPredicateException(
          `Predicate ${inputPredicate.id ?? '<new>'} references missing group ${inputPredicate.rowLevelPermissionPredicateGroupId}`,
          RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        );
      }

      if (predicateGroupScope !== predicateScope) {
        throw new RowLevelPermissionPredicateException(
          `Predicate ${inputPredicate.id ?? '<new>'} scope ${predicateScope} must match group scope ${predicateGroupScope}`,
          RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        );
      }
    }
  }

  private resolveRowLevelPermissionPredicateScope({
    inputScope,
    existingScope,
  }: {
    inputScope?: RowLevelPermissionPredicateScope | null;
    existingScope?: RowLevelPermissionPredicateScope | null;
  }): RowLevelPermissionPredicateScope {
    return inputScope ?? existingScope ?? RowLevelPermissionPredicateScope.ALL;
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
    _workspaceId: string,
  ): Promise<boolean> {
    return true;
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
