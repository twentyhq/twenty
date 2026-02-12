import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type RowLevelPermissionPredicateGroupInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';

export const fromCreateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroup =
  ({
    input,
    roleId,
    workspaceId,
    roleUniversalIdentifier,
    flatApplication,
    flatObjectMetadataMaps,
    flatRowLevelPermissionPredicateGroupMaps,
  }: {
    input: RowLevelPermissionPredicateGroupInput;
    roleId: string;
    workspaceId: string;
    roleUniversalIdentifier: string;
    flatApplication: FlatApplication;
  } & Pick<AllFlatEntityMaps, 'flatObjectMetadataMaps'> & {
      flatRowLevelPermissionPredicateGroupMaps: FlatEntityMaps<FlatRowLevelPermissionPredicateGroup>;
    }): FlatRowLevelPermissionPredicateGroup => {
    const groupId = input.id ?? v4();
    const createdAt = new Date().toISOString();

    const {
      objectMetadataUniversalIdentifier,
      parentRowLevelPermissionPredicateGroupUniversalIdentifier,
    } = resolveEntityRelationUniversalIdentifiers({
      metadataName: 'rowLevelPermissionPredicateGroup',
      foreignKeyValues: {
        objectMetadataId: input.objectMetadataId,
        parentRowLevelPermissionPredicateGroupId:
          input.parentRowLevelPermissionPredicateGroupId,
      },
      flatEntityMaps: {
        flatObjectMetadataMaps,
        flatRowLevelPermissionPredicateGroupMaps,
      },
    });

    return {
      id: groupId,
      workspaceId,
      roleId,
      roleUniversalIdentifier,
      objectMetadataId: input.objectMetadataId,
      objectMetadataUniversalIdentifier,
      logicalOperator: input.logicalOperator,
      parentRowLevelPermissionPredicateGroupId:
        input.parentRowLevelPermissionPredicateGroupId ?? null,
      parentRowLevelPermissionPredicateGroupUniversalIdentifier,
      positionInRowLevelPermissionPredicateGroup:
        input.positionInRowLevelPermissionPredicateGroup ?? null,
      childRowLevelPermissionPredicateGroupIds: [],
      childRowLevelPermissionPredicateGroupUniversalIdentifiers: [],
      rowLevelPermissionPredicateIds: [],
      rowLevelPermissionPredicateUniversalIdentifiers: [],
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      universalIdentifier: groupId,
      applicationId: flatApplication.id,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
    };
  };
