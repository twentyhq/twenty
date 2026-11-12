import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  getTargetOptionColumnsByUniversalIdentifier,
  type FieldMetadataOptionColumns,
} from 'src/engine/metadata-modules/flat-field-metadata-option/utils/get-target-option-columns-by-universal-identifier.util';
import { type FieldMetadataOptionOverrides } from 'src/engine/metadata-modules/field-metadata-option/entities/field-metadata-option.entity';
import { buildUniversalFlatFieldMetadataOptionsForField } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/build-universal-flat-field-metadata-options-for-field.util';
import { isFieldMetadataOptionSyncSkipped } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/is-field-metadata-option-sync-skipped.util';
import { resolveEffectiveFieldMetadataOptionColumns } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-effective-field-metadata-option-columns.util';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';
import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/overrides/utils/sanitize-overridable-entity-input.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatFieldMetadataOption } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata-option.type';

type FieldMetadataOptionOperations = {
  flatEntityToCreate: Record<string, UniversalFlatFieldMetadataOption>;
  flatEntityToUpdate: Record<string, UniversalFlatFieldMetadataOption>;
  flatEntityToDelete: Record<string, UniversalFlatFieldMetadataOption>;
};

const hasOptionColumnsChanged = ({
  effectiveOptionColumns,
  targetOptionColumns,
}: {
  effectiveOptionColumns: FieldMetadataOptionColumns;
  targetOptionColumns: FieldMetadataOptionColumns;
}) =>
  effectiveOptionColumns.value !== targetOptionColumns.value ||
  effectiveOptionColumns.label !== targetOptionColumns.label ||
  effectiveOptionColumns.color !== targetOptionColumns.color ||
  effectiveOptionColumns.position !== targetOptionColumns.position ||
  effectiveOptionColumns.isActive !== targetOptionColumns.isActive;

// A row's universal identifier is its option id.
export const computeFieldMetadataOptionOperationsForField = ({
  targetUniversalFlatFieldMetadata,
  existingOptions,
  isUniversalIdentifierUsedByOtherField,
  applicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  targetUniversalFlatFieldMetadata: UniversalFlatFieldMetadata | undefined;
  existingOptions: UniversalFlatFieldMetadataOption[];
  isUniversalIdentifierUsedByOtherField: (
    universalIdentifier: string,
  ) => boolean;
  applicationUniversalIdentifier: string;
  // Without it the caller is never overriding, so rows are written directly.
  workspaceCustomApplicationUniversalIdentifier?: string;
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

    const effectiveOptionColumns = resolveEffectiveFieldMetadataOptionColumns({
      universalFlatFieldMetadataOption: existingOption,
      workspaceCustomApplicationUniversalIdentifier,
    });

    if (
      !hasOptionColumnsChanged({ effectiveOptionColumns, targetOptionColumns })
    ) {
      continue;
    }

    const { value, ...overridableOptionColumns } = targetOptionColumns;
    const isCallerOverridingOption =
      isDefined(workspaceCustomApplicationUniversalIdentifier) &&
      isCallerOverridingEntity({
        callerApplicationUniversalIdentifier: applicationUniversalIdentifier,
        entityApplicationUniversalIdentifier:
          existingOption.applicationUniversalIdentifier,
        workspaceCustomApplicationUniversalIdentifier,
        isSystemSideEffect: false,
      });
    const { overrides, updatedEditableProperties } =
      sanitizeOverridableEntityInput<
        'fieldMetadataOption',
        Partial<Omit<FieldMetadataOptionColumns, 'value'>>,
        FieldMetadataOptionOverrides
      >({
        metadataName: 'fieldMetadataOption',
        existingFlatEntity: existingOption,
        updatedEditableProperties: overridableOptionColumns,
        shouldOverride: isCallerOverridingOption,
        callerApplicationUniversalIdentifier: applicationUniversalIdentifier,
        workspaceCustomApplicationUniversalIdentifier:
          workspaceCustomApplicationUniversalIdentifier ??
          applicationUniversalIdentifier,
      });

    operations.flatEntityToUpdate[existingOption.universalIdentifier] = {
      ...existingOption,
      ...updatedEditableProperties,
      value,
      overrides,
      updatedAt: now,
    };
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
