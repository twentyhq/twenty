import {
  FieldMetadataType,
  type FromTo,
  type ViewFilterValue,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveFlatFieldMetadataOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { compareTwoFlatFieldMetadataEnumOptions } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata-enum-options.util';
import { computeSelectFilterValueAfterOptionsUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-select-filter-value-after-options-update.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

type RecomputeRollupFiltersOnFlatFieldMetadataOptionsUpdateArgs = FromTo<
  FlatFieldMetadata,
  'flatFieldMetadata'
> &
  Pick<
    AllFlatEntityMaps,
    'flatFieldMetadataMaps' | 'flatFieldMetadataOptionMaps'
  >;

// A filter whose options were all deleted keeps its value and matches nothing: dropping it would widen the rollup
export const recomputeRollupFiltersOnFlatFieldMetadataOptionsUpdate = ({
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
  flatFieldMetadataMaps,
  flatFieldMetadataOptionMaps,
}: RecomputeRollupFiltersOnFlatFieldMetadataOptionsUpdateArgs): FlatFieldMetadata<FieldMetadataType.ROLLUP>[] => {
  if (
    !isEnumFlatFieldMetadata(fromFlatFieldMetadata) ||
    !isEnumFlatFieldMetadata(toFlatFieldMetadata) ||
    toFlatFieldMetadata.options === fromFlatFieldMetadata.options
  ) {
    return [];
  }

  const fromOptions =
    resolveFlatFieldMetadataOptions({
      flatFieldMetadata: fromFlatFieldMetadata,
      flatFieldMetadataOptionMaps,
    }) ?? [];
  const { deleted: deletedOptions, updated: updatedOptions } =
    compareTwoFlatFieldMetadataEnumOptions({
      compareLabel: false,
      fromOptions,
      toOptions: toFlatFieldMetadata.options,
    });

  if (deletedOptions.length === 0 && updatedOptions.length === 0) {
    return [];
  }

  return Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter((flatFieldMetadata) =>
      isFlatFieldMetadataOfType(flatFieldMetadata, FieldMetadataType.ROLLUP),
    )
    .flatMap((rollupFlatFieldMetadata) => {
      const recomputedValueByFilterId = new Map<string, string[]>();

      for (const filter of rollupFlatFieldMetadata.settings.filters) {
        if (filter.fieldMetadataId !== fromFlatFieldMetadata.id) {
          continue;
        }

        const recomputedValue = computeSelectFilterValueAfterOptionsUpdate({
          operand: filter.operand,
          subFieldName: filter.subFieldName,
          value: filter.value,
          fromOptions,
          deletedOptions,
          updatedOptions,
        });

        if (isNonEmptyArray(recomputedValue)) {
          recomputedValueByFilterId.set(filter.id, recomputedValue);
        }
      }

      if (recomputedValueByFilterId.size === 0) {
        return [];
      }

      const applyRecomputedValue = <
        TFilter extends { id: string; value: ViewFilterValue },
      >(
        filter: TFilter,
      ) => ({
        ...filter,
        value: recomputedValueByFilterId.get(filter.id) ?? filter.value,
      });

      return [
        {
          ...rollupFlatFieldMetadata,
          settings: {
            ...rollupFlatFieldMetadata.settings,
            filters:
              rollupFlatFieldMetadata.settings.filters.map(
                applyRecomputedValue,
              ),
          },
          universalSettings: {
            ...rollupFlatFieldMetadata.universalSettings,
            filters:
              rollupFlatFieldMetadata.universalSettings.filters.map(
                applyRecomputedValue,
              ),
          },
        },
      ];
    });
};
