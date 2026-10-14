import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type ValidateFlatViewRelationTargetFieldArgs = {
  sourceFlatFieldMetadata: UniversalFlatFieldMetadata;
  relationTargetFieldMetadataUniversalIdentifier: string;
  flatView: UniversalFlatView;
  flatFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'fieldMetadata'>;
  errorCode: string;
};

type ValidateFlatViewRelationTargetFieldResult = {
  errors: FlatEntityValidationError[];
  relationTargetFlatFieldMetadata: UniversalFlatFieldMetadata | undefined;
};

// Only a one-hop, many-to-one traversal is supported: the source field must
// point at exactly one record of the target object, and the target field must
// be a scalar of that object
export const validateFlatViewRelationTargetField = ({
  sourceFlatFieldMetadata,
  relationTargetFieldMetadataUniversalIdentifier,
  flatView,
  flatFieldMetadataMaps,
  errorCode,
}: ValidateFlatViewRelationTargetFieldArgs): ValidateFlatViewRelationTargetFieldResult => {
  const errors: FlatEntityValidationError[] = [];

  const isPlainManyToOneRelation =
    isFlatFieldMetadataOfType(
      sourceFlatFieldMetadata,
      FieldMetadataType.RELATION,
    ) &&
    sourceFlatFieldMetadata.universalSettings?.relationType ===
      RelationType.MANY_TO_ONE &&
    !isNonEmptyString(
      sourceFlatFieldMetadata.universalSettings
        ?.junctionTargetFieldUniversalIdentifier,
    );

  if (!isPlainManyToOneRelation) {
    errors.push({
      code: errorCode,
      message: t`Relation target field requires fieldMetadataId to be a many-to-one relation field`,
      userFriendlyMessage: msg`Only many-to-one relation fields can be traversed`,
    });
  }

  if (
    sourceFlatFieldMetadata.objectMetadataUniversalIdentifier !==
    flatView.objectMetadataUniversalIdentifier
  ) {
    errors.push({
      code: errorCode,
      message: t`Relation field does not belong to the view object`,
      userFriendlyMessage: msg`Relation field does not belong to the view object`,
    });
  }

  const relationTargetFlatFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: relationTargetFieldMetadataUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(relationTargetFlatFieldMetadata)) {
    errors.push({
      code: errorCode,
      message: t`Relation target field metadata not found`,
      userFriendlyMessage: msg`Relation target field metadata not found`,
    });

    return { errors, relationTargetFlatFieldMetadata };
  }

  if (
    isPlainManyToOneRelation &&
    relationTargetFlatFieldMetadata.objectMetadataUniversalIdentifier !==
      sourceFlatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier
  ) {
    errors.push({
      code: errorCode,
      message: t`Relation target field does not belong to the object the relation points to`,
      userFriendlyMessage: msg`Relation target field does not belong to the related object`,
    });
  }

  if (
    isMorphOrRelationUniversalFlatFieldMetadata(relationTargetFlatFieldMetadata)
  ) {
    errors.push({
      code: errorCode,
      message: t`Relation target field cannot be a relation field`,
      userFriendlyMessage: msg`Relation target field cannot be a relation field`,
    });
  }

  return { errors, relationTargetFlatFieldMetadata };
};
