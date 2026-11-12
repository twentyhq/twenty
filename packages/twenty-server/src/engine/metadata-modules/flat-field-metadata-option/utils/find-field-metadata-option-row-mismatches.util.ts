import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';
import { getTargetOptionColumnsByUniversalIdentifier } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/get-target-option-columns-by-universal-identifier.util';

export type FieldMetadataOptionRowMismatch = {
  fieldMetadataId: string;
  optionUniversalIdentifier: string;
  reason: 'missing-row' | 'unexpected-row' | 'different-columns';
};

const COMPARED_COLUMNS = ['value', 'label', 'color', 'position'] as const;

export const findFieldMetadataOptionRowMismatches = ({
  flatFieldMetadata,
  flatFieldMetadataOptions,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  flatFieldMetadataOptions: Pick<
    FlatFieldMetadataOption,
    'universalIdentifier' | (typeof COMPARED_COLUMNS)[number]
  >[];
}): FieldMetadataOptionRowMismatch[] => {
  const storedOptionColumnsByUniversalIdentifier =
    getTargetOptionColumnsByUniversalIdentifier(flatFieldMetadata);
  const rowByUniversalIdentifier = new Map(
    flatFieldMetadataOptions.map((flatFieldMetadataOption) => [
      flatFieldMetadataOption.universalIdentifier,
      flatFieldMetadataOption,
    ]),
  );

  const buildMismatch = (
    optionUniversalIdentifier: string,
    reason: FieldMetadataOptionRowMismatch['reason'],
  ): FieldMetadataOptionRowMismatch => ({
    fieldMetadataId: flatFieldMetadata.id,
    optionUniversalIdentifier,
    reason,
  });

  const mismatches: FieldMetadataOptionRowMismatch[] = [];

  for (const [
    optionUniversalIdentifier,
    storedOptionColumns,
  ] of storedOptionColumnsByUniversalIdentifier) {
    const row = rowByUniversalIdentifier.get(optionUniversalIdentifier);

    if (!isDefined(row)) {
      mismatches.push(buildMismatch(optionUniversalIdentifier, 'missing-row'));
      continue;
    }

    if (
      COMPARED_COLUMNS.some(
        (column) => row[column] !== storedOptionColumns[column],
      )
    ) {
      mismatches.push(
        buildMismatch(optionUniversalIdentifier, 'different-columns'),
      );
    }
  }

  for (const optionUniversalIdentifier of rowByUniversalIdentifier.keys()) {
    if (
      !storedOptionColumnsByUniversalIdentifier.has(optionUniversalIdentifier)
    ) {
      mismatches.push(
        buildMismatch(optionUniversalIdentifier, 'unexpected-row'),
      );
    }
  }

  return mismatches;
};
