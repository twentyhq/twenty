import { isNonEmptyString } from '@sniptt/guards';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getSubFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-or-throw.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { compareTwoFlatFieldMetadataEnumOptions } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata-enum-options.util';
import { FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';
import { EnumFieldMetadataType } from 'twenty-shared/types';
import { isDefined, parseJson } from 'twenty-shared/utils';

type RecomputeViewFiltersOnFlatFieldMetadataOptionsUpdateArgs = {
  fromFlatFieldMetadata: FlatFieldMetadata<EnumFieldMetadataType>;
  update: PropertyUpdate<FlatFieldMetadata<EnumFieldMetadataType>, 'options'>;
} & Pick<AllFlatEntityMaps, 'flatViewFilterMaps'>;

type FlatViewFiltersToDeleteAndUpdate = {
  viewFiltersToDelete: FlatViewFilter[];
  viewFitlersToUpdate: FlatViewFilter[];
};
export const recomputeViewFiltersOnFlatFieldMetadataOptionsUpdate = ({
  flatViewFilterMaps,
  fromFlatFieldMetadata,
  update,
}: RecomputeViewFiltersOnFlatFieldMetadataOptionsUpdateArgs): FlatViewFiltersToDeleteAndUpdate => {
  const flatViewFiltersToCreateAndUpdate: FlatViewFiltersToDeleteAndUpdate = {
    viewFiltersToDelete: [],
    viewFitlersToUpdate: [],
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

  const flatViewFilters = getSubFlatEntityMapsOrThrow({
    flatEntityIds: fromFlatFieldMetadata.viewFiltersIds,
    flatEntityMaps: flatViewFilterMaps,
  });

  for (const viewFilter of Object.values(flatViewFilters.byId).filter(
    isDefined,
  )) {
    const rawViewFitlerValue = viewFilter.value;
    if (!isDefined(rawViewFitlerValue)) {
      continue;
    }

    // TODO: all view filter value should be stored as JSON, this is ongoing work (we are missing a command to migrate the data)
    const viewFilterValue = isNonEmptyString(rawViewFitlerValue)
      ? parseJson(rawViewFitlerValue)
      : rawViewFitlerValue;

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
      flatViewFiltersToCreateAndUpdate.viewFiltersToDelete.push(viewFilter);
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

    flatViewFiltersToCreateAndUpdate.viewFitlersToUpdate.push({
      ...viewFilter,
      value: optionsValues,
    });
  }

  return flatViewFiltersToCreateAndUpdate;
};
