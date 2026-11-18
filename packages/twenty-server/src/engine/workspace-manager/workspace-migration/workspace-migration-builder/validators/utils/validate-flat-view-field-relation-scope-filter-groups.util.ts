import { msg, t } from '@lingui/core/macro';
import {
  type UniversalViewFieldRelationScope,
  ViewFilterGroupLogicalOperator,
} from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getInvalidFlatViewFieldRelationScopeError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-flat-view-field-relation-scope-error.util';

const VIEW_FILTER_GROUP_LOGICAL_OPERATORS = Object.values(
  ViewFilterGroupLogicalOperator,
);

export const validateFlatViewFieldRelationScopeFilterGroups = (
  filterGroups: UniversalViewFieldRelationScope['filterGroups'],
): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];
  const parentFilterGroupIdById = new Map<string, string | null | undefined>();

  for (const filterGroup of filterGroups) {
    if (
      !isValidUuid(filterGroup.id) ||
      parentFilterGroupIdById.has(filterGroup.id)
    ) {
      errors.push(
        getInvalidFlatViewFieldRelationScopeError({
          message: t`Relation scope filter group ids must be unique UUIDs`,
          userFriendlyMessage: msg`Related records filter groups are invalid`,
        }),
      );
    }

    if (
      !VIEW_FILTER_GROUP_LOGICAL_OPERATORS.includes(filterGroup.logicalOperator)
    ) {
      errors.push(
        getInvalidFlatViewFieldRelationScopeError({
          message: t`Relation scope filter group has an invalid logical operator`,
          userFriendlyMessage: msg`Related records filter groups are invalid`,
        }),
      );
    }

    parentFilterGroupIdById.set(
      filterGroup.id,
      filterGroup.parentFilterGroupId,
    );
  }

  for (const filterGroup of filterGroups) {
    if (
      isDefined(filterGroup.parentFilterGroupId) &&
      !parentFilterGroupIdById.has(filterGroup.parentFilterGroupId)
    ) {
      errors.push(
        getInvalidFlatViewFieldRelationScopeError({
          message: t`Relation scope filter group parent not found`,
          userFriendlyMessage: msg`Related records filter groups are invalid`,
        }),
      );
      continue;
    }

    const visitedFilterGroupIds = new Set<string>([filterGroup.id]);
    let parentFilterGroupId = filterGroup.parentFilterGroupId;

    while (isDefined(parentFilterGroupId)) {
      if (visitedFilterGroupIds.has(parentFilterGroupId)) {
        errors.push(
          getInvalidFlatViewFieldRelationScopeError({
            message: t`Relation scope filter groups cannot be nested in themselves`,
            userFriendlyMessage: msg`Related records filter groups are invalid`,
          }),
        );
        break;
      }

      visitedFilterGroupIds.add(parentFilterGroupId);
      parentFilterGroupId = parentFilterGroupIdById.get(parentFilterGroupId);
    }
  }

  return errors;
};
