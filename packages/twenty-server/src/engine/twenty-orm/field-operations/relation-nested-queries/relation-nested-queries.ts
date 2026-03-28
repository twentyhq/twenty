import { randomUUID } from 'crypto';

import { isDefined } from 'class-validator';
import { RELATION_NESTED_QUERY_KEYWORDS } from 'twenty-shared/constants';
import {
  type EntityTarget,
  type ObjectLiteral,
  type SelectQueryBuilder,
} from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { type QueryDeepPartialEntityWithNestedRelationFields } from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-nested-relation-fields.type';
import { type RelationConnectQueryConfig } from 'src/engine/twenty-orm/entity-manager/types/relation-connect-query-config.type';
import {
  type RelationConnectQueryFieldsByEntityIndex,
  type RelationDisconnectQueryFieldsByEntityIndex,
} from 'src/engine/twenty-orm/entity-manager/types/relation-nested-query-fields-by-entity-index.type';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { formatConnectRecordNotFoundErrorMessage } from 'src/engine/twenty-orm/field-operations/relation-nested-queries/utils/formatConnectRecordNotFoundErrorMessage.util';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { computeRelationConnectQueryConfigs } from 'src/engine/twenty-orm/utils/compute-relation-connect-query-configs.util';
import { createSqlWhereTupleInClause } from 'src/engine/twenty-orm/utils/create-sql-where-tuple-in-clause.utils';
import { extractNestedRelationFieldsByEntityIndex } from 'src/engine/twenty-orm/utils/extract-nested-relation-fields-by-entity-index.util';
import { getAssociatedRelationFieldName } from 'src/engine/twenty-orm/utils/get-associated-relation-field-name.util';
import { getObjectMetadataFromEntityTarget } from 'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util';
import { getRecordToConnectFields } from 'src/engine/twenty-orm/utils/get-record-to-connect-fields.util';

export type ImportRecordWarning = {
  entityIndex: number;
  recordId?: string;
  fieldName: string;
  connectFieldName: string;
  targetObjectName: string;
  condition: string;
  reason: 'CONNECT_NOT_FOUND' | 'CONNECT_AMBIGUOUS' | 'CONNECT_CREATE_FAILED';
};

export class RelationNestedQueries {
  private readonly internalContext: WorkspaceInternalContext;
  private importWarnings: ImportRecordWarning[] = [];

  constructor(internalContext: WorkspaceInternalContext) {
    this.internalContext = internalContext;
  }

  getImportWarnings(): ImportRecordWarning[] {
    return this.importWarnings;
  }

  prepareNestedRelationQueries<Entity extends ObjectLiteral>(
    entities:
      | QueryDeepPartialEntityWithNestedRelationFields<Entity>[]
      | QueryDeepPartialEntityWithNestedRelationFields<Entity>,
    target: EntityTarget<Entity>,
  ):
    | [RelationConnectQueryConfig[], RelationDisconnectQueryFieldsByEntityIndex]
    | null {
    const entitiesArray = Array.isArray(entities) ? entities : [entities];

    const {
      relationConnectQueryFieldsByEntityIndex,
      relationDisconnectQueryFieldsByEntityIndex,
    } = extractNestedRelationFieldsByEntityIndex(entitiesArray);

    const connectConfig = this.prepareRelationConnect(
      entitiesArray,
      target,
      relationConnectQueryFieldsByEntityIndex,
    );

    return connectConfig.length > 0 ||
      Object.keys(relationDisconnectQueryFieldsByEntityIndex).length > 0
      ? [connectConfig, relationDisconnectQueryFieldsByEntityIndex]
      : null;
  }

  private prepareRelationConnect<Entity extends ObjectLiteral>(
    entities: QueryDeepPartialEntityWithNestedRelationFields<Entity>[],
    target: EntityTarget<Entity>,
    relationConnectQueryFieldsByEntityIndex: RelationConnectQueryFieldsByEntityIndex,
  ) {
    const objectMetadata = getObjectMetadataFromEntityTarget(
      target,
      this.internalContext,
    );

    const relationConnectQueryConfigs = computeRelationConnectQueryConfigs(
      entities,
      objectMetadata,
      this.internalContext.flatObjectMetadataMaps,
      this.internalContext.flatFieldMetadataMaps,
      this.internalContext.flatIndexMaps,
      relationConnectQueryFieldsByEntityIndex,
    );

    return relationConnectQueryConfigs;
  }

  async processRelationNestedQueries<Entity extends ObjectLiteral>({
    entities,
    relationNestedConfig,
    queryBuilder,
    isUpsert = false,
  }: {
    entities:
      | QueryDeepPartialEntityWithNestedRelationFields<Entity>[]
      | QueryDeepPartialEntityWithNestedRelationFields<Entity>;
    relationNestedConfig: [
      RelationConnectQueryConfig[],
      RelationDisconnectQueryFieldsByEntityIndex,
    ];
    queryBuilder:
      | WorkspaceSelectQueryBuilder<Entity>
      | SelectQueryBuilder<Entity>;
    isUpsert?: boolean;
  }): Promise<QueryDeepPartialEntity<Entity>[]> {
    const entitiesArray = Array.isArray(entities) ? entities : [entities];

    const [
      relationConnectQueryConfigs,
      relationDisconnectQueryFieldsByEntityIndex,
    ] = relationNestedConfig;

    const updatedEntitiesWithDisconnect = this.processRelationDisconnect({
      entities: entitiesArray,
      relationDisconnectQueryFieldsByEntityIndex,
    });

    const updatedEntitiesWithConnect = await this.processRelationConnect({
      entities: updatedEntitiesWithDisconnect,
      relationConnectQueryConfigs,
      queryBuilder,
      isUpsert,
    });

    return updatedEntitiesWithConnect;
  }

  private async processRelationConnect<Entity extends ObjectLiteral>({
    entities,
    relationConnectQueryConfigs,
    queryBuilder,
    isUpsert = false,
  }: {
    entities: QueryDeepPartialEntityWithNestedRelationFields<Entity>[];
    relationConnectQueryConfigs: RelationConnectQueryConfig[];
    queryBuilder:
      | WorkspaceSelectQueryBuilder<Entity>
      | SelectQueryBuilder<Entity>;
    isUpsert?: boolean;
  }): Promise<QueryDeepPartialEntity<Entity>[]> {
    if (relationConnectQueryConfigs.length === 0) return entities;

    this.importWarnings = [];

    const recordsToConnectWithConfig = await this.executeConnectQueries(
      relationConnectQueryConfigs,
      queryBuilder,
    );

    // For upserts, create missing related records instead of failing
    if (isUpsert) {
      await this.createMissingConnectRecords(
        recordsToConnectWithConfig,
        queryBuilder,
      );
    }

    const updatedEntities = this.updateEntitiesWithRecordToConnectId<Entity>(
      entities,
      recordsToConnectWithConfig,
      isUpsert,
    );

    return updatedEntities;
  }

  /**
   * For upsert operations, creates new records in the target table when the
   * connect query found no matches. This allows CSV imports to automatically
   * create related records (e.g. a new Lead) when they don't already exist.
   */
  private async createMissingConnectRecords<Entity extends ObjectLiteral>(
    recordsToConnectWithConfig: [
      RelationConnectQueryConfig,
      Record<string, unknown>[],
    ][],
    queryBuilder:
      | WorkspaceSelectQueryBuilder<Entity>
      | SelectQueryBuilder<Entity>,
  ): Promise<void> {
    for (const [
      connectQueryConfig,
      recordsToConnect,
    ] of recordsToConnectWithConfig) {
      const seenConditionKeys = new Set<string>();
      const missingConditions: [string, unknown][][] = [];

      for (const condition of Object.values(
        connectQueryConfig.recordToConnectConditionByEntityIndex,
      )) {
        const matches = recordsToConnect.filter((record) =>
          condition.every(([field, value]) => record[field] === value),
        );

        if (matches.length > 0) continue;

        const conditionKey = JSON.stringify(condition);

        if (seenConditionKeys.has(conditionKey)) continue;
        seenConditionKeys.add(conditionKey);

        missingConditions.push(condition);
      }

      if (missingConditions.length === 0) continue;

      for (const condition of missingConditions) {
        const now = new Date().toISOString();
        const newRecord: Record<string, unknown> = {
          id: randomUUID(),
          createdAt: now,
          updatedAt: now,
        };

        for (const [field, value] of condition) {
          newRecord[field] = value;
        }

        try {
          await queryBuilder.connection
            .createQueryBuilder()
            .insert()
            .into(connectQueryConfig.targetObjectName)
            .values(newRecord)
            .execute();

          // Add to results so updateEntitiesWithRecordToConnectId finds it
          recordsToConnect.push(newRecord);
        } catch {
          // If creation fails (e.g. NOT NULL constraints, unique violation),
          // updateEntitiesWithRecordToConnectId will find 0 matches and
          // record a CONNECT_NOT_FOUND warning with the entity's recordId.
        }
      }
    }
  }

  private async executeConnectQueries<Entity extends ObjectLiteral>(
    relationConnectQueryConfigs: RelationConnectQueryConfig[],
    queryBuilder:
      | WorkspaceSelectQueryBuilder<Entity>
      | SelectQueryBuilder<Entity>,
  ): Promise<[RelationConnectQueryConfig, Record<string, unknown>[]][]> {
    const allRecordsToConnectWithConfig: [
      RelationConnectQueryConfig,
      Record<string, unknown>[],
    ][] = [];

    for (const connectQueryConfig of relationConnectQueryConfigs) {
      const { clause, parameters } = createSqlWhereTupleInClause(
        connectQueryConfig.recordToConnectConditions,
        connectQueryConfig.targetObjectName,
      );

      queryBuilder.expressionMap.aliases = [];
      queryBuilder.expressionMap.mainAlias = undefined;

      const recordsToConnect = await queryBuilder
        .select(getRecordToConnectFields(connectQueryConfig))
        .where(clause, parameters)
        .from(
          connectQueryConfig.targetObjectName,
          connectQueryConfig.targetObjectName,
        )
        .getRawMany();

      allRecordsToConnectWithConfig.push([
        connectQueryConfig,
        recordsToConnect,
      ]);
    }

    return allRecordsToConnectWithConfig;
  }

  private updateEntitiesWithRecordToConnectId<Entity extends ObjectLiteral>(
    entities: QueryDeepPartialEntityWithNestedRelationFields<Entity>[],
    recordsToConnectWithConfig: [
      RelationConnectQueryConfig,
      Record<string, unknown>[],
    ][],
    isUpsert = false,
  ): QueryDeepPartialEntity<Entity>[] {
    return entities.map((entity, index) => {
      for (const [
        connectQueryConfig,
        recordsToConnect,
      ] of recordsToConnectWithConfig) {
        if (
          isDefined(
            connectQueryConfig.recordToConnectConditionByEntityIndex[index],
          )
        ) {
          const recordToConnect = recordsToConnect.filter((record) =>
            connectQueryConfig.recordToConnectConditionByEntityIndex[
              index
            ].every(([field, value]) => record[field] === value),
          );

          if (recordToConnect.length !== 1) {
            // For upserts with an existing record ID, skip the failed connect
            // and preserve the existing relation in the database rather than
            // failing the entire import batch.
            if (isUpsert && isDefined((entity as any).id)) {
              this.importWarnings.push({
                entityIndex: index,
                recordId: (entity as any).id as string,
                fieldName: connectQueryConfig.relationFieldName,
                connectFieldName: connectQueryConfig.connectFieldName,
                targetObjectName: connectQueryConfig.targetObjectName,
                condition:
                  connectQueryConfig.recordToConnectConditionByEntityIndex[index]
                    .map(([field, value]) => `${field} = ${value}`)
                    .join(' AND '),
                reason:
                  recordToConnect.length === 0
                    ? 'CONNECT_NOT_FOUND'
                    : 'CONNECT_AMBIGUOUS',
              });

              entity = {
                ...entity,
                [connectQueryConfig.connectFieldName]: null,
              };
              continue;
            }

            const { errorMessage, userFriendlyMessage } =
              formatConnectRecordNotFoundErrorMessage(
                connectQueryConfig.connectFieldName,
                recordToConnect.length,
                connectQueryConfig.recordToConnectConditionByEntityIndex[index],
              );

            throw new TwentyORMException(
              errorMessage,
              TwentyORMExceptionCode.CONNECT_RECORD_NOT_FOUND,
              {
                userFriendlyMessage,
              },
            );
          }

          entity = {
            ...entity,
            [connectQueryConfig.relationFieldName]: recordToConnect[0]['id'],
            [connectQueryConfig.connectFieldName]: null,
          };
        }
      }

      return entity;
    });
  }

  private processRelationDisconnect<Entity extends ObjectLiteral>({
    entities,
    relationDisconnectQueryFieldsByEntityIndex,
  }: {
    entities: QueryDeepPartialEntityWithNestedRelationFields<Entity>[];
    relationDisconnectQueryFieldsByEntityIndex: RelationDisconnectQueryFieldsByEntityIndex;
  }): QueryDeepPartialEntityWithNestedRelationFields<Entity>[] {
    return entities.map((entity, index) => {
      const nestedRelationDisconnectFields =
        relationDisconnectQueryFieldsByEntityIndex[index];

      if (!isDefined(nestedRelationDisconnectFields)) return entity;

      for (const [disconnectFieldName, disconnectObject] of Object.entries(
        nestedRelationDisconnectFields ?? {},
      )) {
        entity = {
          ...entity,
          [disconnectFieldName]: undefined,
          ...(disconnectObject[RELATION_NESTED_QUERY_KEYWORDS.DISCONNECT] ===
          true
            ? { [getAssociatedRelationFieldName(disconnectFieldName)]: null }
            : {}),
        };
      }

      return entity;
    });
  }
}
