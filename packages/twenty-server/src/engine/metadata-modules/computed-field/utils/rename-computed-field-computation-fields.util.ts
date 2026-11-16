import {
  type FieldMetadataComputation,
  type FieldMetadataComputationBindings,
} from 'twenty-shared/types';
import {
  isDefined,
  renameValidationRuleExpressionFields,
  renameValidationRulePath,
} from 'twenty-shared/utils';

export const renameComputedFieldComputationFields = ({
  computation,
  fieldNameByUniversalIdentifier,
}: {
  computation: FieldMetadataComputation;
  fieldNameByUniversalIdentifier: Map<string, string>;
}): FieldMetadataComputation => {
  const { bindings } = computation;

  if (!isDefined(bindings)) {
    return computation;
  }

  const renamePath = (path: string): string =>
    renameValidationRulePath({
      path,
      bindings,
      fieldNameByUniversalIdentifier,
    });
  const renamedBindings: FieldMetadataComputationBindings = Object.fromEntries(
    Object.entries(bindings).map(([path, boundUniversalIdentifier]) => [
      renamePath(path),
      boundUniversalIdentifier,
    ]),
  );

  if (computation.kind === 'FORMULA') {
    return {
      ...computation,
      expression: renameValidationRuleExpressionFields({
        expression: computation.expression,
        bindings,
        fieldNameByUniversalIdentifier,
      }),
      bindings: renamedBindings,
    };
  }

  // A rollup's expressions are written from the related object, its bindings from the field's own object
  const relationPathPrefix = `${computation.relationFieldName}.`;
  const relatedObjectBindings: FieldMetadataComputationBindings =
    Object.fromEntries(
      Object.entries(bindings).flatMap(([path, boundUniversalIdentifier]) =>
        path.startsWith(relationPathPrefix)
          ? [[path.slice(relationPathPrefix.length), boundUniversalIdentifier]]
          : [],
      ),
    );
  const renameRelatedObjectExpression = (
    expression: string | undefined,
  ): string | undefined =>
    isDefined(expression)
      ? renameValidationRuleExpressionFields({
          expression,
          bindings: relatedObjectBindings,
          fieldNameByUniversalIdentifier,
        })
      : undefined;

  const expression = renameRelatedObjectExpression(computation.expression);
  const filter = renameRelatedObjectExpression(computation.filter);

  return {
    ...computation,
    relationFieldName: renamePath(computation.relationFieldName),
    ...(isDefined(expression) ? { expression } : {}),
    ...(isDefined(filter) ? { filter } : {}),
    bindings: renamedBindings,
  };
};
