import { isNonEmptyString } from '@sniptt/guards';
import { type EnumFieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isRecordFilterOperandExpectingValue,
} from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { compareTwoFlatFieldMetadataEnumOptions } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata-enum-options.util';
import { normalizeSelectFilterValues } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-invalid-select-filter-option-values.util';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';

type RecomputeViewFiltersOnFlatFieldMetadataOptionsUpdateArgs = {
  fromFlatFieldMetadata: FlatFieldMetadata<EnumFieldMetadataType>;
  toOptions: FlatFieldMetadata<EnumFieldMetadataType>['options'];
} & Pick<AllFlatEntityMaps, 'flatViewFilterMaps'>;

export type FlatViewFiltersToDeleteAndUpdate = {
  flatViewFiltersToDelete: FlatViewFilter[];
  flatViewFiltersToUpdate: FlatViewFilter[];
};
export const recomputeViewFiltersOnFlatFieldMetadataOptionsUpdate = ({
  flatViewFilterMaps,
  fromFlatFieldMetadata,
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
    fromOptions: fromFlatFieldMetadata.options,
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
    const rawViewFilterValue = viewFilter.value;

    if (
      !isDefined(rawViewFilterValue) ||
      !isRecordFilterOperandExpectingValue(viewFilter.operand) ||
      isNonEmptyString(viewFilter.subFieldName)
    ) {
      continue;
    }

    const viewFilterValue = normalizeSelectFilterValues(rawViewFilterValue);

    const viewFilterOptions = viewFilterValue
      .flatMap((value) => {
        if (!isDefined(fromFlatFieldMetadata.options)) {
          return undefined;
        }

        return fromFlatFieldMetadata.options.find(
          (option) => option.value === value,
        );
      })
      .filter(isDefined);

    const afterDeleteViewFilterOptions = viewFilterOptions.filter(
      (viewFilterOption) =>
        !deletedFieldMetadataOptions.some(
          (option) => option.value === viewFilterOption.value,
        ),
    );

    if (afterDeleteViewFilterOptions.length === 0) {
      flatViewFiltersToCreateAndUpdate.flatViewFiltersToDelete.push(viewFilter);
      continue;
    }

    const afterUpdateAndDeleteViewFilterOptions =
      afterDeleteViewFilterOptions.map((viewFilterOption) => {
        const updatedOption = updatedFieldMetadataOptions.find(
          ({ from }) => viewFilterOption.value === from.value,
        );

        return isDefined(updatedOption) ? updatedOption.to : viewFilterOption;
      });

    const optionsValues = afterUpdateAndDeleteViewFilterOptions.map(
      (option) => option.value,
    );

    flatViewFiltersToCreateAndUpdate.flatViewFiltersToUpdate.push({
      ...viewFilter,
      value: optionsValues,
    });
  }

  return flatViewFiltersToCreateAndUpdate;
};
