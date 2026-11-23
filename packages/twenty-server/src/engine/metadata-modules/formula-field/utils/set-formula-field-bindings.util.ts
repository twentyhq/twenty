import {
  compileFormulaExpression,
  getFieldMetadataFormulaBindings,
  getFieldMetadataFormulaExpression,
  isDefined,
} from 'twenty-shared/utils';

import {
  buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps,
  type FormulaSourceUniversalFlatFieldMetadata,
  type FormulaSourceUniversalFlatObjectMetadata,
} from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-universal-flat-entity-maps.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// Bindings are derived from the expression, so whatever a client sent is replaced.
// They are kept while the expression is unchanged, so a formula that no longer
// compiles still records what it read.
export const setFormulaFieldBindings = <
  TUniversalFlatFieldMetadata extends FormulaSourceUniversalFlatFieldMetadata &
    Pick<UniversalFlatFieldMetadata, 'universalSettings'>,
>({
  universalFlatFieldMetadata,
  existingUniversalSettings,
  universalFlatObjectMetadataMaps,
  universalFlatFieldMetadataMaps,
  pendingUniversalFlatFieldMetadatas = [],
}: {
  universalFlatFieldMetadata: TUniversalFlatFieldMetadata;
  existingUniversalSettings?: unknown;
  universalFlatObjectMetadataMaps: {
    byUniversalIdentifier: Partial<
      Record<string, FormulaSourceUniversalFlatObjectMetadata>
    >;
  };
  universalFlatFieldMetadataMaps: {
    byUniversalIdentifier: Partial<
      Record<string, FormulaSourceUniversalFlatFieldMetadata>
    >;
  };
  pendingUniversalFlatFieldMetadatas?: FormulaSourceUniversalFlatFieldMetadata[];
}): TUniversalFlatFieldMetadata => {
  const { universalSettings, universalIdentifier, name } =
    universalFlatFieldMetadata;
  const expression = getFieldMetadataFormulaExpression({
    settings: universalSettings,
  });
  const universalFlatObjectMetadata =
    universalFlatObjectMetadataMaps.byUniversalIdentifier[
      universalFlatFieldMetadata.objectMetadataUniversalIdentifier
    ];

  if (!isDefined(expression) || !isDefined(universalSettings)) {
    return universalFlatFieldMetadata;
  }

  const existingBindings =
    expression ===
    getFieldMetadataFormulaExpression({ settings: existingUniversalSettings })
      ? getFieldMetadataFormulaBindings({ settings: existingUniversalSettings })
      : undefined;

  const computeBindings = () => {
    if (!isDefined(universalFlatObjectMetadata)) {
      return {};
    }

    const compilation = compileFormulaExpression({
      expression,
      fields: buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps({
        universalFlatObjectMetadata,
        universalFlatObjectMetadataMaps,
        universalFlatFieldMetadataMaps,
        pendingUniversalFlatFieldMetadatas:
          pendingUniversalFlatFieldMetadatas.filter(
            (pendingUniversalFlatFieldMetadata) =>
              pendingUniversalFlatFieldMetadata.universalIdentifier !==
              universalIdentifier,
          ),
      }).filter(
        (formulaFieldDescriptor) => formulaFieldDescriptor.name !== name,
      ),
    });

    return compilation.isValid ? compilation.bindings : {};
  };

  return {
    ...universalFlatFieldMetadata,
    universalSettings: {
      ...universalSettings,
      formula: {
        expression,
        bindings: existingBindings ?? computeBindings(),
      },
    },
  };
};
