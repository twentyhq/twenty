import { msg, t } from '@lingui/core/macro';
import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { resolveRelationTargetFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/resolve-relation-target-flat-field-metadata.util';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import {
  RELATION_TARGET_FLAT_FIELD_METADATA_FAILURE_REASON,
  type RelationTargetFlatFieldMetadataFailureReason,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/constants/relation-target-flat-field-metadata-failure-reason.constant';

const getRelationTargetError = (
  failureReason: RelationTargetFlatFieldMetadataFailureReason,
): FlatEntityValidationError<ViewExceptionCode> => {
  switch (failureReason) {
    case RELATION_TARGET_FLAT_FIELD_METADATA_FAILURE_REASON.UNEXPECTED_RELATION_TYPE:
      return {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`A related record field can only be shown on a many-to-one relation field, or on a one-to-many relation field with a relation scope`,
        userFriendlyMessage: msg`Only a column linking to one record, or a filtered column of related records, can show a field of the related records`,
      };
    case RELATION_TARGET_FLAT_FIELD_METADATA_FAILURE_REASON.NOT_ON_RELATION_TARGET_OBJECT:
      return {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`The related record field must belong to the relation target object`,
        userFriendlyMessage: msg`The field must belong to the related object`,
      };
    case RELATION_TARGET_FLAT_FIELD_METADATA_FAILURE_REASON.INACTIVE:
      return {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`The related record field must be active`,
        userFriendlyMessage: msg`A deactivated field cannot be shown in a column`,
      };
    case RELATION_TARGET_FLAT_FIELD_METADATA_FAILURE_REASON.IS_A_RELATION:
      return {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`The related record field cannot be a relation`,
        userFriendlyMessage: msg`A related record's relation cannot be shown in a column`,
      };
  }
};

export const validateFlatViewFieldRelationTarget = ({
  flatViewField: {
    isCanonical,
    relationTargetFieldMetadataUniversalIdentifier,
    universalRelationScope,
  },
  flatFieldMetadata,
  flatFieldMetadataMaps,
}: {
  flatViewField: Pick<
    UniversalFlatViewField,
    | 'isCanonical'
    | 'relationTargetFieldMetadataUniversalIdentifier'
    | 'universalRelationScope'
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

  const relationTarget = resolveRelationTargetFlatFieldMetadata({
    flatFieldMetadata,
    relationTargetFieldMetadataUniversalIdentifier,
    flatFieldMetadataMaps,
    relationType: isDefined(universalRelationScope)
      ? RelationType.ONE_TO_MANY
      : RelationType.MANY_TO_ONE,
  });

  return 'failureReason' in relationTarget
    ? [getRelationTargetError(relationTarget.failureReason)]
    : [];
};
