import {
  FieldMetadataType,
  type FieldMetadataRollupComputation,
} from 'twenty-shared/types';
import {
  assertUnreachable,
  getComputedFieldExpressionFieldPaths,
  isComputedField,
  isDefined,
} from 'twenty-shared/utils';

import { ROLLUP_SQL_FUNCTION_BY_OPERATION } from 'src/engine/metadata-modules/computed-field/constants/rollup-sql-function-by-operation.constant';
import { ComputedFieldExpressionException } from 'src/engine/metadata-modules/computed-field/exceptions/computed-field.exception';
import { type SqlWithParameters } from 'src/engine/metadata-modules/computed-field/types/sql-with-parameters.type';
import { buildOrmComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/utils/build-orm-computed-field-schema-reader.util';
import {
  type CompiledComputedFieldExpression,
  compileComputedFieldExpressionToSql,
} from 'src/engine/metadata-modules/computed-field/utils/compile-computed-field-expression-to-sql.util';
import { getComputedFieldValueType } from 'src/engine/metadata-modules/computed-field/utils/get-computed-field-value-type.util';
import { resolveComputedFieldPathOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-path-or-throw.util';
import { resolveComputedFieldSourceRelationOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-source-relation-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { namespaceSqlParameters } from 'src/engine/twenty-orm/computed-column/utils/namespace-sql-parameters.util';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import {
  quoteColumn,
  renderNullifiedColumn,
} from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { buildPostgresSafeAlias } from 'src/engine/workspace-query-executor/utils/build-postgres-safe-alias.util';
import { fieldMetadataTypeToColumnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/field-metadata-type-to-column-type.util';

// `undefined`: the value reads something its reader cannot read, so the computed column is null
type ReadableSql<TSql extends SqlWithParameters> = TSql | undefined;

const canReadField = ({
  repository,
  flatFieldMetadata,
}: {
  repository: WorkspaceRepository;
  flatFieldMetadata: OrmFlatFieldMetadata;
}): boolean =>
  !repository.recordReadRestrictions.unreadableFieldMetadataIds.has(
    flatFieldMetadata.id,
  );

const canReadObject = async (
  repository: WorkspaceRepository,
): Promise<boolean> =>
  !repository.recordReadRestrictions.unreadableObjectMetadataIds.has(
    repository.flatObjectMetadata.id,
  ) && !(await repository.isReadDisabled());

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

// Row-level permissions of the subquery's object are applied before it is embedded:
// a computed value only ever reflects records its reader could query directly
const embedSubquery = async (
  queryBuilder: WorkspaceSelectQueryBuilder,
): Promise<SqlWithParameters> => {
  await queryBuilder.applyRowLevelPermissions();

  return namespaceSqlParameters({
    sql: `(${queryBuilder.getQuery()})`,
    parameters: queryBuilder.getParameters(),
    namespace: queryBuilder.alias,
  });
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

  const type = getComputedFieldValueType({
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

const buildRollupSql = async ({
  flatFieldMetadata,
  computation,
  alias,
  repository,
}: {
  flatFieldMetadata: OrmFlatFieldMetadata;
  computation: FieldMetadataRollupComputation;
  alias: string;
  repository: WorkspaceRepository;
}): Promise<ReadableSql<SqlWithParameters>> => {
  const { relationField, relatedObject, relatedRecordJoinColumnName } =
    resolveComputedFieldSourceRelationOrThrow({
      relationFieldName: computation.relationFieldName,
      object: repository.flatObjectMetadata,
      schemaReader: buildOrmComputedFieldSchemaReader(
        repository.internalContext,
      ),
    });

  const relatedRepository = repository.getRepositoryForObjectMetadataId(
    relatedObject.id,
  );

  if (
    !canReadField({ repository, flatFieldMetadata: relationField }) ||
    !(await canReadObject(relatedRepository))
  ) {
    return undefined;
  }

  // Both expressions get their own alias suffix so their text parameters cannot share a name
  const relatedAlias = buildPostgresSafeAlias(
    `${alias}_${flatFieldMetadata.name}`,
  );
  const buildRelatedExpressionSql = async (
    expression: string | undefined,
    namespace: string,
  ) => {
    if (!isDefined(expression)) {
      return { isReadable: true, sql: undefined };
    }

    const expressionSql = await buildComputedFieldExpressionSql({
      expression,
      alias: relatedAlias,
      repository: relatedRepository,
    });

    return {
      isReadable: isDefined(expressionSql),
      sql: isDefined(expressionSql)
        ? namespaceSqlParameters({ ...expressionSql, namespace })
        : undefined,
    };
  };

  const aggregated = await buildRelatedExpressionSql(
    computation.expression,
    'aggregated',
  );
  const filter = await buildRelatedExpressionSql(computation.filter, 'filter');

  if (!aggregated.isReadable || !filter.isReadable) {
    return undefined;
  }

  const queryBuilder = relatedRepository
    .createQueryBuilder(relatedAlias)
    .select(
      isDefined(aggregated.sql)
        ? `${ROLLUP_SQL_FUNCTION_BY_OPERATION[computation.operation]}(${aggregated.sql.sql})`
        : 'COUNT(*)',
      'value',
    )
    .where(
      `${quoteColumn(relatedAlias, relatedRecordJoinColumnName)} = ${quoteColumn(alias, 'id')}`,
    )
    .setParameters({
      ...aggregated.sql?.parameters,
      ...filter.sql?.parameters,
    });

  if (isDefined(filter.sql)) {
    queryBuilder.andWhere(`(${filter.sql.sql})`);
  }

  return embedSubquery(queryBuilder);
};

export const buildComputedColumnSql = async ({
  flatFieldMetadata,
  alias,
  repository,
}: {
  flatFieldMetadata: OrmFlatFieldMetadata;
  alias: string;
  repository: WorkspaceRepository;
}): Promise<SqlWithParameters> => {
  const columnType = fieldMetadataTypeToColumnType(flatFieldMetadata.type);

  if (!isComputedField(flatFieldMetadata)) {
    return { sql: `NULL::${columnType}`, parameters: {} };
  }

  const { computation } = flatFieldMetadata;

  const buildValueSql = (): Promise<ReadableSql<SqlWithParameters>> => {
    switch (computation.kind) {
      case 'FORMULA':
        return buildComputedFieldExpressionSql({
          expression: computation.expression,
          alias,
          repository,
        });
      case 'ROLLUP':
        return buildRollupSql({
          flatFieldMetadata,
          computation,
          alias,
          repository,
        });
      // A relation has no column: it is loaded through the relation it derives from
      case 'FILTERED_RELATION':
        return Promise.resolve(undefined);
      default:
        return assertUnreachable(computation);
    }
  };

  const valueSql = await buildValueSql();

  if (!isDefined(valueSql)) {
    return { sql: `NULL::${columnType}`, parameters: {} };
  }

  const { sql, parameters } = namespaceSqlParameters({
    ...valueSql,
    namespace: `${alias}_${flatFieldMetadata.name}`,
  });

  return {
    sql: `(${sql})::${columnType}`,
    parameters,
  };
};
