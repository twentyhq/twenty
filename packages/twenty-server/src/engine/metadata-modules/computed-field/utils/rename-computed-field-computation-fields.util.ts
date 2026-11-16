import { type FieldMetadataComputation } from 'twenty-shared/types';
import {
  getComputedFieldExpressionFieldPaths,
  isDefined,
  renameValidationRuleExpressionFields,
} from 'twenty-shared/utils';

import { ComputedFieldExpressionException } from 'src/engine/metadata-modules/computed-field/exceptions/computed-field.exception';
import {
  type ComputedFieldSchemaField,
  type ComputedFieldSchemaReader,
} from 'src/engine/metadata-modules/computed-field/types/computed-field-schema-reader.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { resolveComputedFieldPathOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-path-or-throw.util';
import { resolveComputedFieldSourceRelationOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-source-relation-or-throw.util';

type RenamableField = ComputedFieldSchemaField & {
  universalIdentifier: string;
};

// `projectId` reads the relation `project`: it follows the relation when it is renamed
const getJoinColumnBinding = (relationFieldUniversalIdentifier: string) =>
  `${relationFieldUniversalIdentifier}:joinColumn`;

const ignoreUnresolvable = <TResult>(
  resolve: () => TResult,
): TResult | undefined => {
  try {
    return resolve();
  } catch (error) {
    if (error instanceof ComputedFieldExpressionException) {
      return undefined;
    }

    throw error;
  }
};

// `schemaReader` reads the fields as they were before the rename; what cannot be resolved is left as written
export const renameComputedFieldComputationFields = <
  TObject,
  TField extends RenamableField,
>({
  computation,
  object,
  schemaReader,
  fieldNameByUniversalIdentifier,
}: {
  computation: FieldMetadataComputation;
  object: TObject;
  schemaReader: ComputedFieldSchemaReader<TObject, TField>;
  fieldNameByUniversalIdentifier: Map<string, string>;
}): FieldMetadataComputation => {
  const nameByBinding = new Map(
    [...fieldNameByUniversalIdentifier].flatMap(
      ([universalIdentifier, name]) => [
        [universalIdentifier, name],
        [
          getJoinColumnBinding(universalIdentifier),
          computeMorphOrRelationFieldJoinColumnName({ name }),
        ],
      ],
    ),
  );

  const renameExpression = (
    expression: string | undefined,
    evaluatedObject: TObject,
  ): string | undefined => {
    const paths = isDefined(expression)
      ? ignoreUnresolvable(() =>
          getComputedFieldExpressionFieldPaths(expression),
        )
      : undefined;

    if (!isDefined(expression) || !isDefined(paths)) {
      return expression;
    }

    const bindings = Object.fromEntries(
      paths.flatMap((path) => {
        const resolution = ignoreUnresolvable(() =>
          resolveComputedFieldPathOrThrow({
            path,
            object: evaluatedObject,
            schemaReader,
          }),
        );

        if (!isDefined(resolution)) {
          return [];
        }

        return [
          ...resolution.toOneRelationHops.map(
            ({ relationField }) => relationField,
          ),
          resolution.field,
        ].map((field, index) => [
          path.slice(0, index + 1).join('.'),
          field.name === path[index]
            ? field.universalIdentifier
            : getJoinColumnBinding(field.universalIdentifier),
        ]);
      }),
    );

    return renameValidationRuleExpressionFields({
      expression,
      bindings,
      fieldNameByUniversalIdentifier: nameByBinding,
    });
  };

  if (computation.kind === 'FORMULA') {
    return {
      ...computation,
      expression:
        renameExpression(computation.expression, object) ??
        computation.expression,
    };
  }

  const sourceRelation = ignoreUnresolvable(() =>
    resolveComputedFieldSourceRelationOrThrow({
      relationFieldName: computation.relationFieldName,
      object,
      schemaReader,
    }),
  );

  if (!isDefined(sourceRelation)) {
    return computation;
  }

  const filter = renameExpression(
    computation.filter,
    sourceRelation.relatedObject,
  );
  const relationFieldName =
    fieldNameByUniversalIdentifier.get(
      sourceRelation.relationField.universalIdentifier,
    ) ?? computation.relationFieldName;

  if (computation.kind === 'FILTERED_RELATION') {
    const orderBy = computation.orderBy?.map((sort) =>
      Object.fromEntries(
        Object.entries(sort).map(([sortedPath, direction]) => [
          renameExpression(sortedPath, sourceRelation.relatedObject) ??
            sortedPath,
          direction,
        ]),
      ),
    );

    return {
      ...computation,
      relationFieldName,
      ...(isDefined(filter) ? { filter } : {}),
      ...(isDefined(orderBy) ? { orderBy } : {}),
    };
  }

  const expression = renameExpression(
    computation.expression,
    sourceRelation.relatedObject,
  );

  return {
    ...computation,
    relationFieldName,
    ...(isDefined(expression) ? { expression } : {}),
    ...(isDefined(filter) ? { filter } : {}),
  };
};
