/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';

export const hasWorkspaceMemberBoundPredicates = (
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps,
): boolean =>
  Object.values(flatRowLevelPermissionPredicateMaps.byUniversalIdentifier).some(
    (predicate) =>
      isDefined(predicate) &&
      !isDefined(predicate.deletedAt) &&
      isDefined(predicate.workspaceMemberFieldMetadataId),
  );
