import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';
import { resolveFieldMetadataOptionsFromRows } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-field-metadata-options-from-rows.util';

// An application-scoped slice compares a field's options with what that application declares, so the
// options added by other applications are left out. The field entry is replaced, never mutated.
export const restrictFieldMetadataOptionsToSliceOptionRowsThroughMutation = ({
  allFlatEntityMapsToMutate: {
    flatFieldMetadataMaps,
    flatFieldMetadataOptionMaps,
  },
}: {
  allFlatEntityMapsToMutate: Partial<AllFlatEntityMaps>;
}): void => {
  if (
    !isDefined(flatFieldMetadataMaps) ||
    !isDefined(flatFieldMetadataOptionMaps)
  ) {
    return;
  }

  const optionRowsByFieldMetadataUniversalIdentifier = new Map<
    string,
    FlatFieldMetadataOption[]
  >();

  for (const flatFieldMetadataOption of Object.values(
    flatFieldMetadataOptionMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(flatFieldMetadataOption)) {
      continue;
    }

    optionRowsByFieldMetadataUniversalIdentifier.set(
      flatFieldMetadataOption.fieldMetadataUniversalIdentifier,
      [
        ...(optionRowsByFieldMetadataUniversalIdentifier.get(
          flatFieldMetadataOption.fieldMetadataUniversalIdentifier,
        ) ?? []),
        flatFieldMetadataOption,
      ],
    );
  }

  for (const [
    fieldMetadataUniversalIdentifier,
    fieldMetadataOptionRows,
  ] of optionRowsByFieldMetadataUniversalIdentifier) {
    const flatFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[
        fieldMetadataUniversalIdentifier
      ];

    if (!isDefined(flatFieldMetadata)) {
      continue;
    }

    flatFieldMetadataMaps.byUniversalIdentifier[
      fieldMetadataUniversalIdentifier
    ] = {
      ...flatFieldMetadata,
      // What the application declares: no override, deactivation or owner
      options: resolveFieldMetadataOptionsFromRows({
        fieldMetadataEntity: {
          type: flatFieldMetadata.type,
          options: flatFieldMetadata.options,
        },
        fieldMetadataOptionRows: fieldMetadataOptionRows.map(
          ({ universalIdentifier, value, label, color, position }) => ({
            universalIdentifier,
            value,
            label,
            color,
            position,
          }),
        ),
      }),
    };
  }
};
