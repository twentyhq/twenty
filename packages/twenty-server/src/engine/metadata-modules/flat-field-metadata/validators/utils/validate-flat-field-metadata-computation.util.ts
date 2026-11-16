import { msg } from '@lingui/core/macro';
import {
  FIELD_METADATA_ROLLUP_OPERATIONS,
  type FieldMetadataComputation,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';
import {
  getComputedFieldExpressionFieldPaths,
  isComputedField,
  isDefined,
} from 'twenty-shared/utils';

import { COMPUTED_FIELD_SCALAR_TYPES } from 'src/engine/metadata-modules/computed-field/constants/computed-field-scalar-types.constant';
import { ComputedFieldExpressionException } from 'src/engine/metadata-modules/computed-field/exceptions/computed-field.exception';
import { type ComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/types/computed-field-schema-reader.type';
import { buildUniversalComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/utils/build-universal-computed-field-schema-reader.util';
import { compileComputedFieldExpressionToSql } from 'src/engine/metadata-modules/computed-field/utils/compile-computed-field-expression-to-sql.util';
import { getComputedFieldExpressionScopes } from 'src/engine/metadata-modules/computed-field/utils/get-computed-field-expression-scopes.util';
import { resolveComputedFieldPath } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-path.util';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type UniversalSchemaReader = ComputedFieldSchemaReader<
  UniversalFlatObjectMetadata,
  UniversalFlatFieldMetadata
>;

const COMPUTATION_KINDS: FieldMetadataComputation['kind'][] = [
  'FORMULA',
  'ROLLUP',
];

const findRelatedObject = ({
  computation,
  object,
  schemaReader,
}: {
  computation: Exclude<FieldMetadataComputation, { kind: 'FORMULA' }>;
  object: UniversalFlatObjectMetadata;
  schemaReader: UniversalSchemaReader;
}): UniversalFlatObjectMetadata => {
  const relationField = schemaReader.findFieldByName(
    object,
    computation.relationFieldName,
  );

  const relatedObject =
    isDefined(relationField) &&
    relationField.type === FieldMetadataType.RELATION &&
    schemaReader.getRelationType(relationField) === RelationType.ONE_TO_MANY &&
    !isComputedField(relationField)
      ? schemaReader.findRelationTargetObject(relationField)
      : undefined;

  if (!isDefined(relatedObject)) {
    throw new ComputedFieldExpressionException(
      `"${computation.relationFieldName}" must be a stored one-to-many relation of ${object.nameSingular}`,
    );
  }

  return relatedObject;
};

// Compiles every expression, then follows the computed fields it reads to refuse a field that reads itself
const assertComputationCanBeEvaluated = ({
  field,
  schemaReader,
  flatObjectMetadataMaps,
  readingFieldUniversalIdentifiers,
}: {
  field: UniversalFlatFieldMetadata;
  schemaReader: UniversalSchemaReader;
  flatObjectMetadataMaps: UniversalFlatEntityMaps<UniversalFlatObjectMetadata>;
  readingFieldUniversalIdentifiers: string[];
}): void => {
  const { computation } = field;
  const object = findFlatEntityByUniversalIdentifier({
    universalIdentifier: field.objectMetadataUniversalIdentifier,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(computation) || !isDefined(object)) {
    return;
  }

  if (readingFieldUniversalIdentifiers.includes(field.universalIdentifier)) {
    throw new ComputedFieldExpressionException(
      `"${field.name}" ends up reading itself`,
    );
  }

  const relatedObject =
    computation.kind === 'FORMULA'
      ? undefined
      : findRelatedObject({ computation, object, schemaReader });

  for (const {
    expression,
    isEvaluatedOnRelatedRecord,
  } of getComputedFieldExpressionScopes(computation)) {
    const evaluatedObject = isEvaluatedOnRelatedRecord ? relatedObject : object;

    if (!isDefined(evaluatedObject)) {
      continue;
    }

    compileComputedFieldExpressionToSql({
      expression,
      resolveFieldPathSql: (path) =>
        resolveComputedFieldPath({
          path,
          object: evaluatedObject,
          schemaReader,
        }).columnName,
    });

    for (const path of getComputedFieldExpressionFieldPaths(expression)) {
      assertComputationCanBeEvaluated({
        field: resolveComputedFieldPath({
          path,
          object: evaluatedObject,
          schemaReader,
        }).field,
        schemaReader,
        flatObjectMetadataMaps,
        readingFieldUniversalIdentifiers: [
          ...readingFieldUniversalIdentifiers,
          field.universalIdentifier,
        ],
      });
    }
  }
};

export const getComputedFieldEvaluationError = ({
  flatFieldMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMapsList,
}: {
  flatFieldMetadata: UniversalFlatFieldMetadata;
  flatObjectMetadataMaps: UniversalFlatEntityMaps<UniversalFlatObjectMetadata>;
  flatFieldMetadataMapsList: UniversalFlatEntityMaps<UniversalFlatFieldMetadata>[];
}): string | undefined => {
  try {
    assertComputationCanBeEvaluated({
      field: flatFieldMetadata,
      schemaReader: buildUniversalComputedFieldSchemaReader({
        flatObjectMetadataMaps,
        flatFieldMetadataMapsList,
      }),
      flatObjectMetadataMaps,
      readingFieldUniversalIdentifiers: [],
    });
  } catch (error) {
    if (error instanceof ComputedFieldExpressionException) {
      return error.message;
    }

    throw error;
  }

  return undefined;
};

const getComputationShapeError = (
  field: UniversalFlatFieldMetadata,
  computation: FieldMetadataComputation,
): string | undefined => {
  if (!COMPUTATION_KINDS.includes(computation.kind)) {
    return `Unknown computation kind "${String(computation.kind)}"`;
  }

  if (
    field.isUnique === true ||
    field.isSearchable === true ||
    isDefined(field.defaultValue)
  ) {
    return 'A computed field stores nothing: it cannot be unique, searchable or have a default value';
  }

  if (
    !(COMPUTED_FIELD_SCALAR_TYPES as FieldMetadataType[]).includes(field.type)
  ) {
    return `A ${computation.kind.toLowerCase()} field must be of type ${COMPUTED_FIELD_SCALAR_TYPES.join(', ')}`;
  }

  if (computation.kind !== 'ROLLUP') {
    return undefined;
  }

  if (!FIELD_METADATA_ROLLUP_OPERATIONS.includes(computation.operation)) {
    return `Unknown rollup operation "${String(computation.operation)}"`;
  }

  if (computation.operation === 'COUNT') {
    return isDefined(computation.expression)
      ? 'COUNT counts the related records and takes no expression; use the filter to count some of them'
      : undefined;
  }

  return isDefined(computation.expression)
    ? undefined
    : `${computation.operation} needs the expression to aggregate`;
};

export const validateFlatFieldMetadataComputation = ({
  flatFieldMetadataToValidate,
  flatObjectMetadataMaps,
  flatFieldMetadataMapsList,
}: {
  flatFieldMetadataToValidate: UniversalFlatFieldMetadata;
  flatObjectMetadataMaps: UniversalFlatEntityMaps<UniversalFlatObjectMetadata>;
  flatFieldMetadataMapsList: UniversalFlatEntityMaps<UniversalFlatFieldMetadata>[];
}): FlatFieldMetadataValidationError[] => {
  const { computation } = flatFieldMetadataToValidate;

  if (!isDefined(computation)) {
    return [];
  }

  const buildError = (message: string): FlatFieldMetadataValidationError[] => [
    {
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `Invalid computation for field "${flatFieldMetadataToValidate.name}": ${message}`,
      userFriendlyMessage: msg`The computation of this field is invalid`,
      value: computation,
    },
  ];

  const shapeError = getComputationShapeError(
    flatFieldMetadataToValidate,
    computation,
  );

  if (isDefined(shapeError)) {
    return buildError(shapeError);
  }

  const evaluationError = getComputedFieldEvaluationError({
    flatFieldMetadata: flatFieldMetadataToValidate,
    flatObjectMetadataMaps,
    flatFieldMetadataMapsList,
  });

  return isDefined(evaluationError) ? buildError(evaluationError) : [];
};
