import {
  type EnumFieldMetadataType,
  type FromTo,
  type ViewFilterValue,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { compareTwoFlatFieldMetadataEnumOptions } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata-enum-options.util';
import { computeSelectFilterValueAfterOptionsUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-select-filter-value-after-options-update.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';

type RecomputeViewFieldRelationScopesOnFlatFieldMetadataOptionsUpdateArgs = {
  fromFlatFieldMetadata: Pick<FlatFieldMetadata, 'universalIdentifier'>;
} & FromTo<FlatFieldMetadata<EnumFieldMetadataType>['options'], 'options'> &
  Pick<AllFlatEntityMaps, 'flatViewFieldMaps'>;

const applyRecomputedFilterValues = <
  TFilter extends { id: string; value: ViewFilterValue },
>({
  filters,
  recomputedValueByFilterId,
}: {
  filters: TFilter[];
  recomputedValueByFilterId: Map<string, string[]>;
}): TFilter[] =>
  filters.flatMap((filter) => {
    const recomputedValue = recomputedValueByFilterId.get(filter.id);

    if (!isDefined(recomputedValue)) {
      return [filter];
    }

    return recomputedValue.length === 0
      ? []
      : [{ ...filter, value: recomputedValue }];
  });

// Like view filters, a filter left without options is dropped rather than removing the column
export const recomputeViewFieldRelationScopesOnFlatFieldMetadataOptionsUpdate =
  ({
    flatViewFieldMaps,
    fromFlatFieldMetadata,
    fromOptions,
    toOptions,
  }: RecomputeViewFieldRelationScopesOnFlatFieldMetadataOptionsUpdateArgs): FlatViewField[] => {
    const { deleted: deletedOptions, updated: updatedOptions } =
      compareTwoFlatFieldMetadataEnumOptions({
        compareLabel: false,
        fromOptions,
        toOptions,
      });

    if (deletedOptions.length === 0 && updatedOptions.length === 0) {
      return [];
    }

    return Object.values(flatViewFieldMaps.byUniversalIdentifier).flatMap(
      (flatViewField) => {
        if (!isDefined(flatViewField?.universalRelationScope)) {
          return [];
        }

        const { relationScope, universalRelationScope } = flatViewField;
        const recomputedValueByFilterId = new Map<string, string[]>();

        for (const filter of universalRelationScope.filters) {
          if (
            (filter.relationTargetFieldMetadataUniversalIdentifier ??
              filter.fieldMetadataUniversalIdentifier) !==
            fromFlatFieldMetadata.universalIdentifier
          ) {
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

          if (isDefined(recomputedValue)) {
            recomputedValueByFilterId.set(filter.id, recomputedValue);
          }
        }

        if (recomputedValueByFilterId.size === 0) {
          return [];
        }

        const recomputedRelationScope = isDefined(relationScope)
          ? {
              ...relationScope,
              filters: applyRecomputedFilterValues({
                filters: relationScope.filters,
                recomputedValueByFilterId,
              }),
            }
          : null;

        return [
          {
            ...flatViewField,
            relationScope: recomputedRelationScope,
            universalRelationScope: {
              ...universalRelationScope,
              filters: applyRecomputedFilterValues({
                filters: universalRelationScope.filters,
                recomputedValueByFilterId,
              }),
            },
          },
        ];
      },
    );
  };
