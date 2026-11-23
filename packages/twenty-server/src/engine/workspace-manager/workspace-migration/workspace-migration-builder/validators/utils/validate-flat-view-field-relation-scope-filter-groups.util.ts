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

  // The front applies a single root filter group, so a second one would be dropped from the query
  if (
    filterGroups.filter(
      ({ parentFilterGroupId }) => !isDefined(parentFilterGroupId),
    ).length > 1
  ) {
    errors.push(
      getInvalidFlatViewFieldRelationScopeError({
        message: t`Relation scope can only have one root filter group`,
        userFriendlyMessage: msg`Related records filter groups are invalid`,
      }),
    );
  }

  for (const { parentFilterGroupId } of filterGroups) {
    if (!isDefined(parentFilterGroupId)) {
      continue;
    }

    if (!parentFilterGroupIdById.has(parentFilterGroupId)) {
      errors.push(
        getInvalidFlatViewFieldRelationScopeError({
          message: t`Relation scope filter group parent not found`,
          userFriendlyMessage: msg`Related records filter groups are invalid`,
        }),
      );
    } else if (isDefined(parentFilterGroupIdById.get(parentFilterGroupId))) {
      // Same depth-2 cap as view filter groups, which also rules out cycles
      errors.push(
        getInvalidFlatViewFieldRelationScopeError({
          message: t`Relation scope filter groups can only be nested one level deep`,
          userFriendlyMessage: msg`Related records filter groups are invalid`,
        }),
      );
    }
  }

  return errors;
};
