import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { ViewSortExceptionCode } from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { resolveRelationTargetFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/resolve-relation-target-flat-field-metadata.util';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewSort } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-sort.type';
import { RELATION_TARGET_FLAT_FIELD_METADATA_FAILURE_REASON } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/constants/relation-target-flat-field-metadata-failure-reason.constant';

export const validateFlatViewSortRelationTarget = ({
  flatViewSort: { relationTargetFieldMetadataUniversalIdentifier },
  flatFieldMetadata,
  flatFieldMetadataMaps,
}: {
  flatViewSort: Pick<
    UniversalFlatViewSort,
    'relationTargetFieldMetadataUniversalIdentifier'
  >;
  flatFieldMetadata: UniversalFlatFieldMetadata;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
}): FlatEntityValidationError<ViewSortExceptionCode>[] => {
  if (!isDefined(relationTargetFieldMetadataUniversalIdentifier)) {
    return [];
  }

  const relationTarget = resolveRelationTargetFlatFieldMetadata({
    flatFieldMetadata,
    relationTargetFieldMetadataUniversalIdentifier,
    flatFieldMetadataMaps,
  });

  if (!('failureReason' in relationTarget)) {
    return [];
  }

  switch (relationTarget.failureReason) {
    case RELATION_TARGET_FLAT_FIELD_METADATA_FAILURE_REASON.UNEXPECTED_RELATION_TYPE:
      return [
        {
          code: ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
          message: t`A sort can only use a related record field on a many-to-one relation field`,
          userFriendlyMessage: msg`Only a field linking to one record can be sorted by a field of that record`,
        },
      ];
    case RELATION_TARGET_FLAT_FIELD_METADATA_FAILURE_REASON.NOT_ON_RELATION_TARGET_OBJECT:
      return [
        {
          code: ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
          message: t`The related record field must belong to the relation target object`,
          userFriendlyMessage: msg`The field must belong to the related object`,
        },
      ];
    case RELATION_TARGET_FLAT_FIELD_METADATA_FAILURE_REASON.INACTIVE:
      return [
        {
          code: ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
          message: t`The related record field must be active`,
          userFriendlyMessage: msg`Records cannot be sorted by a deactivated field`,
        },
      ];
    case RELATION_TARGET_FLAT_FIELD_METADATA_FAILURE_REASON.IS_A_RELATION:
      return [
        {
          code: ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
          message: t`The related record field cannot be a relation`,
          userFriendlyMessage: msg`Records cannot be sorted by a relation of the related record`,
        },
      ];
  }
};
