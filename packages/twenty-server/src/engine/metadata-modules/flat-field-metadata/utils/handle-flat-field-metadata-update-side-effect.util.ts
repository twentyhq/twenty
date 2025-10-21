import { type FromTo } from 'twenty-shared/types';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { handleEnumFlatFieldMetadataUpdateSideEffects } from 'src/engine/metadata-modules/flat-field-metadata/utils/handle-enum-flat-field-metadata-update-side-effects.util';
import {
  type FieldMetadataDeactivationSideEffect,
  handleFieldMetadataDeactivationSideEffects,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/handle-field-metadata-deactivation-side-effects.util';
import {
  type FieldMetadataUpdateIndexSideEffect,
  handleIndexChangesDuringFieldUpdate,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/handle-index-changes-during-field-update.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { type FlatViewFiltersToDeleteAndUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-view-filters-on-flat-field-metadata-options-update.util';
import { type FlatViewGroupsToDeleteUpdateAndCreate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-view-groups-on-flat-field-metadata-options-update.util';

export type FlatFieldMetadataUpdateSideEffects =
  FlatViewFiltersToDeleteAndUpdate &
    FlatViewGroupsToDeleteUpdateAndCreate &
    FieldMetadataUpdateIndexSideEffect &
    FieldMetadataDeactivationSideEffect;

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
    | 'flatViewMaps'
    | 'flatViewFieldMaps'
  >;

export const FLAT_FIELD_METADATA_UPDATE_EMPTY_SIDE_EFFECTS: FlatFieldMetadataUpdateSideEffects =
  {
    flatIndexMetadatasToUpdate: [],
    flatViewFiltersToDelete: [],
    flatViewFiltersToUpdate: [],
    flatViewGroupsToCreate: [],
    flatViewGroupsToDelete: [],
    flatIndexMetadatasToDelete: [],
    flatIndexMetadatasToCreate: [],
    flatViewGroupsToUpdate: [],
    flatViewsToDelete: [],
    flatViewFieldsToDelete: [],
  };

export const handleFlatFieldMetadataUpdateSideEffect = ({
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
  flatObjectMetadataMaps,
  flatIndexMaps,
  flatFieldMetadataMaps,
  flatViewFilterMaps,
  flatViewGroupMaps,
  flatViewMaps,
  flatViewFieldMaps,
}: HandleFlatFieldMetadataUpdateSideEffectArgs): FlatFieldMetadataUpdateSideEffects => {
  const sideEffectResult = structuredClone(
    FLAT_FIELD_METADATA_UPDATE_EMPTY_SIDE_EFFECTS,
  );

  const isDeactivation =
    fromFlatFieldMetadata.isActive === true &&
    toFlatFieldMetadata.isActive === false;

  if (isDeactivation) {
    const {
      flatViewsToDelete,
      flatViewFieldsToDelete,
      flatViewFiltersToDelete,
    } = handleFieldMetadataDeactivationSideEffects({
      flatViewMaps,
      fromFlatFieldMetadata,
      toFlatFieldMetadata,
      flatViewFieldMaps,
      flatViewFilterMaps,
      flatViewGroupMaps,
    });

    sideEffectResult.flatViewsToDelete.push(...flatViewsToDelete);
    sideEffectResult.flatViewFieldsToDelete.push(...flatViewFieldsToDelete);
    sideEffectResult.flatViewFiltersToDelete.push(...flatViewFiltersToDelete);
  } else if (
    isEnumFlatFieldMetadata(toFlatFieldMetadata) &&
    isEnumFlatFieldMetadata(fromFlatFieldMetadata)
  ) {
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

    sideEffectResult.flatViewFiltersToUpdate.push(...flatViewFiltersToUpdate);
    sideEffectResult.flatViewGroupsToCreate.push(...flatViewGroupsToCreate);
    sideEffectResult.flatViewGroupsToDelete.push(...flatViewGroupsToDelete);
    sideEffectResult.flatViewGroupsToUpdate.push(...flatViewGroupsToUpdate);
    sideEffectResult.flatViewFiltersToDelete.push(...flatViewFiltersToDelete);
  }

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

  sideEffectResult.flatIndexMetadatasToUpdate.push(
    ...flatIndexMetadatasToUpdate,
  );
  sideEffectResult.flatIndexMetadatasToCreate.push(
    ...flatIndexMetadatasToCreate,
  );
  sideEffectResult.flatIndexMetadatasToDelete.push(
    ...flatIndexMetadatasToDelete,
  );

  return sideEffectResult;
};
