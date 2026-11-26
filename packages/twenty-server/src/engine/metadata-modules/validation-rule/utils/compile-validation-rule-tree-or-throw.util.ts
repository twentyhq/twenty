/* @license Enterprise */

import { type ExpressionNode } from 'twenty-shared/expression';
import {
  compileValidationRuleExpression,
  parseExpressionNode,
  resolveExpressionFieldReferences,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildValidationRuleFieldDescriptors } from 'src/engine/metadata-modules/validation-rule/utils/build-validation-rule-field-descriptors.util';
import {
  ValidationRuleException,
  ValidationRuleExceptionCode,
} from 'src/engine/metadata-modules/validation-rule/validation-rule.exception';

const throwInvalidExpression = (errorMessage: string): never => {
  throw new ValidationRuleException(
    errorMessage,
    ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_EXPRESSION,
  );
};

// An inactive rule only has to parse: it is compiled when activated
export const compileValidationRuleTreeOrThrow = ({
  expression,
  isActive,
  objectMetadataId,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  expression: string;
  isActive: boolean;
  objectMetadataId: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): ExpressionNode => {
  const fields = buildValidationRuleFieldDescriptors({
    objectMetadataId,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

  if (isActive) {
    const compilation = compileValidationRuleExpression({ expression, fields });

    if (!compilation.isValid) {
      throwInvalidExpression(compilation.errorMessage);
    }
  }

  const parsing = parseExpressionNode(expression);

  if (!parsing.isValid) {
    return throwInvalidExpression(parsing.errorMessage);
  }

  return resolveExpressionFieldReferences({ node: parsing.node, fields });
};
