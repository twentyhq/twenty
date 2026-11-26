import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  getFieldMetadataFormulaTree,
  isDefined,
  printFieldMetadataFormula,
} from 'twenty-shared/utils';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// A manifest declares a formula as text, so its stored trees are printed with the current field names
export const printFormulaFieldUniversalSettings = <
  TUniversalSettings extends UniversalFlatFieldMetadata['universalSettings'],
>({
  universalSettings,
  fields,
}: {
  universalSettings: TUniversalSettings;
  fields: ValidationRuleFieldDescriptor[];
}): TUniversalSettings => {
  if (
    !isDefined(universalSettings) ||
    !isDefined(getFieldMetadataFormulaTree({ settings: universalSettings }))
  ) {
    return universalSettings;
  }

  const { expression, currencyCodeExpression } = printFieldMetadataFormula({
    settings: universalSettings,
    fields,
  });

  return {
    ...universalSettings,
    formula: {
      expression,
      ...(isDefined(currencyCodeExpression) ? { currencyCodeExpression } : {}),
    },
  };
};
