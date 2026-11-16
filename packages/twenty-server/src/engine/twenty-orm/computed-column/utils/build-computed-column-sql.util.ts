import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import {
  assertUnreachable,
  getComputedFieldExpressionFieldPaths,
  isComputedField,
  isDefined,
} from 'twenty-shared/utils';

import { ComputedFieldExpressionException } from 'src/engine/metadata-modules/computed-field/exceptions/computed-field.exception';
import { compileComputedFieldExpressionToSql } from 'src/engine/metadata-modules/computed-field/utils/compile-computed-field-expression-to-sql.util';
import { buildOrmComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/utils/build-orm-computed-field-schema-reader.util';
import { resolveComputedFieldPath } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-path.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type SqlWithParameters } from 'src/engine/twenty-orm/computed-column/types/sql-with-parameters.type';
import { namespaceSqlParameters } from 'src/engine/twenty-orm/computed-column/utils/namespace-sql-parameters.util';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { quoteColumn } from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { fieldMetadataTypeToColumnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/field-metadata-type-to-column-type.util';

const NULL_SQL: SqlWithParameters = { sql: 'NULL', parameters: {} };

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
}): Promise<SqlWithParameters> => {
  const { toOneRelationHops, columnName, columnType } =
    resolveComputedFieldPath({
      path,
      object: repository.flatObjectMetadata,
      schemaReader: buildOrmComputedFieldSchemaReader(
        repository.internalContext,
      ),
    });

  const [toOneRelationHop] = toOneRelationHops;

  if (!isDefined(toOneRelationHop)) {
    const columnReference = quoteColumn(alias, columnName);

    return {
      // An enum column only compares to values of its own type
      sql:
        isEnumFieldMetadataType(columnType) &&
        columnType !== FieldMetadataType.MULTI_SELECT
          ? `${columnReference}::text`
          : columnReference,
      parameters: {},
    };
  }

  const targetRepository = repository.getRepositoryForObjectMetadataId(
    toOneRelationHop.targetObject.id,
  );

  if (await targetRepository.isReadDisabled()) {
    return NULL_SQL;
  }

  const targetAlias = `${alias}_${toOneRelationHop.joinColumnName}`;
  const targetFieldSql = await buildFieldPathSql({
    path: path.slice(1),
    alias: targetAlias,
    repository: targetRepository,
  });

  return embedSubquery(
    targetRepository
      .createQueryBuilder(targetAlias)
      .select(targetFieldSql.sql, 'value')
      .where(
        `${quoteColumn(targetAlias, 'id')} = ${quoteColumn(alias, toOneRelationHop.joinColumnName)}`,
      )
      .setParameters(targetFieldSql.parameters),
  );
};

export const buildComputedFieldExpressionSql = async ({
  expression,
  alias,
  repository,
}: {
  expression: string;
  alias: string;
  repository: WorkspaceRepository;
}): Promise<SqlWithParameters> => {
  const sqlByPath = new Map<string, string>();
  let parameters: Record<string, unknown> = {};

  for (const path of getComputedFieldExpressionFieldPaths(expression)) {
    const fieldPathSql = await buildFieldPathSql({ path, alias, repository });

    sqlByPath.set(path.join('.'), fieldPathSql.sql);
    parameters = { ...parameters, ...fieldPathSql.parameters };
  }

  return {
    sql: compileComputedFieldExpressionToSql({
      expression,
      resolveFieldPathSql: (path) => {
        const sql = sqlByPath.get(path.join('.'));

        if (!isDefined(sql)) {
          throw new ComputedFieldExpressionException(
            `"${path.join('.')}" cannot be read`,
          );
        }

        return sql;
      },
    }),
    parameters,
  };
};

const buildRollupSql = async ({
  flatFieldMetadata,
  alias,
  repository,
}: {
  flatFieldMetadata: OrmFlatFieldMetadata;
  alias: string;
  repository: WorkspaceRepository;
}): Promise<SqlWithParameters> => {
  const { computation } = flatFieldMetadata;

  if (computation?.kind !== 'ROLLUP') {
    return NULL_SQL;
  }

  const { flatFieldMetadataMaps } = repository.internalContext;
  const relationFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      repository.flatObjectMetadata,
    ).fieldIdByName[computation.relationFieldName],
    flatEntityMaps: flatFieldMetadataMaps,
  });

  const inverseFlatFieldMetadata =
    isDefined(relationFlatFieldMetadata) &&
    isMorphOrRelationFlatFieldMetadata(relationFlatFieldMetadata) &&
    relationFlatFieldMetadata.settings?.relationType ===
      RelationType.ONE_TO_MANY
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: relationFlatFieldMetadata.relationTargetFieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        })
      : undefined;

  if (!isDefined(inverseFlatFieldMetadata)) {
    return NULL_SQL;
  }

  const relatedRepository = repository.getRepositoryForObjectMetadataId(
    inverseFlatFieldMetadata.objectMetadataId,
  );

  if (await relatedRepository.isReadDisabled()) {
    return NULL_SQL;
  }

  const relatedAlias = `${alias}_${flatFieldMetadata.name}`;
  const buildRelatedExpressionSql = (expression: string | undefined) =>
    isDefined(expression)
      ? buildComputedFieldExpressionSql({
          expression,
          alias: relatedAlias,
          repository: relatedRepository,
        })
      : undefined;

  const aggregatedSql = await buildRelatedExpressionSql(computation.expression);
  const filterSql = await buildRelatedExpressionSql(computation.filter);

  const queryBuilder = relatedRepository
    .createQueryBuilder(relatedAlias)
    .select(
      isDefined(aggregatedSql)
        ? `${computation.operation}(${aggregatedSql.sql})`
        : 'COUNT(*)',
      'value',
    )
    .where(
      `${quoteColumn(
        relatedAlias,
        computeMorphOrRelationFieldJoinColumnName({
          name: inverseFlatFieldMetadata.name,
        }),
      )} = ${quoteColumn(alias, 'id')}`,
    )
    .setParameters({ ...aggregatedSql?.parameters, ...filterSql?.parameters });

  if (isDefined(filterSql)) {
    queryBuilder.andWhere(`(${filterSql.sql})`);
  }

  return embedSubquery(queryBuilder);
};

// The SQL of a computed column of `alias`, cast to the column type its field declares
export const buildComputedColumnSql = async ({
  flatFieldMetadata,
  alias,
  repository,
}: {
  flatFieldMetadata: OrmFlatFieldMetadata;
  alias: string;
  repository: WorkspaceRepository;
}): Promise<SqlWithParameters> => {
  if (!isComputedField(flatFieldMetadata)) {
    return NULL_SQL;
  }

  const { computation } = flatFieldMetadata;

  const buildValueSql = (): Promise<SqlWithParameters> => {
    switch (computation.kind) {
      case 'FORMULA':
        return buildComputedFieldExpressionSql({
          expression: computation.expression,
          alias,
          repository,
        });
      case 'ROLLUP':
        return buildRollupSql({ flatFieldMetadata, alias, repository });
      case 'FILTERED_RELATION':
        return Promise.resolve(NULL_SQL);
      default:
        return assertUnreachable(computation);
    }
  };

  const { sql, parameters } = await buildValueSql();

  return {
    sql: `(${sql})::${fieldMetadataTypeToColumnType(flatFieldMetadata.type)}`,
    parameters,
  };
};
