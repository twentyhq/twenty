import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { recomputeIndexAfterFlatObjectMetadataSingularNameUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/recompute-index-after-flat-object-metadata-singular-name-update.util';
import { recomputeViewFieldIdentifierAfterFlatObjectIdentifierUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/recompute-view-field-identifier-after-flat-object-identifier-update.util';
import { renameRelatedMorphFieldOnObjectNamesUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/rename-related-morph-field-on-object-names-update.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';

export type FlatObjectMetadataUpdateSideEffects = {
  otherObjectFlatFieldMetadatasToUpdate: FlatFieldMetadata[];
  flatViewFieldsToUpdate: FlatViewField[];
  flatViewFieldsToCreate: FlatViewField[];
  flatIndexMetadatasToUpdate: FlatIndexMetadata[];
};

type HandleFlatObjectMetadataUpdateSideEffectArgs = FromTo<
  FlatObjectMetadata,
  'flatObjectMetadata'
> &
  Pick<
    AllFlatEntityMaps,
    | 'flatFieldMetadataMaps'
    | 'flatObjectMetadataMaps'
    | 'flatViewFieldMaps'
    | 'flatIndexMaps'
    | 'flatViewMaps'
  >;

export const handleFlatObjectMetadataUpdateSideEffect = ({
  flatIndexMaps,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  flatViewFieldMaps,
  flatViewMaps,
  fromFlatObjectMetadata,
  toFlatObjectMetadata,
}: HandleFlatObjectMetadataUpdateSideEffectArgs): FlatObjectMetadataUpdateSideEffects => {
  const otherObjectFlatFieldMetadatasToUpdate =
    fromFlatObjectMetadata.nameSingular !== toFlatObjectMetadata.nameSingular ||
    fromFlatObjectMetadata.namePlural !== toFlatObjectMetadata.namePlural
      ? renameRelatedMorphFieldOnObjectNamesUpdate({
          flatFieldMetadataMaps,
          fromFlatObjectMetadata,
          toFlatObjectMetadata,
        })
      : [];

  validateOtherFieldMetadataNamesConflict({
    otherObjectFlatFieldMetadatasToUpdate,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

  const flatIndexMetadatasToUpdate =
    fromFlatObjectMetadata.nameSingular !== toFlatObjectMetadata.nameSingular
      ? recomputeIndexAfterFlatObjectMetadataSingularNameUpdate({
          flatFieldMetadataMaps,
          existingFlatObjectMetadata: fromFlatObjectMetadata,
          flatIndexMaps,
          updatedSingularName: toFlatObjectMetadata.nameSingular,
        })
      : [];

  const { flatViewFieldsToCreate, flatViewFieldsToUpdate } =
    fromFlatObjectMetadata.labelIdentifierFieldMetadataId !==
      toFlatObjectMetadata.labelIdentifierFieldMetadataId &&
    isDefined(toFlatObjectMetadata.labelIdentifierFieldMetadataId) &&
    isDefined(fromFlatObjectMetadata.labelIdentifierFieldMetadataId)
      ? recomputeViewFieldIdentifierAfterFlatObjectIdentifierUpdate({
          existingFlatObjectMetadata: fromFlatObjectMetadata,
          flatViewFieldMaps,
          flatViewMaps,
          updatedLabelIdentifierFieldMetadataId:
            toFlatObjectMetadata.labelIdentifierFieldMetadataId,
        })
      : {
          flatViewFieldsToCreate: [],
          flatViewFieldsToUpdate: [],
        };

  return {
    flatIndexMetadatasToUpdate,
    flatViewFieldsToCreate,
    flatViewFieldsToUpdate,
    otherObjectFlatFieldMetadatasToUpdate,
  };
};

const validateOtherFieldMetadataNamesConflict = ({
  otherObjectFlatFieldMetadatasToUpdate,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  otherObjectFlatFieldMetadatasToUpdate: FlatFieldMetadata[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): void => {

  for (const updatedField of otherObjectFlatFieldMetadatasToUpdate) {
    const targetObject =
      flatObjectMetadataMaps.byId[updatedField.objectMetadataId];

    if (!isDefined(targetObject)) {
      throw new FieldMetadataException(
        `Object not found for field ${updatedField.id}`,
        FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const allFieldsOnTargetObject = findManyFlatEntityByIdInFlatEntityMapsOrThrow(
      {
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityIds: targetObject.fieldMetadataIds,
      },
    );

    const conflictingField = allFieldsOnTargetObject.find(
      (existingField) =>
        existingField.id !== updatedField.id &&
        existingField.name === updatedField.name,
    );

    if (isDefined(conflictingField)) {
      throw new FieldMetadataException(
        `Field name "${updatedField.name}" would conflict with existing field on object "${targetObject.nameSingular}"`,
        FieldMetadataExceptionCode.FIELD_ALREADY_EXISTS,
      );
    }
  }
};
