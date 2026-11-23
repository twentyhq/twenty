import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlattenedRowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flattened-row-level-permission-rule-inputs.type';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';

export const fromUpdateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicate =
  ({
    input,
    existingPredicate,
    rowLevelPermissionRuleUniversalIdentifier,
    flatFieldMetadataMaps,
    flatRowLevelPermissionPredicateGroupMaps,
  }: {
    input: FlattenedRowLevelPermissionPredicateInput;
    existingPredicate: FlatRowLevelPermissionPredicate;
    rowLevelPermissionRuleUniversalIdentifier: string;
  } & Pick<AllFlatEntityMaps, 'flatFieldMetadataMaps'> & {
      flatRowLevelPermissionPredicateGroupMaps: FlatEntityMaps<FlatRowLevelPermissionPredicateGroup>;
    }): FlatRowLevelPermissionPredicate => {
    const {
      fieldMetadataUniversalIdentifier,
      relationFieldMetadataUniversalIdentifier,
      rowLevelPermissionPredicateGroupUniversalIdentifier,
      workspaceMemberFieldMetadataUniversalIdentifier,
      workspaceMemberRelationFieldMetadataUniversalIdentifier,
    } = resolveEntityRelationUniversalIdentifiers({
      metadataName: 'rowLevelPermissionPredicate',
      foreignKeyValues: {
        fieldMetadataId: input.fieldMetadataId,
        relationFieldMetadataId: input.relationFieldMetadataId,
        rowLevelPermissionPredicateGroupId:
          input.rowLevelPermissionPredicateGroupId,
        workspaceMemberFieldMetadataId: input.workspaceMemberFieldMetadataId,
        workspaceMemberRelationFieldMetadataId:
          input.workspaceMemberRelationFieldMetadataId,
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
      relationFieldMetadataId: input.relationFieldMetadataId ?? null,
      relationFieldMetadataUniversalIdentifier,
      operand: input.operand,
      value: input.value ?? null,
      subFieldName: input.subFieldName ?? null,
      workspaceMemberFieldMetadataId:
        input.workspaceMemberFieldMetadataId ?? null,
      workspaceMemberFieldMetadataUniversalIdentifier,
      workspaceMemberSubFieldName: input.workspaceMemberSubFieldName ?? null,
      workspaceMemberRelationFieldMetadataId:
        input.workspaceMemberRelationFieldMetadataId ?? null,
      workspaceMemberRelationFieldMetadataUniversalIdentifier,
      rowLevelPermissionPredicateGroupId:
        input.rowLevelPermissionPredicateGroupId,
      rowLevelPermissionPredicateGroupUniversalIdentifier,
      rowLevelPermissionRuleId: input.rowLevelPermissionRuleId,
      rowLevelPermissionRuleUniversalIdentifier,
      positionInRowLevelPermissionPredicateGroup:
        input.positionInRowLevelPermissionPredicateGroup,
      updatedAt: new Date().toISOString(),
    };
  };
