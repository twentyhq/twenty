import { type EnumFieldMetadataType, type FromTo } from 'twenty-shared/types';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  type FlatViewFiltersToDeleteAndUpdate,
  recomputeViewFiltersOnFlatFieldMetadataOptionsUpdate,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-view-filters-on-flat-field-metadata-options-update.util';
import { recomputeViewGroupsOnEnumFlatFieldMetadataIsNullableUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-view-groups-on-enum-flat-field-metadata-is-nullable-update.util';
import {
  type FlatViewGroupsToDeleteUpdateAndCreate,
  recomputeViewGroupsOnFlatFieldMetadataOptionsUpdate,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-view-groups-on-flat-field-metadata-options-update.util';

type HandleEnumFlatFieldMetadataOptionsUpdateSideEffectsArgs = FromTo<
  FlatFieldMetadata<EnumFieldMetadataType>,
  'flatFieldMetadata'
> &
  Pick<
    AllFlatEntityMaps,
    'flatViewFilterMaps' | 'flatViewGroupMaps' | 'flatViewMaps'
  >;

type EnumFieldMetadataSideEffectResult = FlatViewGroupsToDeleteUpdateAndCreate &
  FlatViewFiltersToDeleteAndUpdate;

const EMPTY_ENUM_FIELD_METADATA_SIDE_EFFECT_RESULT: EnumFieldMetadataSideEffectResult =
  {
    flatViewFiltersToDelete: [],
    flatViewFiltersToUpdate: [],
    flatViewGroupsToCreate: [],
    flatViewGroupsToDelete: [],
    flatViewGroupsToUpdate: [],
  };

export const handleEnumFlatFieldMetadataUpdateSideEffects = ({
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
  flatViewFilterMaps,
  flatViewGroupMaps,
  flatViewMaps,
}: HandleEnumFlatFieldMetadataOptionsUpdateSideEffectsArgs): EnumFieldMetadataSideEffectResult => {
  const sideEffectResult = structuredClone(
    EMPTY_ENUM_FIELD_METADATA_SIDE_EFFECT_RESULT,
  );

  if (
    JSON.stringify(fromFlatFieldMetadata.options) !==
    JSON.stringify(toFlatFieldMetadata.options)
  ) {
    const optionsPropertyUpdate =
      toFlatFieldMetadata.options as FlatFieldMetadata<EnumFieldMetadataType>['options'];

    const { flatViewFiltersToDelete, flatViewFiltersToUpdate } =
      recomputeViewFiltersOnFlatFieldMetadataOptionsUpdate({
        flatViewFilterMaps,
        fromFlatFieldMetadata,
        toOptions: optionsPropertyUpdate,
      });

    sideEffectResult.flatViewFiltersToDelete.push(...flatViewFiltersToDelete);
    sideEffectResult.flatViewFiltersToUpdate.push(...flatViewFiltersToUpdate);

    const {
      flatViewGroupsToCreate,
      flatViewGroupsToDelete,
      flatViewGroupsToUpdate,
    } = recomputeViewGroupsOnFlatFieldMetadataOptionsUpdate({
      flatViewMaps,
      flatViewGroupMaps,
      fromFlatFieldMetadata,
      toOptions: optionsPropertyUpdate,
    });

    sideEffectResult.flatViewGroupsToCreate.push(...flatViewGroupsToCreate);
    sideEffectResult.flatViewGroupsToDelete.push(...flatViewGroupsToDelete);
    sideEffectResult.flatViewGroupsToUpdate.push(...flatViewGroupsToUpdate);
  }

  if (fromFlatFieldMetadata.isNullable !== toFlatFieldMetadata.isNullable) {
    const { flatViewGroupsToCreate, flatViewGroupsToDelete } =
      recomputeViewGroupsOnEnumFlatFieldMetadataIsNullableUpdate({
        flatViewMaps,
        flatViewGroupMaps,
        fromFlatFieldMetadata,
        toFlatFieldMetadata,
      });

    sideEffectResult.flatViewGroupsToCreate.push(...flatViewGroupsToCreate);
    sideEffectResult.flatViewGroupsToDelete.push(...flatViewGroupsToDelete);
  }

  return sideEffectResult;
};
