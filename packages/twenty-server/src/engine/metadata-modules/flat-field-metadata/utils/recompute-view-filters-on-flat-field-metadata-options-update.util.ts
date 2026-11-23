import { type EnumFieldMetadataType, type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { compareTwoFlatFieldMetadataEnumOptions } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata-enum-options.util';
import { computeSelectFilterValueAfterOptionsUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-select-filter-value-after-options-update.util';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';

type RecomputeViewFiltersOnFlatFieldMetadataOptionsUpdateArgs = {
  fromFlatFieldMetadata: FlatFieldMetadata<EnumFieldMetadataType>;
} & FromTo<FlatFieldMetadata<EnumFieldMetadataType>['options'], 'options'> &
  Pick<AllFlatEntityMaps, 'flatViewFilterMaps'>;

export type FlatViewFiltersToDeleteAndUpdate = {
  flatViewFiltersToDelete: FlatViewFilter[];
  flatViewFiltersToUpdate: FlatViewFilter[];
};
export const recomputeViewFiltersOnFlatFieldMetadataOptionsUpdate = ({
  flatViewFilterMaps,
  fromFlatFieldMetadata,
  fromOptions,
  toOptions,
}: RecomputeViewFiltersOnFlatFieldMetadataOptionsUpdateArgs): FlatViewFiltersToDeleteAndUpdate => {
  const flatViewFiltersToCreateAndUpdate: FlatViewFiltersToDeleteAndUpdate = {
    flatViewFiltersToDelete: [],
    flatViewFiltersToUpdate: [],
  };

  const {
    deleted: deletedFieldMetadataOptions,
    updated: updatedFieldMetadataOptions,
  } = compareTwoFlatFieldMetadataEnumOptions({
    compareLabel: false,
    fromOptions,
    toOptions,
  });

  if (
    deletedFieldMetadataOptions.length === 0 &&
    updatedFieldMetadataOptions.length === 0
  ) {
    return flatViewFiltersToCreateAndUpdate;
  }

  const flatViewFilters = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: fromFlatFieldMetadata.viewFilterIds,
    flatEntityMaps: flatViewFilterMaps,
  });

  for (const viewFilter of flatViewFilters) {
    const optionValues = computeSelectFilterValueAfterOptionsUpdate({
      operand: viewFilter.operand,
      subFieldName: viewFilter.subFieldName,
      value: viewFilter.value,
      fromOptions,
      deletedOptions: deletedFieldMetadataOptions,
      updatedOptions: updatedFieldMetadataOptions,
    });

    if (!isDefined(optionValues)) {
      continue;
    }

    if (optionValues.length === 0) {
      flatViewFiltersToCreateAndUpdate.flatViewFiltersToDelete.push(viewFilter);
      continue;
    }

    flatViewFiltersToCreateAndUpdate.flatViewFiltersToUpdate.push({
      ...viewFilter,
      value: optionValues,
    });
  }

  return flatViewFiltersToCreateAndUpdate;
};
