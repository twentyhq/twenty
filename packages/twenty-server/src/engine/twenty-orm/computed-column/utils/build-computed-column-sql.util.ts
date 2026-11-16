import { type FieldMetadataRollupComputation } from 'twenty-shared/types';
import {
  assertUnreachable,
  isComputedField,
  isDefined,
} from 'twenty-shared/utils';

import { ROLLUP_SQL_FUNCTION_BY_OPERATION } from 'src/engine/metadata-modules/computed-field/constants/rollup-sql-function-by-operation.constant';
import { type SqlWithParameters } from 'src/engine/metadata-modules/computed-field/types/sql-with-parameters.type';
import { buildOrmComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/utils/build-orm-computed-field-schema-reader.util';
import { resolveComputedFieldSourceRelationOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-source-relation-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type ReadableSql } from 'src/engine/twenty-orm/computed-column/types/readable-sql.type';
import { buildComputedFieldExpressionSql } from 'src/engine/twenty-orm/computed-column/utils/build-computed-field-expression-sql.util';
import { canReadField } from 'src/engine/twenty-orm/computed-column/utils/can-read-field.util';
import { canReadObject } from 'src/engine/twenty-orm/computed-column/utils/can-read-object.util';
import { embedSubquery } from 'src/engine/twenty-orm/computed-column/utils/embed-subquery.util';
import { namespaceSqlParameters } from 'src/engine/twenty-orm/computed-column/utils/namespace-sql-parameters.util';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { quoteColumn } from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { fieldMetadataTypeToColumnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/field-metadata-type-to-column-type.util';
import { buildPostgresSafeAlias } from 'src/engine/workspace-query-executor/utils/build-postgres-safe-alias.util';

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
