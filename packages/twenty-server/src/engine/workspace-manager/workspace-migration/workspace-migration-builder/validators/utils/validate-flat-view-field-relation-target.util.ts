import { msg, t } from '@lingui/core/macro';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type RelationTargetValidationFieldMetadata = Pick<
  UniversalFlatFieldMetadata,
  | 'type'
  | 'universalSettings'
  | 'objectMetadataUniversalIdentifier'
  | 'relationTargetObjectMetadataUniversalIdentifier'
>;

export const validateFlatViewFieldRelationTarget = ({
  flatViewField: {
    isCanonical,
    fieldMetadataUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier,
  },
  flatFieldMetadataMaps,
}: {
  flatViewField: Pick<
    UniversalFlatViewField,
    | 'isCanonical'
    | 'fieldMetadataUniversalIdentifier'
    | 'relationTargetFieldMetadataUniversalIdentifier'
  >;
  flatFieldMetadataMaps: {
    byUniversalIdentifier: Partial<
      Record<string, RelationTargetValidationFieldMetadata>
    >;
  };
}): FlatEntityValidationError<ViewExceptionCode>[] => {
  const flatFieldMetadata =
    flatFieldMetadataMaps.byUniversalIdentifier[
      fieldMetadataUniversalIdentifier
    ];

  // A missing field is reported by the view field's own field metadata check
  if (
    !isDefined(relationTargetFieldMetadataUniversalIdentifier) ||
    !isDefined(flatFieldMetadata)
  ) {
    return [];
  }

  const relationTargetFlatFieldMetadata =
    flatFieldMetadataMaps.byUniversalIdentifier[
      relationTargetFieldMetadataUniversalIdentifier
    ];

  if (isCanonical) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Only non-canonical view fields can show a related record field`,
        userFriendlyMessage: msg`Only added columns can show a field of the related record`,
      },
    ];
  }

  const { type, universalSettings } = flatFieldMetadata;

  const isManyToOneRelation =
    type === FieldMetadataType.RELATION &&
    isDefined(universalSettings) &&
    'relationType' in universalSettings &&
    universalSettings.relationType === RelationType.MANY_TO_ONE;

  if (!isManyToOneRelation) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`A related record field can only be shown on a many-to-one relation field`,
        userFriendlyMessage: msg`Only a column linking to one record can show a field of that record`,
      },
    ];
  }

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
    relationTargetFlatFieldMetadata.type === FieldMetadataType.RELATION ||
    relationTargetFlatFieldMetadata.type === FieldMetadataType.MORPH_RELATION
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
