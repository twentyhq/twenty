import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { recomputeIndexAfterFlatObjectMetadataSingularNameUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/recompute-index-after-flat-object-metadata-singular-name-update.util';
import { recomputeSearchVectorFieldAfterLabelIdentifierUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/recompute-search-vector-field-after-label-identifier-update.util';
import { recomputeViewFieldIdentifierAfterFlatObjectIdentifierUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/recompute-view-field-identifier-after-flat-object-identifier-update.util';
import { renameRelatedMorphFieldOnObjectNamesUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/rename-related-morph-field-on-object-names-update.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';

export type FlatObjectMetadataUpdateSideEffects = {
  otherObjectFlatFieldMetadatasToUpdate: FlatFieldMetadata[];
  sameObjectFlatFieldMetadatasToUpdate: FlatFieldMetadata[];
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
  const { morphRelatedFlatIndexesToUpdate, morphFlatFieldMetadatasToUpdate } =
    fromFlatObjectMetadata.nameSingular !== toFlatObjectMetadata.nameSingular ||
    fromFlatObjectMetadata.namePlural !== toFlatObjectMetadata.namePlural
      ? renameRelatedMorphFieldOnObjectNamesUpdate({
          flatFieldMetadataMaps,
          fromFlatObjectMetadata,
          toFlatObjectMetadata,
          flatObjectMetadataMaps,
          flatIndexMaps,
        })
      : {
          morphRelatedFlatIndexesToUpdate: [],
          morphFlatFieldMetadatasToUpdate: [],
        };

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

  const sameObjectFlatFieldMetadatasToUpdate: FlatFieldMetadata[] = [];

  if (
    toFlatObjectMetadata.isSearchable &&
    isDefined(toFlatObjectMetadata.labelIdentifierFieldMetadataId) &&
    fromFlatObjectMetadata.labelIdentifierFieldMetadataId !==
      toFlatObjectMetadata.labelIdentifierFieldMetadataId
  ) {
    const updatedSearchVectorField =
      recomputeSearchVectorFieldAfterLabelIdentifierUpdate({
        existingFlatObjectMetadata: fromFlatObjectMetadata,
        flatFieldMetadataMaps,
        updatedLabelIdentifierFieldMetadataId:
          toFlatObjectMetadata.labelIdentifierFieldMetadataId,
      });

    if (isDefined(updatedSearchVectorField)) {
      sameObjectFlatFieldMetadatasToUpdate.push(updatedSearchVectorField);
    }
  }

  return {
    flatIndexMetadatasToUpdate: [
      ...morphRelatedFlatIndexesToUpdate,
      ...flatIndexMetadatasToUpdate,
    ],
    flatViewFieldsToCreate,
    flatViewFieldsToUpdate,
    otherObjectFlatFieldMetadatasToUpdate: morphFlatFieldMetadatasToUpdate,
    sameObjectFlatFieldMetadatasToUpdate,
  };
};
