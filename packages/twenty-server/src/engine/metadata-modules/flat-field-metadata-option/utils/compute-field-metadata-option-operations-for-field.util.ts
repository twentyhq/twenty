import { isDefined } from 'twenty-shared/utils';

import {
  getTargetOptionColumnsByUniversalIdentifier,
  type FieldMetadataOptionColumns,
} from 'src/engine/metadata-modules/flat-field-metadata-option/utils/get-target-option-columns-by-universal-identifier.util';
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

// Keeps a field's option rows in step with its `options` array; a row's universal identifier is the option id.
export const computeFieldMetadataOptionOperationsForField = ({
  fieldMetadataUniversalIdentifier,
  targetUniversalFlatFieldMetadata,
  existingOptions,
  applicationUniversalIdentifier,
}: {
  fieldMetadataUniversalIdentifier: string;
  targetUniversalFlatFieldMetadata: UniversalFlatFieldMetadata | undefined;
  existingOptions: UniversalFlatFieldMetadataOption[];
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

  for (const [
    universalIdentifier,
    targetOptionColumns,
  ] of targetOptionColumnsByUniversalIdentifier) {
    if (existingOptionUniversalIdentifiers.has(universalIdentifier)) {
      continue;
    }

    operations.flatEntityToCreate[universalIdentifier] = {
      universalIdentifier,
      applicationUniversalIdentifier,
      fieldMetadataUniversalIdentifier,
      ...targetOptionColumns,
      isActive: true,
      overrides: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  return operations;
};
