import { msg, t } from '@lingui/core/macro';
import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isRelationUniversalFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-universal-flat-field-metadata-of-type.util';
import { resolveEffectiveUniversalFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity-property.util';
import { ViewSortExceptionCode } from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewSort } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-sort.type';

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

  if (
    !isRelationUniversalFlatFieldMetadataOfType({
      flatFieldMetadata,
      relationType: RelationType.MANY_TO_ONE,
    })
  ) {
    return [
      {
        code: ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
        message: t`A sort can only use a related record field on a many-to-one relation field`,
        userFriendlyMessage: msg`Only a field linking to one record can be sorted by a field of that record`,
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
        code: ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
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
        code: ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
        message: t`The related record field must be active`,
        userFriendlyMessage: msg`Records cannot be sorted by a deactivated field`,
      },
    ];
  }

  if (
    isMorphOrRelationFieldMetadataType(relationTargetFlatFieldMetadata.type)
  ) {
    return [
      {
        code: ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
        message: t`The related record field cannot be a relation`,
        userFriendlyMessage: msg`Records cannot be sorted by a relation of the related record`,
      },
    ];
  }

  return [];
};
