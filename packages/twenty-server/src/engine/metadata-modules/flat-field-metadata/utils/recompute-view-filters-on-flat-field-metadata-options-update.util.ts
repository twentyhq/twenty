import { isNonEmptyString } from '@sniptt/guards';
import { type EnumFieldMetadataType } from 'twenty-shared/types';
import { isDefined, parseJson } from 'twenty-shared/utils';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { compareTwoFlatFieldMetadataEnumOptions } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata-enum-options.util';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

type RecomputeViewFiltersOnFlatFieldMetadataOptionsUpdateArgs = {
  fromFlatFieldMetadata: FlatFieldMetadata<EnumFieldMetadataType>;
  update: PropertyUpdate<FlatFieldMetadata<EnumFieldMetadataType>, 'options'>;
} & Pick<AllFlatEntityMaps, 'flatViewFilterMaps'>;

export type FlatViewFiltersToDeleteAndUpdate = {
  flatViewFiltersToDelete: FlatViewFilter[];
  flatViewFiltersToUpdate: FlatViewFilter[];
};
export const recomputeViewFiltersOnFlatFieldMetadataOptionsUpdate = ({
  flatViewFilterMaps,
  fromFlatFieldMetadata,
  update,
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
    toOptions: update.to,
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

    if (!isDefined(rawViewFilterValue)) {
      continue;
    }

    // TODO: all view filter value should be stored as JSON, this is ongoing work (we are missing a command to migrate the data)
    const viewFilterValue = isNonEmptyString(rawViewFilterValue)
      ? parseJson(rawViewFilterValue)
      : rawViewFilterValue;

    if (!isDefined(viewFilterValue) || !Array.isArray(viewFilterValue)) {
      throw new FieldMetadataException(
        `Unexpected invalid view filter value for filter ${viewFilter.id}`,
        FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

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
