/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { compileValidationRuleExpressionOrThrow } from 'src/engine/metadata-modules/validation-rule/utils/compile-validation-rule-expression-or-throw.util';

export const computeValidationRuleBindings = ({
  expression,
  isActive,
  objectMetadataId,
  existingFlatValidationRule,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  expression: string;
  isActive: boolean;
  objectMetadataId: string;
  existingFlatValidationRule?: Pick<
    FlatValidationRule,
    'expression' | 'isActive' | 'bindings'
  >;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): FlatValidationRule['bindings'] => {
  const isExpressionChanged =
    expression !== existingFlatValidationRule?.expression;

  if (
    isActive &&
    (isExpressionChanged || !existingFlatValidationRule?.isActive)
  ) {
    return compileValidationRuleExpressionOrThrow({
      expression,
      objectMetadataId,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
  }

  if (!isDefined(existingFlatValidationRule) || isExpressionChanged) {
    return {};
  }

  return existingFlatValidationRule.bindings;
};
