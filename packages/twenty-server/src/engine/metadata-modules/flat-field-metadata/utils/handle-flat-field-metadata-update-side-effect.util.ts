import { type FromTo } from 'twenty-shared/types';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { handleEnumFlatFieldMetadataUpdateSideEffects } from 'src/engine/metadata-modules/flat-field-metadata/utils/handle-enum-flat-field-metadata-update-side-effects.util';
import {
  type FieldMetadataUpdateIndexSideEffect,
  handleIndexChangesDuringFieldUpdate,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/handle-index-changes-during-field-update.util';
import { type FlatViewFiltersToDeleteAndUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-view-filters-on-flat-field-metadata-options-update.util';
import { type FlatViewGroupsToDeleteUpdateAndCreate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-view-groups-on-flat-field-metadata-options-update.util';

export type FlatFieldMetadataUpdateSideEffects =
  FlatViewFiltersToDeleteAndUpdate &
    FlatViewGroupsToDeleteUpdateAndCreate &
    FieldMetadataUpdateIndexSideEffect;

type HandleFlatFieldMetadataUpdateSideEffectArgs = FromTo<
  FlatFieldMetadata,
  'flatFieldMetadata'
> &
  Pick<
    AllFlatEntityMaps,
    | 'flatIndexMaps'
    | 'flatObjectMetadataMaps'
    | 'flatFieldMetadataMaps'
    | 'flatViewFilterMaps'
    | 'flatViewGroupMaps'
  >;

export const handleFlatFieldMetadataUpdateSideEffect = ({
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
  flatObjectMetadataMaps,
  flatIndexMaps,
  flatFieldMetadataMaps,
  flatViewFilterMaps,
  flatViewGroupMaps,
}: HandleFlatFieldMetadataUpdateSideEffectArgs): FlatFieldMetadataUpdateSideEffects => {
  const {
    flatViewFiltersToDelete,
    flatViewFiltersToUpdate,
    flatViewGroupsToCreate,
    flatViewGroupsToDelete,
    flatViewGroupsToUpdate,
  } = handleEnumFlatFieldMetadataUpdateSideEffects({
    flatViewFilterMaps,
    flatViewGroupMaps,
    fromFlatFieldMetadata,
    toFlatFieldMetadata,
  });

  const {
    flatIndexMetadatasToUpdate,
    flatIndexMetadatasToCreate,
    flatIndexMetadatasToDelete,
  } = handleIndexChangesDuringFieldUpdate({
    fromFlatFieldMetadata,
    toFlatFieldMetadata,
    flatIndexMaps,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

  return {
    flatIndexMetadatasToUpdate,
    flatViewFiltersToDelete,
    flatViewFiltersToUpdate,
    flatViewGroupsToCreate,
    flatViewGroupsToDelete,
    flatIndexMetadatasToDelete,
    flatIndexMetadatasToCreate,
    flatViewGroupsToUpdate,
  };
};
