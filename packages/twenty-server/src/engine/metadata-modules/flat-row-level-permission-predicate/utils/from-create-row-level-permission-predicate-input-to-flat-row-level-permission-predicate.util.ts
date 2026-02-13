import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type RowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type UniversalFlatRowLevelPermissionPredicate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate.type';

export const fromCreateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicate =
  ({
    input,
    roleUniversalIdentifier,
    objectMetadataUniversalIdentifier,
    flatApplication,
    flatFieldMetadataMaps,
    flatRowLevelPermissionPredicateGroupMaps,
  }: {
    input: RowLevelPermissionPredicateInput;
    roleUniversalIdentifier: string;
    objectMetadataUniversalIdentifier: string;
    flatApplication: FlatApplication;
  } & Pick<AllFlatEntityMaps, 'flatFieldMetadataMaps'> & {
      flatRowLevelPermissionPredicateGroupMaps: FlatEntityMaps<FlatRowLevelPermissionPredicateGroup>;
    }): UniversalFlatRowLevelPermissionPredicate => {
    const createdAt = new Date().toISOString();

    const {
      fieldMetadataUniversalIdentifier,
      rowLevelPermissionPredicateGroupUniversalIdentifier,
      workspaceMemberFieldMetadataUniversalIdentifier,
    } = resolveEntityRelationUniversalIdentifiers({
      metadataName: 'rowLevelPermissionPredicate',
      foreignKeyValues: {
        fieldMetadataId: input.fieldMetadataId,
        rowLevelPermissionPredicateGroupId:
          input.rowLevelPermissionPredicateGroupId,
        workspaceMemberFieldMetadataId: input.workspaceMemberFieldMetadataId,
      },
      flatEntityMaps: {
        flatFieldMetadataMaps,
        flatRowLevelPermissionPredicateGroupMaps,
      },
    });

    return {
      roleUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      fieldMetadataUniversalIdentifier,
      operand: input.operand,
      value: input.value ?? null,
      subFieldName: input.subFieldName ?? null,
      workspaceMemberFieldMetadataUniversalIdentifier,
      workspaceMemberSubFieldName: input.workspaceMemberSubFieldName ?? null,
      rowLevelPermissionPredicateGroupUniversalIdentifier,
      positionInRowLevelPermissionPredicateGroup:
        input.positionInRowLevelPermissionPredicateGroup ?? null,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      universalIdentifier: v4(),
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
    };
  };
