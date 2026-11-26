/* @license Enterprise */

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { compileValidationRuleTreeOrThrow } from 'src/engine/metadata-modules/validation-rule/utils/compile-validation-rule-tree-or-throw.util';
import { printFlatValidationRuleExpression } from 'src/engine/metadata-modules/validation-rule/utils/print-flat-validation-rule-expression.util';

export const computeValidationRuleTree = ({
  expression,
  isActive,
  objectMetadataId,
  existingFlatValidationRule,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  expression?: string;
  isActive: boolean;
  objectMetadataId: string;
  existingFlatValidationRule?: Pick<FlatValidationRule, 'tree' | 'isActive'>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): FlatValidationRule['tree'] => {
  const existingExpression = isDefined(existingFlatValidationRule)
    ? printFlatValidationRuleExpression({
        flatValidationRule: { ...existingFlatValidationRule, objectMetadataId },
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      })
    : undefined;
  const nextExpression = expression ?? existingExpression ?? '';

  if (
    isDefined(existingFlatValidationRule) &&
    nextExpression === existingExpression &&
    (!isActive || existingFlatValidationRule.isActive)
  ) {
    return existingFlatValidationRule.tree;
  }

  if (!isActive && !isNonEmptyString(nextExpression.trim())) {
    return null;
  }

  return compileValidationRuleTreeOrThrow({
    expression: nextExpression,
    isActive,
    objectMetadataId,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });
};
