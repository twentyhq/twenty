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

  // Expressions on related records are written from the related object, the bindings from the field's own object
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

  const relationFieldName = renamePath(computation.relationFieldName);
  const filter = renameRelatedObjectExpression(computation.filter);

  if (computation.kind === 'FILTERED_RELATION') {
    const orderBy = computation.orderBy?.map((sort) =>
      Object.fromEntries(
        Object.entries(sort).map(([sortedFieldName, direction]) => [
          renamePath(`${relationPathPrefix}${sortedFieldName}`).slice(
            relationFieldName.length + 1,
          ),
          direction,
        ]),
      ),
    );

    return {
      ...computation,
      relationFieldName,
      ...(isDefined(filter) ? { filter } : {}),
      ...(isDefined(orderBy) ? { orderBy } : {}),
      bindings: renamedBindings,
    };
  }

  const expression = renameRelatedObjectExpression(computation.expression);

  return {
    ...computation,
    relationFieldName,
    ...(isDefined(expression) ? { expression } : {}),
    ...(isDefined(filter) ? { filter } : {}),
    bindings: renamedBindings,
  };
};
