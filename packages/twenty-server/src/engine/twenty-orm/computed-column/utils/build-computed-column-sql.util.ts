import { type FieldMetadataRollupComputation } from 'twenty-shared/types';
import {
  assertUnreachable,
  isComputedField,
  isDefined,
} from 'twenty-shared/utils';

import { ROLLUP_SQL_FUNCTION_BY_OPERATION } from 'src/engine/metadata-modules/computed-field/constants/rollup-sql-function-by-operation.constant';
import { buildOrmComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/utils/build-orm-computed-field-schema-reader.util';
import { resolveComputedFieldSourceRelationOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-source-relation-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type ComputedColumnSqlContext } from 'src/engine/twenty-orm/computed-column/types/computed-column-sql-context.type';
import { type ComputedColumnSql } from 'src/engine/twenty-orm/computed-column/types/computed-column-sql.type';
import { type ReadableSql } from 'src/engine/twenty-orm/computed-column/types/readable-sql.type';
import { buildComputedFieldExpressionSql } from 'src/engine/twenty-orm/computed-column/utils/build-computed-field-expression-sql.util';
import { canReadField } from 'src/engine/twenty-orm/computed-column/utils/can-read-field.util';
import { canReadObject } from 'src/engine/twenty-orm/computed-column/utils/can-read-object.util';
import { embedSubquery } from 'src/engine/twenty-orm/computed-column/utils/embed-subquery.util';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { quoteColumn } from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { fieldMetadataTypeToColumnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/field-metadata-type-to-column-type.util';
import { buildPostgresSafeAlias } from 'src/engine/workspace-query-executor/utils/build-postgres-safe-alias.util';

const buildRollupSql = async ({
  flatFieldMetadata,
  computation,
  alias,
  repository,
  context,
}: {
  flatFieldMetadata: OrmFlatFieldMetadata;
  computation: FieldMetadataRollupComputation;
  alias: string;
  repository: WorkspaceRepository;
  context: ComputedColumnSqlContext;
}): Promise<ReadableSql<ComputedColumnSql>> => {
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

  const relatedAlias = buildPostgresSafeAlias(
    `${alias}_${flatFieldMetadata.name}`,
  );
  const buildRelatedExpressionSql = async (expression: string | undefined) => {
    if (!isDefined(expression)) {
      return { isReadable: true, sql: undefined };
    }

    const expressionSql = await buildComputedFieldExpressionSql({
      expression,
      alias: relatedAlias,
      repository: relatedRepository,
      context,
    });

    return { isReadable: isDefined(expressionSql), sql: expressionSql?.sql };
  };

  const aggregated = await buildRelatedExpressionSql(computation.expression);
  const filter = await buildRelatedExpressionSql(computation.filter);

  if (!aggregated.isReadable || !filter.isReadable) {
    return undefined;
  }

  const queryBuilder = relatedRepository
    .createQueryBuilder(relatedAlias, { computedColumnSqlContext: context })
    .select(
      isDefined(aggregated.sql)
        ? `${ROLLUP_SQL_FUNCTION_BY_OPERATION[computation.operation]}(${aggregated.sql})`
        : 'COUNT(*)',
      'value',
    )
    .where(
      `${quoteColumn(relatedAlias, relatedRecordJoinColumnName)} = ${quoteColumn(alias, 'id')}`,
    );

  if (isDefined(filter.sql)) {
    queryBuilder.andWhere(`(${filter.sql})`);
  }

  // The related records' computed columns are resolved by the subquery itself
  return {
    sql: await embedSubquery(queryBuilder),
    readComputedColumnNames: [],
  };
};

export const buildComputedColumnSql = async ({
  flatFieldMetadata,
  alias,
  repository,
  context,
}: {
  flatFieldMetadata: OrmFlatFieldMetadata;
  alias: string;
  repository: WorkspaceRepository;
  context: ComputedColumnSqlContext;
}): Promise<ComputedColumnSql> => {
  const columnType = fieldMetadataTypeToColumnType(flatFieldMetadata.type);
  const nullSql = { sql: `NULL::${columnType}`, readComputedColumnNames: [] };

  if (!isComputedField(flatFieldMetadata)) {
    return nullSql;
  }

  const { computation } = flatFieldMetadata;

  const buildValueSql = (): Promise<ReadableSql<ComputedColumnSql>> => {
    switch (computation.kind) {
      case 'FORMULA':
        return buildComputedFieldExpressionSql({
          expression: computation.expression,
          alias,
          repository,
          context,
        });
      case 'ROLLUP':
        return buildRollupSql({
          flatFieldMetadata,
          computation,
          alias,
          repository,
          context,
        });
      default:
        return assertUnreachable(computation);
    }
  };

  const valueSql = await buildValueSql();

  if (!isDefined(valueSql)) {
    return nullSql;
  }

  return { ...valueSql, sql: `(${valueSql.sql})::${columnType}` };
};
