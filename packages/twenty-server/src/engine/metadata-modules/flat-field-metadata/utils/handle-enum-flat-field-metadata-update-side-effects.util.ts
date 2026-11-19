import { type EnumFieldMetadataType, type FromTo } from 'twenty-shared/types';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveFlatFieldMetadataOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
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
    | 'flatViewFilterMaps'
    | 'flatViewGroupMaps'
    | 'flatViewMaps'
    | 'flatFieldMetadataOptionMaps'
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
  flatFieldMetadataOptionMaps,
}: HandleEnumFlatFieldMetadataOptionsUpdateSideEffectsArgs): EnumFieldMetadataSideEffectResult => {
  const sideEffectResult = structuredClone(
    EMPTY_ENUM_FIELD_METADATA_SIDE_EFFECT_RESULT,
  );

  const fromOptions = (resolveFlatFieldMetadataOptions({
    flatFieldMetadata: fromFlatFieldMetadata,
    flatFieldMetadataOptionMaps,
  }) ?? []) as FlatFieldMetadata<EnumFieldMetadataType>['options'];
  // An update without options keeps the stored copy by reference, which may be stale.
  const toOptions =
    toFlatFieldMetadata.options === fromFlatFieldMetadata.options
      ? fromOptions
      : toFlatFieldMetadata.options;

  if (JSON.stringify(fromOptions) !== JSON.stringify(toOptions)) {
    const { flatViewFiltersToDelete, flatViewFiltersToUpdate } =
      recomputeViewFiltersOnFlatFieldMetadataOptionsUpdate({
        flatViewFilterMaps,
        fromFlatFieldMetadata,
        fromOptions,
        toOptions,
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
      fromOptions,
      toOptions,
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
