import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeSearchFieldMetadataToCreateOnLabelIdentifierUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/compute-search-field-metadata-to-create-on-label-identifier-update.util';
import { recomputeIndexAfterFlatObjectMetadataSingularNameUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/recompute-index-after-flat-object-metadata-singular-name-update.util';
import { recomputeViewFieldIdentifierAfterFlatObjectIdentifierUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/recompute-view-field-identifier-after-flat-object-identifier-update.util';
import { renameRelatedMorphFieldOnObjectNamesUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/rename-related-morph-field-on-object-names-update.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export type FlatObjectMetadataUpdateSideEffects = {
  otherObjectFlatFieldMetadatasToUpdate: UniversalFlatFieldMetadata[];
  flatViewFieldsToUpdate: UniversalFlatViewField[];
  flatViewFieldsToCreate: UniversalFlatViewField[];
  flatIndexMetadatasToUpdate: UniversalFlatIndexMetadata[];
  searchFieldMetadatasToCreate: UniversalFlatSearchFieldMetadata[];
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
    | 'flatSearchFieldMetadataMaps'
  >;

export const handleFlatObjectMetadataUpdateSideEffect = ({
  flatIndexMaps,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  flatViewFieldMaps,
  flatViewMaps,
  flatSearchFieldMetadataMaps,
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
          systemSideEffectMorphFieldsOnly: false,
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
          flatFieldMetadataMaps,
          updatedLabelIdentifierFieldMetadataId:
            toFlatObjectMetadata.labelIdentifierFieldMetadataId,
        })
      : {
          flatViewFieldsToCreate: [],
          flatViewFieldsToUpdate: [],
        };

  const { searchFieldMetadatasToCreate } =
    computeSearchFieldMetadataToCreateOnLabelIdentifierUpdate({
      fromFlatObjectMetadata,
      toFlatObjectMetadata,
      flatFieldMetadataMaps,
      flatSearchFieldMetadataMaps,
    });

  return {
    flatIndexMetadatasToUpdate: [
      ...morphRelatedFlatIndexesToUpdate,
      ...flatIndexMetadatasToUpdate,
    ],
    flatViewFieldsToCreate,
    flatViewFieldsToUpdate,
    otherObjectFlatFieldMetadatasToUpdate: morphFlatFieldMetadatasToUpdate,
    searchFieldMetadatasToCreate,
  };
};
