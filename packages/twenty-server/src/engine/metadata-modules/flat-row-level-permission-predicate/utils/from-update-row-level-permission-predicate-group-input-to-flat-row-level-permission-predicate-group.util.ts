import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlattenedRowLevelPermissionPredicateGroupInput } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flattened-row-level-permission-rule-inputs.type';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';

export const fromUpdateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroup =
  ({
    input,
    existingGroup,
    rowLevelPermissionRuleUniversalIdentifier,
    flatRowLevelPermissionPredicateGroupMaps,
  }: {
    input: FlattenedRowLevelPermissionPredicateGroupInput;
    existingGroup: FlatRowLevelPermissionPredicateGroup;
    rowLevelPermissionRuleUniversalIdentifier: string;
    flatRowLevelPermissionPredicateGroupMaps: FlatEntityMaps<FlatRowLevelPermissionPredicateGroup>;
  }): FlatRowLevelPermissionPredicateGroup => {
    const { parentRowLevelPermissionPredicateGroupUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'rowLevelPermissionPredicateGroup',
        foreignKeyValues: {
          parentRowLevelPermissionPredicateGroupId:
            input.parentRowLevelPermissionPredicateGroupId,
        },
        flatEntityMaps: {
          flatRowLevelPermissionPredicateGroupMaps,
        },
      });

    return {
      ...existingGroup,
      logicalOperator: input.logicalOperator,
      parentRowLevelPermissionPredicateGroupId:
        input.parentRowLevelPermissionPredicateGroupId,
      parentRowLevelPermissionPredicateGroupUniversalIdentifier,
      rowLevelPermissionRuleId: input.rowLevelPermissionRuleId,
      rowLevelPermissionRuleUniversalIdentifier,
      positionInRowLevelPermissionPredicateGroup:
        input.positionInRowLevelPermissionPredicateGroup,
      updatedAt: new Date().toISOString(),
    };
  };
