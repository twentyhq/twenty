import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  getTargetOptionColumnsByUniversalIdentifier,
  type FieldMetadataOptionColumns,
} from 'src/engine/metadata-modules/flat-field-metadata-option/utils/get-target-option-columns-by-universal-identifier.util';
import { buildUniversalFlatFieldMetadataOptionsForField } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/build-universal-flat-field-metadata-options-for-field.util';
import { isFieldMetadataOptionSyncSkipped } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/is-field-metadata-option-sync-skipped.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatFieldMetadataOption } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata-option.type';

type FieldMetadataOptionOperations = {
  flatEntityToCreate: Record<string, UniversalFlatFieldMetadataOption>;
  flatEntityToUpdate: Record<string, UniversalFlatFieldMetadataOption>;
  flatEntityToDelete: Record<string, UniversalFlatFieldMetadataOption>;
};

const hasOptionColumnsChanged = ({
  existingOption,
  targetOptionColumns,
}: {
  existingOption: UniversalFlatFieldMetadataOption;
  targetOptionColumns: FieldMetadataOptionColumns;
}) =>
  existingOption.value !== targetOptionColumns.value ||
  existingOption.label !== targetOptionColumns.label ||
  existingOption.color !== targetOptionColumns.color ||
  existingOption.position !== targetOptionColumns.position;

// A row's universal identifier is its option id.
export const computeFieldMetadataOptionOperationsForField = ({
  targetUniversalFlatFieldMetadata,
  existingOptions,
  isUniversalIdentifierUsedByOtherField,
  applicationUniversalIdentifier,
}: {
  targetUniversalFlatFieldMetadata: UniversalFlatFieldMetadata | undefined;
  existingOptions: UniversalFlatFieldMetadataOption[];
  isUniversalIdentifierUsedByOtherField: (
    universalIdentifier: string,
  ) => boolean;
  applicationUniversalIdentifier: string;
}): FieldMetadataOptionOperations => {
  const now = new Date().toISOString();
  const operations: FieldMetadataOptionOperations = {
    flatEntityToCreate: {},
    flatEntityToUpdate: {},
    flatEntityToDelete: {},
  };

  if (isFieldMetadataOptionSyncSkipped(targetUniversalFlatFieldMetadata)) {
    return operations;
  }

  // Caller-owned rows here would collide with the field app's sync; the backfill creates them.
  if (
    !isNonEmptyArray(existingOptions) &&
    isDefined(targetUniversalFlatFieldMetadata) &&
    targetUniversalFlatFieldMetadata.applicationUniversalIdentifier !==
      applicationUniversalIdentifier
  ) {
    return operations;
  }

  const targetOptionColumnsByUniversalIdentifier =
    getTargetOptionColumnsByUniversalIdentifier(
      targetUniversalFlatFieldMetadata,
    );

  for (const existingOption of existingOptions) {
    const targetOptionColumns = targetOptionColumnsByUniversalIdentifier.get(
      existingOption.universalIdentifier,
    );

    if (!isDefined(targetOptionColumns)) {
      operations.flatEntityToDelete[existingOption.universalIdentifier] =
        existingOption;
      continue;
    }

    if (hasOptionColumnsChanged({ existingOption, targetOptionColumns })) {
      operations.flatEntityToUpdate[existingOption.universalIdentifier] = {
        ...existingOption,
        ...targetOptionColumns,
        updatedAt: now,
      };
    }
  }

  const existingOptionUniversalIdentifiers = new Set(
    existingOptions.map(({ universalIdentifier }) => universalIdentifier),
  );

  if (!isDefined(targetUniversalFlatFieldMetadata)) {
    return operations;
  }

  for (const targetOption of buildUniversalFlatFieldMetadataOptionsForField({
    universalFlatFieldMetadata: targetUniversalFlatFieldMetadata,
    applicationUniversalIdentifier,
    now,
  })) {
    // An option id reused across fields keeps its first field's row.
    if (
      existingOptionUniversalIdentifiers.has(
        targetOption.universalIdentifier,
      ) ||
      isUniversalIdentifierUsedByOtherField(targetOption.universalIdentifier)
    ) {
      continue;
    }

    operations.flatEntityToCreate[targetOption.universalIdentifier] =
      targetOption;
  }

  return operations;
};
