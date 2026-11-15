import { msg, t } from '@lingui/core/macro';
import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isRelationUniversalFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-universal-flat-field-metadata-of-type.util';
import { resolveEffectiveUniversalFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity-property.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
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

  const relationTargetFlatFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: relationTargetFieldMetadataUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

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
    !resolveEffectiveUniversalFlatEntityProperty({
      metadataName: 'fieldMetadata',
      universalFlatEntity: relationTargetFlatFieldMetadata,
      property: 'isActive',
    })
  ) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`The related record field must be active`,
        userFriendlyMessage: msg`A deactivated field cannot be shown in a column`,
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
