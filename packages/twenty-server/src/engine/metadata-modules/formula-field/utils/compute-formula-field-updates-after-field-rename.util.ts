import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  compileFormulaExpression,
  getFieldMetadataFormulaExpression,
  isDefined,
  isValidationRuleReservedName,
  renameValidationRuleExpressionFields,
} from 'twenty-shared/utils';

import {
  buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps,
  type FormulaSourceUniversalFlatObjectMetadata,
} from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-universal-flat-entity-maps.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type UniversalFlatFieldMetadataByUniversalIdentifier = Partial<
  Record<string, UniversalFlatFieldMetadata>
>;

export const computeFormulaFieldUpdatesAfterFieldRename = ({
  renamedFieldUniversalIdentifier,
  previousFieldName,
  newFieldName,
  universalFlatObjectMetadataMaps,
  existingUniversalFlatFieldMetadataByUniversalIdentifier,
  pendingUniversalFlatFieldMetadataUpdateByUniversalIdentifier,
  deletedUniversalFlatFieldMetadataByUniversalIdentifier,
}: {
  renamedFieldUniversalIdentifier: string;
  previousFieldName: string;
  newFieldName: string;
  universalFlatObjectMetadataMaps: {
    byUniversalIdentifier: Partial<
      Record<string, FormulaSourceUniversalFlatObjectMetadata>
    >;
  };
  existingUniversalFlatFieldMetadataByUniversalIdentifier: UniversalFlatFieldMetadataByUniversalIdentifier;
  pendingUniversalFlatFieldMetadataUpdateByUniversalIdentifier: UniversalFlatFieldMetadataByUniversalIdentifier;
  deletedUniversalFlatFieldMetadataByUniversalIdentifier: UniversalFlatFieldMetadataByUniversalIdentifier;
}): Record<string, UniversalFlatFieldMetadata> => {
  // A reserved name would change what the rewritten expression means, so the formula is left to fail
  if (isValidationRuleReservedName({ name: newFieldName, isMember: false })) {
    return {};
  }

  const fieldNameByUniversalIdentifier = new Map([
    [renamedFieldUniversalIdentifier, newFieldName],
  ]);
  const fieldDescriptorsByObjectUniversalIdentifier = new Map<
    string,
    ValidationRuleFieldDescriptor[]
  >();
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

    const { universalIdentifier, objectMetadataUniversalIdentifier } =
      existingUniversalFlatFieldMetadata;
    const universalFlatFieldMetadata =
      pendingUniversalFlatFieldMetadataUpdateByUniversalIdentifier[
        universalIdentifier
      ] ?? existingUniversalFlatFieldMetadata;
    const expression = getFieldMetadataFormulaExpression({
      settings: universalFlatFieldMetadata.universalSettings,
    });
    const universalFlatObjectMetadata =
      universalFlatObjectMetadataMaps.byUniversalIdentifier[
        objectMetadataUniversalIdentifier
      ];

    if (
      !isDefined(expression) ||
      !expression.includes(previousFieldName) ||
      !isDefined(universalFlatObjectMetadata) ||
      isDefined(
        deletedUniversalFlatFieldMetadataByUniversalIdentifier[
          universalIdentifier
        ],
      )
    ) {
      continue;
    }

    const fields =
      fieldDescriptorsByObjectUniversalIdentifier.get(
        objectMetadataUniversalIdentifier,
      ) ??
      buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps({
        universalFlatObjectMetadata,
        universalFlatObjectMetadataMaps,
        universalFlatFieldMetadataMaps: {
          byUniversalIdentifier:
            existingUniversalFlatFieldMetadataByUniversalIdentifier,
        },
      });

    fieldDescriptorsByObjectUniversalIdentifier.set(
      objectMetadataUniversalIdentifier,
      fields,
    );

    const compilation = compileFormulaExpression({ expression, fields });

    if (
      !compilation.isValid ||
      !Object.values(compilation.bindings).includes(
        renamedFieldUniversalIdentifier,
      )
    ) {
      continue;
    }

    universalFlatFieldMetadataToUpdate[universalIdentifier] = {
      ...universalFlatFieldMetadata,
      universalSettings: {
        ...universalFlatFieldMetadata.universalSettings,
        formula: {
          expression: renameValidationRuleExpressionFields({
            expression,
            bindings: compilation.bindings,
            fieldNameByUniversalIdentifier,
          }),
        },
      },
    };
  }

  return universalFlatFieldMetadataToUpdate;
};
