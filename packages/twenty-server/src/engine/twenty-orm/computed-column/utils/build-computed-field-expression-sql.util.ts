import {
  type ComputedFieldValueType,
  FieldMetadataType,
} from 'twenty-shared/types';
import {
  ComputedFieldExpressionError,
  getComputedFieldExpressionFieldPaths,
  isComputedField,
  isDefined,
  parseComputedFieldExpressionOrThrow,
  typeCheckComputedFieldExpressionOrThrow,
} from 'twenty-shared/utils';

import { buildOrmComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/utils/build-orm-computed-field-schema-reader.util';
import { emitComputedFieldExpressionSql } from 'src/engine/metadata-modules/computed-field/utils/emit-computed-field-expression-sql.util';
import { getComputedFieldValueTypeOrThrow } from 'src/engine/metadata-modules/computed-field/utils/get-computed-field-value-type-or-throw.util';
import { resolveComputedFieldPathOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-path-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type ComputedColumnSqlContext } from 'src/engine/twenty-orm/computed-column/types/computed-column-sql-context.type';
import { type ComputedColumnSql } from 'src/engine/twenty-orm/computed-column/types/computed-column-sql.type';
import { type ReadableSql } from 'src/engine/twenty-orm/computed-column/types/readable-sql.type';
import { bindComputedColumnTextParameter } from 'src/engine/twenty-orm/computed-column/utils/bind-computed-column-text-parameter.util';
import { canReadField } from 'src/engine/twenty-orm/computed-column/utils/can-read-field.util';
import { canReadObject } from 'src/engine/twenty-orm/computed-column/utils/can-read-object.util';
import { embedSubquery } from 'src/engine/twenty-orm/computed-column/utils/embed-subquery.util';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import {
  quoteColumn,
  renderNullifiedColumn,
} from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { buildPostgresSafeAlias } from 'src/engine/workspace-query-executor/utils/build-postgres-safe-alias.util';

type FieldPathSql = ComputedColumnSql & {
  type: ComputedFieldValueType | undefined;
};

// A field that a row-level permission rule hides on a record reads as empty on that record
const buildReadableColumnSql = async ({
  repository,
  alias,
  flatFieldMetadata,
  columnName,
  context,
}: {
  repository: WorkspaceRepository;
  alias: string;
  flatFieldMetadata: OrmFlatFieldMetadata;
  columnName: string;
  context: ComputedColumnSqlContext;
}): Promise<string> => {
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
    return quotedColumn;
  }

  Object.assign(
    context.parameters,
    ...hidingConditions.map(({ parameters }) => parameters),
  );

  return renderNullifiedColumn(
    quotedColumn,
    hidingConditions.map(({ sql }) => sql),
  );
};

const buildFieldPathSql = async ({
  path,
  alias,
  repository,
  context,
}: {
  path: string[];
  alias: string;
  repository: WorkspaceRepository;
  context: ComputedColumnSqlContext;
}): Promise<ReadableSql<FieldPathSql>> => {
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

    const columnSql = await buildReadableColumnSql({
      repository,
      alias,
      flatFieldMetadata: field,
      columnName,
      context,
    });

    return {
      // An enum or uuid column only compares to values of its own type
      sql:
        type === FieldMetadataType.TEXT && columnType !== FieldMetadataType.TEXT
          ? `(${columnSql})::text`
          : columnSql,
      type,
      readComputedColumnNames: isComputedField(field) ? [columnName] : [],
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
    context,
  });

  if (!isDefined(targetFieldSql)) {
    return undefined;
  }

  const joinColumnSql = await buildReadableColumnSql({
    repository,
    alias,
    flatFieldMetadata: toOneRelationHop.relationField,
    columnName: toOneRelationHop.joinColumnName,
    context,
  });

  return {
    sql: await embedSubquery(
      targetRepository
        .createQueryBuilder(targetAlias, { computedColumnSqlContext: context })
        .select(targetFieldSql.sql, 'value')
        .where(`${quoteColumn(targetAlias, 'id')} = ${joinColumnSql}`),
    ),
    type,
    readComputedColumnNames: [],
  };
};

export const buildComputedFieldExpressionSql = async ({
  expression,
  alias,
  repository,
  context,
}: {
  expression: string;
  alias: string;
  repository: WorkspaceRepository;
  context: ComputedColumnSqlContext;
}): Promise<ReadableSql<ComputedColumnSql>> => {
  const fieldSqlByPath = new Map<string, FieldPathSql>();

  for (const path of getComputedFieldExpressionFieldPaths(expression)) {
    const fieldPathSql = await buildFieldPathSql({
      path,
      alias,
      repository,
      context,
    });

    if (!isDefined(fieldPathSql)) {
      return undefined;
    }

    fieldSqlByPath.set(path.join('.'), fieldPathSql);
  }

  const getFieldSqlOrThrow = (path: string[]): FieldPathSql => {
    const fieldSql = fieldSqlByPath.get(path.join('.'));

    if (!isDefined(fieldSql)) {
      throw new ComputedFieldExpressionError(
        `"${path.join('.')}" cannot be read`,
      );
    }

    return fieldSql;
  };

  return {
    sql: emitComputedFieldExpressionSql({
      expression: typeCheckComputedFieldExpressionOrThrow({
        expression: parseComputedFieldExpressionOrThrow(expression),
        getFieldType: (path) => getFieldSqlOrThrow(path).type,
      }),
      resolveFieldSql: (path) => getFieldSqlOrThrow(path).sql,
      bindTextParameter: (text) =>
        bindComputedColumnTextParameter({ context, text }),
    }),
    readComputedColumnNames: [...fieldSqlByPath.values()].flatMap(
      ({ readComputedColumnNames }) => readComputedColumnNames,
    ),
  };
};
