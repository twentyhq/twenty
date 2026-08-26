import { isDefined } from 'class-validator';
import { RELATION_NESTED_QUERY_KEYWORDS } from 'twenty-shared/constants';
import { type EntityTarget, type ObjectLiteral } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

import { type QueryDeepPartialEntityWithNestedRelationFields } from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-nested-relation-fields.type';
import { type RelationConnectQueryConfig } from 'src/engine/twenty-orm/entity-manager/types/relation-connect-query-config.type';
import {
  type RelationConnectQueryFieldsByEntityIndex,
  type RelationDisconnectQueryFieldsByEntityIndex,
} from 'src/engine/twenty-orm/entity-manager/types/relation-nested-query-fields-by-entity-index.type';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { formatConnectRecordNotFoundErrorMessage } from 'src/engine/twenty-orm/field-operations/relation-nested-queries/utils/formatConnectRecordNotFoundErrorMessage.util';
import { computeRelationConnectQueryConfigs } from 'src/engine/twenty-orm/utils/compute-relation-connect-query-configs.util';
import { createSqlWhereTupleInClause } from 'src/engine/twenty-orm/utils/create-sql-where-tuple-in-clause.utils';
import { extractNestedRelationFieldsByEntityIndex } from 'src/engine/twenty-orm/utils/extract-nested-relation-fields-by-entity-index.util';
import { getAssociatedRelationFieldName } from 'src/engine/twenty-orm/utils/get-associated-relation-field-name.util';
import { getObjectMetadataFromEntityTarget } from 'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util';

export class RelationNestedQueries {
  private readonly internalContext: WorkspaceInternalContext;
  private readonly workspaceOrmManager: WorkspaceOrmManager;
  private readonly rolePermissionConfig?: RolePermissionConfig;

  constructor(
    internalContext: WorkspaceInternalContext,
    workspaceOrmManager: WorkspaceOrmManager,
    rolePermissionConfig?: RolePermissionConfig,
  ) {
    this.internalContext = internalContext;
    this.workspaceOrmManager = workspaceOrmManager;
    this.rolePermissionConfig = rolePermissionConfig;
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
  }: {
    entities:
      | QueryDeepPartialEntityWithNestedRelationFields<Entity>[]
      | QueryDeepPartialEntityWithNestedRelationFields<Entity>;
    relationNestedConfig: [
      RelationConnectQueryConfig[],
      RelationDisconnectQueryFieldsByEntityIndex,
    ];
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
    });

    return updatedEntitiesWithConnect;
  }

  private async processRelationConnect<Entity extends ObjectLiteral>({
    entities,
    relationConnectQueryConfigs,
  }: {
    entities: QueryDeepPartialEntityWithNestedRelationFields<Entity>[];
    relationConnectQueryConfigs: RelationConnectQueryConfig[];
  }): Promise<QueryDeepPartialEntity<Entity>[]> {
    if (relationConnectQueryConfigs.length === 0) return entities;

    const recordsToConnectWithConfig = await this.executeConnectQueries(
      relationConnectQueryConfigs,
    );

    const updatedEntities = this.updateEntitiesWithRecordToConnectId<Entity>(
      entities,
      recordsToConnectWithConfig,
    );

    return updatedEntities;
  }

  private async executeConnectQueries(
    relationConnectQueryConfigs: RelationConnectQueryConfig[],
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

      const recordsToConnect = await this.fetchRecordsToConnect({
        connectQueryConfig,
        clause,
        parameters,
      });

      allRecordsToConnectWithConfig.push([
        connectQueryConfig,
        recordsToConnect,
      ]);
    }

    return allRecordsToConnectWithConfig;
  }

  private async fetchRecordsToConnect({
    connectQueryConfig,
    clause,
    parameters,
  }: {
    connectQueryConfig: RelationConnectQueryConfig;
    clause: string;
    parameters: Record<string, unknown>;
  }): Promise<Record<string, unknown>[]> {
    const targetObjectName = connectQueryConfig.targetObjectName;
    const targetQueryBuilder = this.workspaceOrmManager
      .getRepository(targetObjectName, this.rolePermissionConfig)
      .createQueryBuilder(targetObjectName);

    targetQueryBuilder.select([]);
    targetQueryBuilder.addSelect(`"${targetObjectName}"."id"`, 'id');

    for (const [field] of connectQueryConfig.recordToConnectConditions[0]) {
      targetQueryBuilder.addSelect(`"${targetObjectName}"."${field}"`, field);
    }

    return targetQueryBuilder.where(clause, parameters).getRawMany();
  }

  private updateEntitiesWithRecordToConnectId<Entity extends ObjectLiteral>(
    entities: QueryDeepPartialEntityWithNestedRelationFields<Entity>[],
    recordsToConnectWithConfig: [
      RelationConnectQueryConfig,
      Record<string, unknown>[],
    ][],
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
            const { errorMessage, userFriendlyMessage } =
              formatConnectRecordNotFoundErrorMessage(
                connectQueryConfig.connectFieldName,
                recordToConnect.length,
                connectQueryConfig.recordToConnectConditionByEntityIndex[index],
              );

            throw new TwentyOrmException(
              errorMessage,
              TwentyOrmExceptionCode.CONNECT_RECORD_NOT_FOUND,
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
