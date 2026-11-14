import { msg, t } from '@lingui/core/macro';
import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isRelationUniversalFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-universal-flat-field-metadata-of-type.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type RelationTargetFlatFieldMetadata = Pick<
  UniversalFlatFieldMetadata,
  | 'type'
  | 'universalSettings'
  | 'objectMetadataUniversalIdentifier'
  | 'relationTargetObjectMetadataUniversalIdentifier'
>;

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
  flatFieldMetadata: RelationTargetFlatFieldMetadata;
  flatFieldMetadataMaps: {
    byUniversalIdentifier: Partial<
      Record<string, RelationTargetFlatFieldMetadata>
    >;
  };
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

  if (
    !isRelationUniversalFlatFieldMetadataOfType({
      flatFieldMetadata,
      relationType: RelationType.MANY_TO_ONE,
    })
  ) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`A related record field can only be shown on a many-to-one relation field`,
        userFriendlyMessage: msg`Only a column linking to one record can show a field of that record`,
      },
    ];
  }

  const relationTargetFlatFieldMetadata =
    flatFieldMetadataMaps.byUniversalIdentifier[
      relationTargetFieldMetadataUniversalIdentifier
    ];

  if (
    !isDefined(relationTargetFlatFieldMetadata) ||
    relationTargetFlatFieldMetadata.objectMetadataUniversalIdentifier !==
      flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier
  ) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`The related record field must belong to the relation target object`,
        userFriendlyMessage: msg`The field must belong to the related object`,
      },
    ];
  }

  if (
    isMorphOrRelationFieldMetadataType(relationTargetFlatFieldMetadata.type)
  ) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`The related record field cannot be a relation`,
        userFriendlyMessage: msg`A related record's relation cannot be shown in a column`,
      },
    ];
  }

  return [];
};
