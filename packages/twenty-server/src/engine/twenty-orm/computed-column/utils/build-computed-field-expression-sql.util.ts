import { FieldMetadataType } from 'twenty-shared/types';
import {
  getComputedFieldExpressionFieldPaths,
  isDefined,
} from 'twenty-shared/utils';

import { ComputedFieldExpressionException } from 'src/engine/metadata-modules/computed-field/exceptions/computed-field.exception';
import { type CompiledComputedFieldExpression } from 'src/engine/metadata-modules/computed-field/types/compiled-computed-field-expression.type';
import { type SqlWithParameters } from 'src/engine/metadata-modules/computed-field/types/sql-with-parameters.type';
import { buildOrmComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/utils/build-orm-computed-field-schema-reader.util';
import { compileComputedFieldExpressionToSql } from 'src/engine/metadata-modules/computed-field/utils/compile-computed-field-expression-to-sql.util';
import { getComputedFieldValueTypeOrThrow } from 'src/engine/metadata-modules/computed-field/utils/get-computed-field-value-type-or-throw.util';
import { resolveComputedFieldPathOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-path-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type ReadableSql } from 'src/engine/twenty-orm/computed-column/types/readable-sql.type';
import { canReadField } from 'src/engine/twenty-orm/computed-column/utils/can-read-field.util';
import { canReadObject } from 'src/engine/twenty-orm/computed-column/utils/can-read-object.util';
import { embedSubquery } from 'src/engine/twenty-orm/computed-column/utils/embed-subquery.util';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import {
  quoteColumn,
  renderNullifiedColumn,
} from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { buildPostgresSafeAlias } from 'src/engine/workspace-query-executor/utils/build-postgres-safe-alias.util';

// A field that a row-level permission rule hides on a record reads as empty on that record
const buildReadableColumnSql = async ({
  repository,
  alias,
  flatFieldMetadata,
  columnName,
}: {
  repository: WorkspaceRepository;
  alias: string;
  flatFieldMetadata: OrmFlatFieldMetadata;
  columnName: string;
}): Promise<SqlWithParameters> => {
  const quotedColumn = quoteColumn(alias, columnName);
  const hidingConditions = (
    await repository.buildUnreadableFieldsSQLConditions({
      objectMetadataId: repository.flatObjectMetadata.id,
      tableAlias: alias,
    })
  )
    .filter(({ fieldMetadataIds }) =>
      fieldMetadataIds.includes(flatFieldMetadata.id),
    )
    .map(({ sqlCondition }) => sqlCondition);

  if (hidingConditions.length === 0) {
    return { sql: quotedColumn, parameters: {} };
  }

  return {
    sql: renderNullifiedColumn(
      quotedColumn,
      hidingConditions.map(({ sql }) => sql),
    ),
    parameters: Object.assign(
      {},
      ...hidingConditions.map(({ parameters }) => parameters),
    ),
  };
};

const buildFieldPathSql = async ({
  path,
  alias,
  repository,
}: {
  path: string[];
  alias: string;
  repository: WorkspaceRepository;
}): Promise<ReadableSql<CompiledComputedFieldExpression>> => {
  const { toOneRelationHops, field, columnName, columnType } =
    resolveComputedFieldPathOrThrow({
      path,
      object: repository.flatObjectMetadata,
      schemaReader: buildOrmComputedFieldSchemaReader(
        repository.internalContext,
      ),
    });

  const type = getComputedFieldValueTypeOrThrow({
    columnType,
    readablePath: path.join('.'),
  });
  const [toOneRelationHop] = toOneRelationHops;

  if (!isDefined(toOneRelationHop)) {
    if (!canReadField({ repository, flatFieldMetadata: field })) {
      return undefined;
    }

    const column = await buildReadableColumnSql({
      repository,
      alias,
      flatFieldMetadata: field,
      columnName,
    });

    return {
      ...column,
      // An enum or uuid column only compares to values of its own type
      sql:
        type === FieldMetadataType.TEXT && columnType !== FieldMetadataType.TEXT
          ? `(${column.sql})::text`
          : column.sql,
      type,
    };
  }

  const targetRepository = repository.getRepositoryForObjectMetadataId(
    toOneRelationHop.targetObject.id,
  );

  if (
    !canReadField({
      repository,
      flatFieldMetadata: toOneRelationHop.relationField,
    }) ||
    !(await canReadObject(targetRepository))
  ) {
    return undefined;
  }

  const targetAlias = buildPostgresSafeAlias(
    `${alias}_${toOneRelationHop.joinColumnName}`,
  );
  const targetFieldSql = await buildFieldPathSql({
    path: path.slice(1),
    alias: targetAlias,
    repository: targetRepository,
  });

  if (!isDefined(targetFieldSql)) {
    return undefined;
  }

  const joinColumn = await buildReadableColumnSql({
    repository,
    alias,
    flatFieldMetadata: toOneRelationHop.relationField,
    columnName: toOneRelationHop.joinColumnName,
  });

  return {
    ...(await embedSubquery(
      targetRepository
        .createQueryBuilder(targetAlias)
        .select(targetFieldSql.sql, 'value')
        .where(`${quoteColumn(targetAlias, 'id')} = ${joinColumn.sql}`)
        .setParameters({
          ...targetFieldSql.parameters,
          ...joinColumn.parameters,
        }),
    )),
    type,
  };
};

export const buildComputedFieldExpressionSql = async ({
  expression,
  alias,
  repository,
}: {
  expression: string;
  alias: string;
  repository: WorkspaceRepository;
}): Promise<ReadableSql<CompiledComputedFieldExpression>> => {
  const fieldSqlByPath = new Map<string, CompiledComputedFieldExpression>();

  for (const path of getComputedFieldExpressionFieldPaths(expression)) {
    const fieldPathSql = await buildFieldPathSql({ path, alias, repository });

    if (!isDefined(fieldPathSql)) {
      return undefined;
    }

    fieldSqlByPath.set(path.join('.'), fieldPathSql);
  }

  const compiledExpression = compileComputedFieldExpressionToSql({
    expression,
    resolveField: (path) => {
      const fieldSql = fieldSqlByPath.get(path.join('.'));

      if (!isDefined(fieldSql)) {
        throw new ComputedFieldExpressionException(
          `"${path.join('.')}" cannot be read`,
        );
      }

      return fieldSql;
    },
  });

  return {
    ...compiledExpression,
    parameters: Object.assign(
      {},
      ...[...fieldSqlByPath.values()].map(({ parameters }) => parameters),
      compiledExpression.parameters,
    ),
  };
};
