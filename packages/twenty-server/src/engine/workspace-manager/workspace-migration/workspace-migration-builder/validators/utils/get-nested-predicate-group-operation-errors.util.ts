/* @license Enterprise */

import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { RowLevelPermissionPredicateGroupExceptionCode } from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate-group.exception';
import { type UniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate-group.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const getNestedPredicateGroupOperationErrors = ({
  flatPredicateGroup,
}: {
  flatPredicateGroup: Pick<
    UniversalFlatRowLevelPermissionPredicateGroup,
    | 'parentRowLevelPermissionPredicateGroupUniversalIdentifier'
    | 'canReadRecords'
    | 'canUpdateRecords'
    | 'canSoftDeleteRecords'
    | 'canDestroyRecords'
  >;
}): FlatEntityValidationError[] =>
  isDefined(
    flatPredicateGroup.parentRowLevelPermissionPredicateGroupUniversalIdentifier,
  ) &&
  (flatPredicateGroup.canReadRecords ||
    flatPredicateGroup.canUpdateRecords ||
    flatPredicateGroup.canSoftDeleteRecords ||
    flatPredicateGroup.canDestroyRecords)
    ? [
        {
          code: RowLevelPermissionPredicateGroupExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA,
          message: t`Only a root row level permission predicate group can grant operations`,
          userFriendlyMessage: msg`Only the top-level group of a record-level rule can grant operations`,
        },
      ]
    : [];
