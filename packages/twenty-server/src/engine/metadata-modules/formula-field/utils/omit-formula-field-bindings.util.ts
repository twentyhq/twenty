import {
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
  isDefined,
} from 'twenty-shared/utils';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const omitFormulaFieldBindings = <
  TUniversalSettings extends UniversalFlatFieldMetadata['universalSettings'],
>(
  universalSettings: TUniversalSettings,
): TUniversalSettings => {
  const expression = getFieldMetadataFormulaExpression({
    settings: universalSettings,
  });

  if (!isDefined(expression)) {
    return universalSettings;
  }

  const currencyCodeExpression = getFieldMetadataFormulaCurrencyCodeExpression({
    settings: universalSettings,
  });

  return {
    ...universalSettings,
    formula: {
      expression,
      ...(isDefined(currencyCodeExpression) ? { currencyCodeExpression } : {}),
    },
  };
};
