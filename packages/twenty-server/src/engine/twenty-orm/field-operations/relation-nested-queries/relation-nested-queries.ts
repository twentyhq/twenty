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

import {
  type ConnectObject,
  type QueryDeepPartialEntityWithNestedRelationFields,
} from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-nested-relation-fields.type';
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return isDefined(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Safely reads a string-keyed property from an object without casting.
 */
function getProperty(obj: Record<string, unknown>, key: string): unknown {
  return obj[key];
}

/**
 * Extracts the `createData` from an entity's connect object for the given
 * connect field name, or returns `undefined` if not present.
 */
function extractCreateData<Entity extends ObjectLiteral>(
  entity: QueryDeepPartialEntityWithNestedRelationFields<Entity>,
  connectFieldName: string,
): Record<string, unknown> | undefined {
  const fieldValue: unknown = Object.entries(entity).find(
    ([key]) => key === connectFieldName,
  )?.[1];

  if (!isRecord(fieldValue)) return undefined;

  const connect = getProperty(fieldValue, RELATION_NESTED_QUERY_KEYWORDS.CONNECT);

  if (!isRecord(connect)) return undefined;

  const where = getProperty(connect, RELATION_NESTED_QUERY_KEYWORDS.CONNECT_WHERE);

  if (!isRecord(where)) return undefined;

  const createData = getProperty(connect, 'createData');

  if (!isRecord(createData)) return undefined;

  return createData;
}

/**
 * Extracts the `id` field from an entity, or `undefined` if not set.
 */
function getEntityId<Entity extends ObjectLiteral>(
  entity: QueryDeepPartialEntityWithNestedRelationFields<Entity>,
): string | undefined {
  const id: unknown = Object.entries(entity).find(
    ([key]) => key === 'id',
  )?.[1];

  return typeof id === 'string' ? id : undefined;
}

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

    // For upserts, create missing related records instead of failing,
    // then update connected records with createData (email, name, address)
    if (isUpsert) {
      await this.createMissingConnectRecords(
        recordsToConnectWithConfig,
        queryBuilder,
        entities,
      );

      await this.applyCreateDataUpdates(
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

        // 1b: Try createData fallback — search by email, then verify name
        // similarity (≥95%) to avoid matching spouses who share an email.
        const entity = entities[entry.entityIndex];
        const createData = extractCreateData(
          entity,
          connectQueryConfig.connectFieldName,
        );

        if (createData !== undefined) {
          const resolved = await this.tryCreateDataFallback(
            createData,
            connectQueryConfig,
            recordsToConnect,
            queryBuilder,
            entry.entityIndex,
          );

          if (resolved) continue;
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
        const createData = extractCreateData(
          entity,
          connectQueryConfig.connectFieldName,
        );

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
          queryBuilder.expressionMap.aliases = [];
          queryBuilder.expressionMap.mainAlias = undefined;

          await queryBuilder
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
      queryBuilder.expressionMap.aliases = [];
      queryBuilder.expressionMap.mainAlias = undefined;

      let fallbackQuery = queryBuilder
        .select('*')
        .from(
          connectQueryConfig.targetObjectName,
          connectQueryConfig.targetObjectName,
        );

      for (const [field, value] of conditions) {
        fallbackQuery = fallbackQuery.andWhere(
          `"${connectQueryConfig.targetObjectName}"."${field}" = :fb_${field}`,
          { [`fb_${field}`]: value },
        );
      }

      fallbackQuery = fallbackQuery.andWhere(
        `"${connectQueryConfig.targetObjectName}"."deletedAt" IS NULL`,
      );

      const fallbackResults = await fallbackQuery.getRawMany();

      if (fallbackResults.length === 1) {
        const matched = fallbackResults[0];
        const matchedId = matched?.id;

        if (typeof matchedId !== 'string') return false;

        recordsToConnect.push(matched);

        connectQueryConfig.recordToConnectConditionByEntityIndex[entityIndex] =
          [['id', matchedId]];

        return true;
      }
    } catch {
      // Fallback query failed
    }

    return false;
  }

  /**
   * Fallback lookup using createData. Tries two strategies:
   * 1. Email lookup + ≥95% Jaro-Winkler name similarity (avoids spouse matches)
   * 2. Exact name match — for records missing contact info entirely
   *    (only accepts if exactly 1 record matches the full name)
   */
  private async tryCreateDataFallback<Entity extends ObjectLiteral>(
    createData: Record<string, unknown>,
    connectQueryConfig: RelationConnectQueryConfig,
    recordsToConnect: Record<string, unknown>[],
    queryBuilder:
      | WorkspaceSelectQueryBuilder<Entity>
      | SelectQueryBuilder<Entity>,
    entityIndex: number,
  ): Promise<boolean> {
    const flat = this.flattenCreateData(createData);
    const emailValue = flat.find(([k]) => k === 'emailsPrimaryEmail')?.[1];
    const expectedFirst = String(
      flat.find(([k]) => k === 'nameFirstName')?.[1] ?? '',
    ).toLowerCase();
    const expectedLast = String(
      flat.find(([k]) => k === 'nameLastName')?.[1] ?? '',
    ).toLowerCase();
    const expectedFull = `${expectedFirst} ${expectedLast}`.trim();
    const table = connectQueryConfig.targetObjectName;

    // Strategy 1: Email + name similarity
    if (emailValue) {
      const matched = await this.lookupByEmailWithNameCheck(
        table,
        emailValue,
        expectedFull,
        queryBuilder,
      );

      if (matched) {
        return this.acceptFallbackMatch(
          matched,
          connectQueryConfig,
          recordsToConnect,
          entityIndex,
        );
      }
    }

    // Strategy 2: Exact name match — for records with missing contact info.
    // Only accept if exactly 1 non-deleted record matches the full name.
    if (expectedFirst.length > 0 && expectedLast.length > 0) {
      const matched = await this.lookupByExactName(
        table,
        expectedFirst,
        expectedLast,
        queryBuilder,
      );

      if (matched) {
        return this.acceptFallbackMatch(
          matched,
          connectQueryConfig,
          recordsToConnect,
          entityIndex,
        );
      }
    }

    return false;
  }

  private async lookupByEmailWithNameCheck<Entity extends ObjectLiteral>(
    table: string,
    email: string,
    expectedFull: string,
    queryBuilder:
      | WorkspaceSelectQueryBuilder<Entity>
      | SelectQueryBuilder<Entity>,
  ): Promise<Record<string, unknown> | null> {
    try {
      queryBuilder.expressionMap.aliases = [];
      queryBuilder.expressionMap.mainAlias = undefined;

      const results = await queryBuilder
        .select('*')
        .from(table, table)
        .where(`"${table}"."emailsPrimaryEmail" = :cd_email`, { cd_email: email })
        .andWhere(`"${table}"."deletedAt" IS NULL`)
        .getRawMany();

      if (results.length === 0) return null;

      if (expectedFull.length === 0) {
        return results.length === 1 ? results[0] : null;
      }

      let bestMatch: Record<string, unknown> | null = null;
      let bestScore = 0;

      for (const record of results) {
        const recordFirst = String(record.nameFirstName ?? '').toLowerCase();
        const recordLast = String(record.nameLastName ?? '').toLowerCase();
        const recordFull = `${recordFirst} ${recordLast}`.trim();
        const similarity = stringSimilarity(expectedFull, recordFull);

        if (similarity >= 0.95 && similarity > bestScore) {
          bestScore = similarity;
          bestMatch = record;
        }
      }

      return bestMatch;
    } catch {
      return null;
    }
  }

  private async lookupByExactName<Entity extends ObjectLiteral>(
    table: string,
    firstName: string,
    lastName: string,
    queryBuilder:
      | WorkspaceSelectQueryBuilder<Entity>
      | SelectQueryBuilder<Entity>,
  ): Promise<Record<string, unknown> | null> {
    try {
      queryBuilder.expressionMap.aliases = [];
      queryBuilder.expressionMap.mainAlias = undefined;

      const results = await queryBuilder
        .select('*')
        .from(table, table)
        .where(`LOWER("${table}"."nameFirstName") = :fn`, { fn: firstName })
        .andWhere(`LOWER("${table}"."nameLastName") = :ln`, { ln: lastName })
        .andWhere(`"${table}"."deletedAt" IS NULL`)
        .getRawMany();

      // Only accept if exactly 1 record — multiple means ambiguous
      return results.length === 1 ? results[0] : null;
    } catch {
      return null;
    }
  }

  private acceptFallbackMatch(
    matched: Record<string, unknown>,
    connectQueryConfig: RelationConnectQueryConfig,
    recordsToConnect: Record<string, unknown>[],
    entityIndex: number,
  ): boolean {
    const matchedId = matched.id;

    if (typeof matchedId !== 'string') return false;

    recordsToConnect.push(matched);

    connectQueryConfig.recordToConnectConditionByEntityIndex[entityIndex] =
      [['id', matchedId]];

    return true;
  }

  /**
   * After connecting entities to their related records, update those records
   * with createData fields (email, name, address, etc.) from the CSV row.
   * This ensures that re-importing a CSV actually updates lead data.
   */
  private async applyCreateDataUpdates<Entity extends ObjectLiteral>(
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
      for (const [entityIndexStr, condition] of Object.entries(
        connectQueryConfig.recordToConnectConditionByEntityIndex,
      )) {
        const entityIndex = Number(entityIndexStr);
        const entity = entities[entityIndex];
        const createData = extractCreateData(
          entity,
          connectQueryConfig.connectFieldName,
        );

        if (createData === undefined) continue;

        // Find the matched record
        const matchedRecord = recordsToConnect.find((record) =>
          condition.every(([field, value]) => record[field] === value),
        );

        const matchedId = matchedRecord?.id;

        if (typeof matchedId !== 'string') continue;

        const updateFields = this.flattenCreateData(createData);

        if (updateFields.length === 0) continue;

        const setClause: Record<string, unknown> = {};

        for (const [col, val] of updateFields) {
          setClause[col] = val;
        }

        setClause['updatedAt'] = new Date().toISOString();

        try {
          const table = connectQueryConfig.targetObjectName;
          const setCols = updateFields
            .map(([col], i) => `"${col}" = :setVal_${i}`)
            .join(', ');
          const setParams: Record<string, string> = {};

          for (const [col, val] of updateFields.entries()) {
            setParams[`setVal_${col}`] = val[1];
          }

          // Use the workspace connection's query runner for the UPDATE
          // to ensure correct schema context
          await queryBuilder.connection.query(
            `UPDATE "${table}" SET ${setCols}, "updatedAt" = NOW() WHERE "id" = $${updateFields.length + 1}`,
            [...updateFields.map(([, val]) => val), matchedId],
          );
        } catch {
          // Update failed — non-critical, the connect still worked
        }
      }
    }
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
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        // Composite field — flatten subfields
        for (const [subKey, subValue] of Object.entries(value)) {
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
            const entityId = getEntityId(entity);

            if (isUpsert && isDefined(entityId)) {
              this.importWarnings.push({
                entityIndex: index,
                recordId: entityId,
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

/**
 * Jaro-Winkler similarity (0–1). Gives extra weight to common prefixes,
 * making it well-suited for person name matching.
 */
function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const jaro = jaroSimilarity(a, b);

  // Winkler prefix bonus (up to 4 chars, scaling factor 0.1)
  let prefixLen = 0;
  const maxPrefix = Math.min(4, a.length, b.length);

  while (prefixLen < maxPrefix && a[prefixLen] === b[prefixLen]) {
    prefixLen++;
  }

  return jaro + prefixLen * 0.1 * (1 - jaro);
}

function jaroSimilarity(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;
  const matchWindow = Math.max(0, Math.floor(Math.max(aLen, bLen) / 2) - 1);

  const aMatched = new Array<boolean>(aLen).fill(false);
  const bMatched = new Array<boolean>(bLen).fill(false);

  let matches = 0;
  let transpositions = 0;

  // Find matches
  for (let i = 0; i < aLen; i++) {
    const lo = Math.max(0, i - matchWindow);
    const hi = Math.min(bLen - 1, i + matchWindow);

    for (let j = lo; j <= hi; j++) {
      if (bMatched[j] || a[i] !== b[j]) continue;
      aMatched[i] = true;
      bMatched[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  // Count transpositions
  let k = 0;

  for (let i = 0; i < aLen; i++) {
    if (!aMatched[i]) continue;

    while (!bMatched[k]) k++;

    if (a[i] !== b[k]) transpositions++;
    k++;
  }

  return (
    (matches / aLen + matches / bLen + (matches - transpositions / 2) / matches) /
    3
  );
}
