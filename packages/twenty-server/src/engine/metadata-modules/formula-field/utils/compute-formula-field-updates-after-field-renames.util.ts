import { type ValidationRuleBindings } from 'twenty-shared/types';
import {
  getFieldMetadataFormulaBindings,
  getFieldMetadataFormulaEvaluation,
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
  isDefined,
  isValidationRuleReservedName,
  renameValidationRuleExpressionFields,
  renameValidationRulePath,
} from 'twenty-shared/utils';

import { keepStoredFormulaEvaluation } from 'src/engine/metadata-modules/formula-field/utils/keep-stored-formula-evaluation.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type UniversalFlatFieldMetadataByUniversalIdentifier = Partial<
  Record<string, UniversalFlatFieldMetadata>
>;

export const computeFormulaFieldUpdatesAfterFieldRenames = ({
  newFieldNameByUniversalIdentifier,
  existingUniversalFlatFieldMetadataByUniversalIdentifier,
  pendingUniversalFlatFieldMetadataUpdateByUniversalIdentifier,
  deletedUniversalFlatFieldMetadataByUniversalIdentifier,
}: {
  newFieldNameByUniversalIdentifier: Map<string, string>;
  existingUniversalFlatFieldMetadataByUniversalIdentifier: UniversalFlatFieldMetadataByUniversalIdentifier;
  pendingUniversalFlatFieldMetadataUpdateByUniversalIdentifier: UniversalFlatFieldMetadataByUniversalIdentifier;
  deletedUniversalFlatFieldMetadataByUniversalIdentifier: UniversalFlatFieldMetadataByUniversalIdentifier;
}): Record<string, UniversalFlatFieldMetadata> => {
  const universalFlatFieldMetadataToUpdate: Record<
    string,
    UniversalFlatFieldMetadata
  > = {};

  for (const existingUniversalFlatFieldMetadata of Object.values(
    existingUniversalFlatFieldMetadataByUniversalIdentifier,
  )) {
    if (!isDefined(existingUniversalFlatFieldMetadata)) {
      continue;
    }

    const { universalIdentifier } = existingUniversalFlatFieldMetadata;
    const universalFlatFieldMetadata =
      pendingUniversalFlatFieldMetadataUpdateByUniversalIdentifier[
        universalIdentifier
      ] ?? existingUniversalFlatFieldMetadata;
    const settings = universalFlatFieldMetadata.universalSettings;
    const expression = getFieldMetadataFormulaExpression({ settings });
    const currencyCodeExpression =
      getFieldMetadataFormulaCurrencyCodeExpression({ settings });
    const bindings = getFieldMetadataFormulaBindings({ settings });

    if (
      !isDefined(expression) ||
      !isDefined(bindings) ||
      isDefined(
        deletedUniversalFlatFieldMetadataByUniversalIdentifier[
          universalIdentifier
        ],
      )
    ) {
      continue;
    }

    const renamedPaths = Object.entries(bindings).flatMap(
      ([path, boundUniversalIdentifier]) => {
        const newFieldName = newFieldNameByUniversalIdentifier.get(
          boundUniversalIdentifier,
        );

        return isDefined(newFieldName) ? [{ path, newFieldName }] : [];
      },
    );

    // The field validator refuses a reserved name, which the rewritten expression could not use
    if (
      renamedPaths.length === 0 ||
      renamedPaths.some(({ path, newFieldName }) =>
        isValidationRuleReservedName({
          name: newFieldName,
          isMember: path.includes('.'),
        }),
      )
    ) {
      continue;
    }

    const renamedBindings: ValidationRuleBindings = Object.fromEntries(
      Object.entries(bindings).map(([path, boundUniversalIdentifier]) => [
        renameValidationRulePath({
          path,
          bindings,
          fieldNameByUniversalIdentifier: newFieldNameByUniversalIdentifier,
        }),
        boundUniversalIdentifier,
      ]),
    );

    const renameExpression = (formulaExpression: string) =>
      renameValidationRuleExpressionFields({
        expression: formulaExpression,
        bindings,
        fieldNameByUniversalIdentifier: newFieldNameByUniversalIdentifier,
      });

    universalFlatFieldMetadataToUpdate[universalIdentifier] = {
      ...universalFlatFieldMetadata,
      universalSettings: {
        ...settings,
        formula: {
          expression: renameExpression(expression),
          ...(isDefined(currencyCodeExpression)
            ? {
                currencyCodeExpression: renameExpression(
                  currencyCodeExpression,
                ),
              }
            : {}),
          bindings: renamedBindings,
          ...keepStoredFormulaEvaluation(
            getFieldMetadataFormulaEvaluation({ settings }),
          ),
        },
      },
    };
  }

  return universalFlatFieldMetadataToUpdate;
};
