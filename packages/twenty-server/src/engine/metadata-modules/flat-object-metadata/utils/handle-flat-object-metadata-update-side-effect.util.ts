import { type FromTo } from 'twenty-shared/types';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { recomputeIndexAfterFlatObjectMetadataSingularNameUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/recompute-index-after-flat-object-metadata-singular-name-update.util';
import { recomputeViewFieldIdentifierAfterFlatObjectIdentifierUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/recompute-view-field-identifier-after-flat-object-identifier-update.util';
import { renameRelatedMorphFieldOnObjectNamesUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/rename-related-morph-field-on-object-names-update.util';
import { FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { isDefined } from 'twenty-shared/utils';

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
    | 'flatViewFieldMaps'
    | 'flatIndexMaps'
    | 'flatViewMaps'
  >;

export const handleFlatObjectMetadataUpdateSideEffect = ({
  flatIndexMaps,
  flatFieldMetadataMaps,
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
