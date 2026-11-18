import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { getRelationTargetFieldMetadataViolation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-relation-target-field-metadata-violation.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const validateFlatViewFieldRelationTarget = ({
  flatViewField: {
    isCanonical,
    relationTargetFieldMetadataUniversalIdentifier,
  },
  flatFieldMetadata,
  flatFieldMetadataMaps,
}: {
  flatViewField: Pick<
    UniversalFlatViewField,
    'isCanonical' | 'relationTargetFieldMetadataUniversalIdentifier'
  >;
  flatFieldMetadata: UniversalFlatFieldMetadata;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
}): FlatEntityValidationError<ViewExceptionCode>[] => {
  if (!isDefined(relationTargetFieldMetadataUniversalIdentifier)) {
    return [];
  }

  if (isCanonical) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Only non-canonical view fields can show a related record field`,
        userFriendlyMessage: msg`Only added columns can show a field of the related record`,
      },
    ];
  }

  const violation = getRelationTargetFieldMetadataViolation({
    flatFieldMetadata,
    relationTargetFieldMetadataUniversalIdentifier,
    flatFieldMetadataMaps,
  });

  switch (violation) {
    case undefined:
      return [];
    case 'NOT_MANY_TO_ONE_RELATION':
      return [
        {
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`A related record field can only be shown on a many-to-one relation field`,
          userFriendlyMessage: msg`Only a column linking to one record can show a field of that record`,
        },
      ];
    case 'NOT_ON_RELATION_TARGET_OBJECT':
      return [
        {
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`The related record field must belong to the relation target object`,
          userFriendlyMessage: msg`The field must belong to the related object`,
        },
      ];
    case 'INACTIVE':
      return [
        {
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`The related record field must be active`,
          userFriendlyMessage: msg`A deactivated field cannot be shown in a column`,
        },
      ];
    case 'IS_RELATION':
      return [
        {
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`The related record field cannot be a relation`,
          userFriendlyMessage: msg`A related record's relation cannot be shown in a column`,
        },
      ];
  }
};
