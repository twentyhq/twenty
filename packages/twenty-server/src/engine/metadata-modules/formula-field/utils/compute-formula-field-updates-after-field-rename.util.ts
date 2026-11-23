import { type ValidationRuleBindings } from 'twenty-shared/types';
import {
  getFieldMetadataFormulaBindings,
  getFieldMetadataFormulaExpression,
  isDefined,
  isValidationRuleReservedName,
  renameValidationRuleExpressionFields,
  renameValidationRulePath,
} from 'twenty-shared/utils';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type UniversalFlatFieldMetadataByUniversalIdentifier = Partial<
  Record<string, UniversalFlatFieldMetadata>
>;

export const computeFormulaFieldUpdatesAfterFieldRename = ({
  renamedFieldUniversalIdentifier,
  newFieldName,
  existingUniversalFlatFieldMetadataByUniversalIdentifier,
  pendingUniversalFlatFieldMetadataUpdateByUniversalIdentifier,
  deletedUniversalFlatFieldMetadataByUniversalIdentifier,
}: {
  renamedFieldUniversalIdentifier: string;
  newFieldName: string;
  existingUniversalFlatFieldMetadataByUniversalIdentifier: UniversalFlatFieldMetadataByUniversalIdentifier;
  pendingUniversalFlatFieldMetadataUpdateByUniversalIdentifier: UniversalFlatFieldMetadataByUniversalIdentifier;
  deletedUniversalFlatFieldMetadataByUniversalIdentifier: UniversalFlatFieldMetadataByUniversalIdentifier;
}): Record<string, UniversalFlatFieldMetadata> => {
  const fieldNameByUniversalIdentifier = new Map([
    [renamedFieldUniversalIdentifier, newFieldName],
  ]);
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

    const renamedPaths = Object.entries(bindings).filter(
      ([, boundUniversalIdentifier]) =>
        boundUniversalIdentifier === renamedFieldUniversalIdentifier,
    );

    // A reserved name would change what the rewritten expression means, so the formula is left to fail
    if (
      renamedPaths.length === 0 ||
      renamedPaths.some(([path]) =>
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
          fieldNameByUniversalIdentifier,
        }),
        boundUniversalIdentifier,
      ]),
    );

    universalFlatFieldMetadataToUpdate[universalIdentifier] = {
      ...universalFlatFieldMetadata,
      universalSettings: {
        ...settings,
        formula: {
          expression: renameValidationRuleExpressionFields({
            expression,
            bindings,
            fieldNameByUniversalIdentifier,
          }),
          bindings: renamedBindings,
        },
      },
    };
  }

  return universalFlatFieldMetadataToUpdate;
};
