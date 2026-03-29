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
    parentObjectName,
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
    parentObjectName?: string;
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
      parentObjectName,
    });

    return updatedEntitiesWithConnect;
  }

  private async processRelationConnect<Entity extends ObjectLiteral>({
    entities,
    relationConnectQueryConfigs,
    queryBuilder,
    isUpsert = false,
    parentObjectName,
  }: {
    entities: QueryDeepPartialEntityWithNestedRelationFields<Entity>[];
    relationConnectQueryConfigs: RelationConnectQueryConfig[];
    queryBuilder:
      | WorkspaceSelectQueryBuilder<Entity>
      | SelectQueryBuilder<Entity>;
    isUpsert?: boolean;
    parentObjectName?: string;
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
        entities,
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
   * For upsert operations, resolves missing connect records by:
   * 1. Trying a fallback lookup using createData fields (email, name, etc.)
   *    when the primary unique-constraint lookup found no match
   * 2. Creating new records in the target table with full data as a last resort
   */
  private async createMissingConnectRecords<Entity extends ObjectLiteral>(
    recordsToConnectWithConfig: [
      RelationConnectQueryConfig,
      Record<string, unknown>[],
    ][],
    queryBuilder:
      | WorkspaceSelectQueryBuilder<Entity>
      | SelectQueryBuilder<Entity>,
    entities: QueryDeepPartialEntityWithNestedRelationFields<Entity>[],
  ): Promise<void> {
    for (const [
      connectQueryConfig,
      recordsToConnect,
    ] of recordsToConnectWithConfig) {
      const seenConditionKeys = new Set<string>();
      const missingEntries: {
        condition: [string, unknown][];
        entityIndex: number;
      }[] = [];

      for (const [entityIndexStr, condition] of Object.entries(
        connectQueryConfig.recordToConnectConditionByEntityIndex,
      )) {
        const matches = recordsToConnect.filter((record) =>
          condition.every(([field, value]) => record[field] === value),
        );

        if (matches.length > 0) continue;

        const conditionKey = JSON.stringify(condition);

        if (seenConditionKeys.has(conditionKey)) continue;
        seenConditionKeys.add(conditionKey);

        missingEntries.push({
          condition,
          entityIndex: Number(entityIndexStr),
        });
      }

      if (missingEntries.length === 0) continue;

      // Step 1: Try fallback lookups — first using fullRecordToConnectCondition
      // (for ID-priority scenarios), then using createData fields from the entity
      for (const entry of missingEntries) {
        // 1a: Try full condition fallback (for ID-priority filtered scenarios)
        const fullConditions =
          connectQueryConfig.fullRecordToConnectConditionByEntityIndex ?? {};
        const fullCondition = fullConditions[entry.entityIndex];

        if (isDefined(fullCondition) && fullCondition.length > 0) {
          const resolved = await this.tryFallbackLookup(
            fullCondition,
            connectQueryConfig,
            recordsToConnect,
            queryBuilder,
            entry.entityIndex,
          );

          if (resolved) continue;
        }

        // 1b: Try createData fallback — extract email/name from the entity's
        // connect.createData and search the target table
        const entity = entities[entry.entityIndex];
        const connectObj = (entity as any)?.[
          connectQueryConfig.connectFieldName
        ]?.connect;
        const createData = connectObj?.createData as
          | Record<string, unknown>
          | undefined;

        if (createData !== undefined) {
          const fallbackFields = this.flattenCreateData(createData);

          if (fallbackFields.length > 0) {
            const resolved = await this.tryFallbackLookup(
              fallbackFields,
              connectQueryConfig,
              recordsToConnect,
              queryBuilder,
              entry.entityIndex,
            );

            if (resolved) continue;
          }
        }
      }

      // Step 2: Create missing records that couldn't be resolved via fallback
      for (const entry of missingEntries) {
        const currentCondition =
          connectQueryConfig.recordToConnectConditionByEntityIndex[
            entry.entityIndex
          ];
        const alreadyResolved = recordsToConnect.some((record) =>
          currentCondition.every(([field, value]) => record[field] === value),
        );

        if (alreadyResolved) continue;

        // Build the new record using condition data + createData for richer records
        const entity = entities[entry.entityIndex];
        const connectObj = (entity as any)?.[
          connectQueryConfig.connectFieldName
        ]?.connect;
        const createData = connectObj?.createData as
          | Record<string, unknown>
          | undefined;

        const now = new Date().toISOString();
        const newRecord: Record<string, unknown> = {
          id: randomUUID(),
          createdAt: now,
          updatedAt: now,
        };

        // Add the connect condition fields (e.g., phone number)
        for (const [field, value] of entry.condition) {
          newRecord[field] = value;
        }

        // Add createData fields (name, email, address, etc.)
        if (createData !== undefined) {
          for (const [field, value] of this.flattenCreateData(createData)) {
            if (!(field in newRecord)) {
              newRecord[field] = value;
            }
          }
        }

        try {
          await queryBuilder.connection
            .createQueryBuilder()
            .insert()
            .into(connectQueryConfig.targetObjectName)
            .values(newRecord)
            .execute();

          recordsToConnect.push(newRecord);
        } catch {
          // If creation fails, updateEntitiesWithRecordToConnectId will
          // record a CONNECT_NOT_FOUND warning.
        }
      }
    }
  }

  /**
   * Try a fallback lookup against the target table using the given conditions.
   * If exactly one record matches, add it to results and rewrite the entity's
   * condition to use the matched record's ID.
   */
  private async tryFallbackLookup<Entity extends ObjectLiteral>(
    conditions: [string, unknown][],
    connectQueryConfig: RelationConnectQueryConfig,
    recordsToConnect: Record<string, unknown>[],
    queryBuilder:
      | WorkspaceSelectQueryBuilder<Entity>
      | SelectQueryBuilder<Entity>,
    entityIndex: number,
  ): Promise<boolean> {
    try {
      let fallbackQuery = queryBuilder.connection
        .createQueryBuilder()
        .select('*')
        .from(
          connectQueryConfig.targetObjectName,
          connectQueryConfig.targetObjectName,
        );

      for (const [field, value] of conditions) {
        fallbackQuery = fallbackQuery.andWhere(
          `"${connectQueryConfig.targetObjectName}"."${field}" = :${field}`,
          { [field]: value },
        );
      }

      // Only match non-deleted records
      fallbackQuery = fallbackQuery.andWhere(
        `"${connectQueryConfig.targetObjectName}"."deletedAt" IS NULL`,
      );

      const fallbackResults = await fallbackQuery.getRawMany();

      if (fallbackResults.length === 1) {
        const matched = fallbackResults[0];

        recordsToConnect.push(matched);

        connectQueryConfig.recordToConnectConditionByEntityIndex[entityIndex] =
          [['id', matched.id]];

        return true;
      }
    } catch {
      // Fallback query failed
    }

    return false;
  }

  /**
   * Flatten createData (which uses composite object notation like
   * `{ name: { firstName: "X" } }`) into DB column pairs like
   * `[["nameFirstName", "X"]]`.
   */
  private flattenCreateData(
    createData: Record<string, unknown>,
  ): [string, string][] {
    const result: [string, string][] = [];

    for (const [fieldName, value] of Object.entries(createData)) {
      if (value !== null && typeof value === 'object') {
        // Composite field — flatten subfields
        for (const [subKey, subValue] of Object.entries(
          value as Record<string, unknown>,
        )) {
          if (isDefined(subValue) && subValue !== '') {
            const columnName = `${fieldName}${subKey.charAt(0).toUpperCase()}${subKey.slice(1)}`;

            result.push([columnName, String(subValue)]);
          }
        }
      } else if (isDefined(value) && value !== '') {
        result.push([fieldName, String(value)]);
      }
    }

    return result;
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
