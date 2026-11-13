import { msg, t } from '@lingui/core/macro';
import { isBoolean, isString } from '@sniptt/guards';
import { QUOTED_STRING_REGEX } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';
import { isEnumUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import {
  type OrchestratorActionsReport,
  type OrchestratorFailureReport,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';

// The default value and its options can change through different entities of one migration, so check the final state.
export const validateFieldMetadataDefaultValueOptionCrossEntity = ({
  fromFlatFieldMetadataOptionMaps,
  optimisticUniversalFlatMaps: {
    flatFieldMetadataMaps,
    flatFieldMetadataOptionMaps,
  },
  orchestratorActionsReport,
  isWorkspaceCaller,
}: {
  // A workspace deactivation must not fail another application's sync, so only the workspace is held to it.
  isWorkspaceCaller: boolean;
  fromFlatFieldMetadataOptionMaps:
    | MetadataUniversalFlatEntityMaps<'fieldMetadataOption'>
    | undefined;
  optimisticUniversalFlatMaps: Pick<
    AllUniversalFlatEntityMaps,
    'flatFieldMetadataMaps' | 'flatFieldMetadataOptionMaps'
  >;
  orchestratorActionsReport: Pick<
    OrchestratorActionsReport,
    'fieldMetadata' | 'fieldMetadataOption'
  >;
}): Pick<OrchestratorFailureReport, 'fieldMetadata'> => {
  const validationErrors: Pick<OrchestratorFailureReport, 'fieldMetadata'> = {
    fieldMetadata: [],
  };

  const createdFieldMetadataUniversalIdentifiers = new Set(
    orchestratorActionsReport.fieldMetadata.create.map(
      ({ flatEntity }) => flatEntity.universalIdentifier,
    ),
  );

  const touchedFieldMetadataUniversalIdentifiers = new Set(
    [
      ...createdFieldMetadataUniversalIdentifiers,
      ...orchestratorActionsReport.fieldMetadata.update.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
      ...orchestratorActionsReport.fieldMetadataOption.create.map(
        ({ flatEntity }) => flatEntity.fieldMetadataUniversalIdentifier,
      ),
      ...orchestratorActionsReport.fieldMetadataOption.update.map(
        ({ universalIdentifier }) =>
          flatFieldMetadataOptionMaps?.byUniversalIdentifier[
            universalIdentifier
          ]?.fieldMetadataUniversalIdentifier,
      ),
      ...orchestratorActionsReport.fieldMetadataOption.delete.map(
        ({ universalIdentifier }) =>
          fromFlatFieldMetadataOptionMaps?.byUniversalIdentifier[
            universalIdentifier
          ]?.fieldMetadataUniversalIdentifier,
      ),
    ].filter(isDefined),
  );

  if (touchedFieldMetadataUniversalIdentifiers.size === 0) {
    return validationErrors;
  }

  const optionValuesByFieldMetadataUniversalIdentifier = new Map<
    string,
    Set<string>
  >();
  const inactiveOptionValuesByFieldMetadataUniversalIdentifier = new Map<
    string,
    Set<string>
  >();

  for (const flatFieldMetadataOption of Object.values(
    flatFieldMetadataOptionMaps?.byUniversalIdentifier ?? {},
  )) {
    if (!isDefined(flatFieldMetadataOption)) {
      continue;
    }

    const optionValues =
      optionValuesByFieldMetadataUniversalIdentifier.get(
        flatFieldMetadataOption.fieldMetadataUniversalIdentifier,
      ) ?? new Set<string>();

    optionValues.add(flatFieldMetadataOption.value);
    optionValuesByFieldMetadataUniversalIdentifier.set(
      flatFieldMetadataOption.fieldMetadataUniversalIdentifier,
      optionValues,
    );

    const isActiveOverride = isWorkspaceCaller
      ? readAuthoredOverrideProperty({
          metadataName: 'fieldMetadataOption',
          overrides: flatFieldMetadataOption.overrides,
          path: ['isActive'],
          authorContext: { ownerApplicationUniversalIdentifier: undefined },
        })
      : undefined;

    if (
      (isBoolean(isActiveOverride)
        ? isActiveOverride
        : flatFieldMetadataOption.isActive) === false
    ) {
      const inactiveOptionValues =
        inactiveOptionValuesByFieldMetadataUniversalIdentifier.get(
          flatFieldMetadataOption.fieldMetadataUniversalIdentifier,
        ) ?? new Set<string>();

      inactiveOptionValues.add(flatFieldMetadataOption.value);
      inactiveOptionValuesByFieldMetadataUniversalIdentifier.set(
        flatFieldMetadataOption.fieldMetadataUniversalIdentifier,
        inactiveOptionValues,
      );
    }
  }

  for (const fieldMetadataUniversalIdentifier of touchedFieldMetadataUniversalIdentifiers) {
    const universalFlatFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[
        fieldMetadataUniversalIdentifier
      ];

    if (
      !isDefined(universalFlatFieldMetadata) ||
      !isEnumUniversalFlatFieldMetadata(universalFlatFieldMetadata) ||
      !isDefined(universalFlatFieldMetadata.defaultValue)
    ) {
      continue;
    }

    const rowOptionValues = optionValuesByFieldMetadataUniversalIdentifier.get(
      fieldMetadataUniversalIdentifier,
    );
    const storedOptionValues = (universalFlatFieldMetadata.options ?? []).map(
      ({ value }) => value,
    );
    // Same rule as reads: the stored options stand while one of them has no row
    const optionValues =
      isDefined(rowOptionValues) &&
      storedOptionValues.every((value) => rowOptionValues.has(value))
        ? rowOptionValues
        : new Set(storedOptionValues);

    const defaultValues: unknown[] = Array.isArray(
      universalFlatFieldMetadata.defaultValue,
    )
      ? universalFlatFieldMetadata.defaultValue
      : [universalFlatFieldMetadata.defaultValue];

    const defaultValuesWithoutOption = defaultValues
      .filter(isString)
      .filter(
        (defaultValue) =>
          !optionValues.has(defaultValue.replace(QUOTED_STRING_REGEX, '$1')),
      );

    const inactiveOptionValues =
      inactiveOptionValuesByFieldMetadataUniversalIdentifier.get(
        fieldMetadataUniversalIdentifier,
      );
    const hasInactiveDefaultOption = defaultValues
      .filter(isString)
      .some((defaultValue) =>
        inactiveOptionValues?.has(
          defaultValue.replace(QUOTED_STRING_REGEX, '$1'),
        ),
      );

    if (defaultValuesWithoutOption.length === 0 && !hasInactiveDefaultOption) {
      continue;
    }

    const failedValidation = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: fieldMetadataUniversalIdentifier,
        name: universalFlatFieldMetadata.name,
        objectMetadataUniversalIdentifier:
          universalFlatFieldMetadata.objectMetadataUniversalIdentifier,
      },
      metadataName: 'fieldMetadata',
      type: createdFieldMetadataUniversalIdentifiers.has(
        fieldMetadataUniversalIdentifier,
      )
        ? 'create'
        : 'update',
    });

    for (const defaultValue of defaultValuesWithoutOption) {
      failedValidation.errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: t`Default value "${defaultValue}" must be one of the option values`,
        userFriendlyMessage: msg`Default value "${defaultValue}" must be one of the option values`,
        value: defaultValue,
      });
    }

    if (hasInactiveDefaultOption) {
      failedValidation.errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: t`The default option cannot be deactivated`,
        userFriendlyMessage: msg`The default option cannot be deactivated`,
        value: universalFlatFieldMetadata.defaultValue,
      });
    }

    validationErrors.fieldMetadata.push(failedValidation);
  }

  return validationErrors;
};
