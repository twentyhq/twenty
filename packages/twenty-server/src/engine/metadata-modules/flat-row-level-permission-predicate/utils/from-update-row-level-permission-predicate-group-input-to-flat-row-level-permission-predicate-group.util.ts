import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type RowLevelPermissionPredicateGroupInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';

export const fromUpdateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroup =
  ({
    input,
    existingGroup,
    flatRowLevelPermissionPredicateGroupMaps,
  }: {
    input: RowLevelPermissionPredicateGroupInput;
    existingGroup: FlatRowLevelPermissionPredicateGroup;
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
        input.parentRowLevelPermissionPredicateGroupId ?? null,
      parentRowLevelPermissionPredicateGroupUniversalIdentifier,
      positionInRowLevelPermissionPredicateGroup:
        input.positionInRowLevelPermissionPredicateGroup ?? null,
      updatedAt: new Date().toISOString(),
    };
  };
