import { msg, t } from '@lingui/core/macro';
import {
  type UniversalViewFieldRelationScope,
  ViewSortDirection,
} from 'twenty-shared/types';

import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getInvalidFlatViewFieldRelationScopeError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-flat-view-field-relation-scope-error.util';
import { resolveFlatViewFieldRelationScopeFieldReference } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/resolve-flat-view-field-relation-scope-field-reference.util';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';

export const validateFlatViewFieldRelationScopeSort = ({
  sort,
  objectMetadataUniversalIdentifier,
  flatFieldMetadataMaps,
}: {
  sort: UniversalViewFieldRelationScope['sorts'][number];
  objectMetadataUniversalIdentifier: string;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
}): FlatEntityValidationError[] => {
  const errors = resolveFlatViewFieldRelationScopeFieldReference({
    fieldReference: sort,
    objectMetadataUniversalIdentifier,
    flatFieldMetadataMaps,
  }).errors;

  if (!Object.values(ViewSortDirection).includes(sort.direction)) {
    errors.push(
      getInvalidFlatViewFieldRelationScopeError({
        message: t`Relation scope sort has an invalid direction`,
        userFriendlyMessage: msg`Related records sort direction should be ascending or descending`,
      }),
    );
  }

  return errors;
};
