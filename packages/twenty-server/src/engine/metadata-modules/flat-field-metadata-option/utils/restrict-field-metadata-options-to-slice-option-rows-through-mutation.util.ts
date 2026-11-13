import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';
import { resolveFieldMetadataOptionsFromRows } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-field-metadata-options-from-rows.util';

// An app slice is compared with what that app declares, so other apps' options are left out; entries are replaced, not mutated.
export const restrictFieldMetadataOptionsToSliceOptionRowsThroughMutation = ({
  allFlatEntityMapsToMutate: {
    flatFieldMetadataMaps,
    flatFieldMetadataOptionMaps,
  },
}: {
  allFlatEntityMapsToMutate: Partial<
    Pick<
      AllFlatEntityMaps,
      'flatFieldMetadataMaps' | 'flatFieldMetadataOptionMaps'
    >
  >;
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

    if (
      !isDefined(flatFieldMetadata) ||
      fieldMetadataOptionRows.length === flatFieldMetadata.options?.length
    ) {
      continue;
    }

    flatFieldMetadataMaps.byUniversalIdentifier[
      fieldMetadataUniversalIdentifier
    ] = {
      ...flatFieldMetadata,
      options: resolveFieldMetadataOptionsFromRows({
        fieldMetadataEntity: flatFieldMetadata,
        fieldMetadataOptionRows,
      }),
    };
  }
};
