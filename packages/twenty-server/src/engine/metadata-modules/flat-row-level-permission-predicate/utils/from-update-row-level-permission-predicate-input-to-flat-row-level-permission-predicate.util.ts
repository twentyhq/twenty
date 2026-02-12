import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type RowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';

export const fromUpdateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicate =
  ({
    input,
    existingPredicate,
    flatFieldMetadataMaps,
    flatRowLevelPermissionPredicateGroupMaps,
  }: {
    input: RowLevelPermissionPredicateInput;
    existingPredicate: FlatRowLevelPermissionPredicate;
  } & Pick<AllFlatEntityMaps, 'flatFieldMetadataMaps'> & {
      flatRowLevelPermissionPredicateGroupMaps: FlatEntityMaps<FlatRowLevelPermissionPredicateGroup>;
    }): FlatRowLevelPermissionPredicate => {
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
      ...existingPredicate,
      fieldMetadataId: input.fieldMetadataId,
      fieldMetadataUniversalIdentifier,
      operand: input.operand,
      value: input.value ?? null,
      subFieldName: input.subFieldName ?? null,
      workspaceMemberFieldMetadataId:
        input.workspaceMemberFieldMetadataId ?? null,
      workspaceMemberFieldMetadataUniversalIdentifier,
      workspaceMemberSubFieldName: input.workspaceMemberSubFieldName ?? null,
      rowLevelPermissionPredicateGroupId:
        input.rowLevelPermissionPredicateGroupId ?? null,
      rowLevelPermissionPredicateGroupUniversalIdentifier,
      positionInRowLevelPermissionPredicateGroup:
        input.positionInRowLevelPermissionPredicateGroup ?? null,
      updatedAt: new Date().toISOString(),
    };
  };
