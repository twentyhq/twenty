import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlattenedRowLevelPermissionPredicateGroupInput } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flattened-row-level-permission-rule-inputs.type';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';

export const fromCreateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroup =
  ({
    input,
    roleId,
    objectMetadataId,
    workspaceId,
    rowLevelPermissionRuleUniversalIdentifier,
    roleUniversalIdentifier,
    flatApplication,
    flatObjectMetadataMaps,
    flatRowLevelPermissionPredicateGroupMaps,
  }: {
    input: FlattenedRowLevelPermissionPredicateGroupInput;
    roleId: string;
    objectMetadataId: string;
    workspaceId: string;
    rowLevelPermissionRuleUniversalIdentifier: string;
    roleUniversalIdentifier: string;
    flatApplication: FlatApplication;
  } & Pick<AllFlatEntityMaps, 'flatObjectMetadataMaps'> & {
      flatRowLevelPermissionPredicateGroupMaps: FlatEntityMaps<FlatRowLevelPermissionPredicateGroup>;
    }): FlatRowLevelPermissionPredicateGroup => {
    const createdAt = new Date().toISOString();

    const {
      objectMetadataUniversalIdentifier,
      parentRowLevelPermissionPredicateGroupUniversalIdentifier,
    } = resolveEntityRelationUniversalIdentifiers({
      metadataName: 'rowLevelPermissionPredicateGroup',
      foreignKeyValues: {
        objectMetadataId,
        parentRowLevelPermissionPredicateGroupId:
          input.parentRowLevelPermissionPredicateGroupId,
      },
      flatEntityMaps: {
        flatObjectMetadataMaps,
        flatRowLevelPermissionPredicateGroupMaps,
      },
    });

    return {
      id: input.id,
      workspaceId,
      roleId,
      roleUniversalIdentifier,
      objectMetadataId,
      objectMetadataUniversalIdentifier,
      logicalOperator: input.logicalOperator,
      parentRowLevelPermissionPredicateGroupId:
        input.parentRowLevelPermissionPredicateGroupId,
      parentRowLevelPermissionPredicateGroupUniversalIdentifier,
      rowLevelPermissionRuleId: input.rowLevelPermissionRuleId,
      rowLevelPermissionRuleUniversalIdentifier,
      positionInRowLevelPermissionPredicateGroup:
        input.positionInRowLevelPermissionPredicateGroup,
      canReadRecords: false,
      canCreateRecords: false,
      canUpdateRecords: false,
      canSoftDeleteRecords: false,
      canDestroyRecords: false,
      childRowLevelPermissionPredicateGroupIds: [],
      childRowLevelPermissionPredicateGroupUniversalIdentifiers: [],
      rowLevelPermissionPredicateIds: [],
      rowLevelPermissionPredicateUniversalIdentifiers: [],
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      universalIdentifier: input.id,
      applicationId: flatApplication.id,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
    };
  };
