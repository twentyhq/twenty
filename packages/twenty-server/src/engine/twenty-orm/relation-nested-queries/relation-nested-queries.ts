import { isDefined } from 'class-validator';
import { RELATION_NESTED_QUERY_KEYWORDS } from 'twenty-shared/constants';
import { ObjectRecordsPermissions } from 'twenty-shared/types';
import { EntityTarget, ObjectLiteral, QueryRunner } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { QueryDeepPartialEntityWithRelationConnect } from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-relation-connect.type';
import { RelationConnectQueryConfig } from 'src/engine/twenty-orm/entity-manager/types/relation-connect-query-config.type';
import {
  RelationConnectQueryFieldsByEntityIndex,
  RelationDisconnectQueryFieldsByEntityIndex,
} from 'src/engine/twenty-orm/entity-manager/types/relation-nested-query-fields-by-entity-index.type';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { computeRelationConnectQueryConfigs } from 'src/engine/twenty-orm/utils/compute-relation-connect-query-configs.util';
import { createSqlWhereTupleInClause } from 'src/engine/twenty-orm/utils/create-sql-where-tuple-in-clause.utils';
import { extractNestedRelationFieldsByEntityIndex } from 'src/engine/twenty-orm/utils/extract-nested-relation-fields-by-entity-index.util';
import { getAssociatedRelationFieldName } from 'src/engine/twenty-orm/utils/get-associated-relation-field-name.util';
import { getObjectMetadataFromEntityTarget } from 'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util';
import { getRecordToConnectFields } from 'src/engine/twenty-orm/utils/get-record-to-connect-fields.util';

export class RelationNestedQueries {
  private readonly queryRunner?: QueryRunner;
  private readonly internalContext: WorkspaceInternalContext;
  private readonly workspaceEntityManager: WorkspaceEntityManager;

  constructor(
    internalContext: WorkspaceInternalContext,
    workspaceEntityManager: WorkspaceEntityManager,
    queryRunner?: QueryRunner,
  ) {
    this.queryRunner = queryRunner;
    this.internalContext = internalContext;
    this.workspaceEntityManager = workspaceEntityManager;
  }

  prepareNestedRelationQueries<Entity extends ObjectLiteral>(
    entities:
      | QueryDeepPartialEntityWithRelationConnect<Entity>[]
      | QueryDeepPartialEntityWithRelationConnect<Entity>,
    target: EntityTarget<Entity>,
  ) {
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

    return {
      disconnectConfig: relationDisconnectQueryFieldsByEntityIndex,
      connectConfig,
    };
  }

  private prepareRelationConnect<Entity extends ObjectLiteral>(
    entities: QueryDeepPartialEntityWithRelationConnect<Entity>[],
    target: EntityTarget<Entity>,
    relationConnectQueryFieldsByEntityIndex: RelationConnectQueryFieldsByEntityIndex,
  ) {
    const objectMetadata = getObjectMetadataFromEntityTarget(
      target,
      this.internalContext,
    );

    const objectMetadataMap = this.internalContext.objectMetadataMaps;

    const relationConnectQueryConfigs = computeRelationConnectQueryConfigs(
      entities,
      objectMetadata,
      objectMetadataMap,
      relationConnectQueryFieldsByEntityIndex,
    );

    return relationConnectQueryConfigs;
  }

  async processRelationNestedQueries<Entity extends ObjectLiteral>(
    entities:
      | QueryDeepPartialEntityWithRelationConnect<Entity>[]
      | QueryDeepPartialEntityWithRelationConnect<Entity>,
    relationDisconnectQueryFieldsByEntityIndex: RelationDisconnectQueryFieldsByEntityIndex,
    relationConnectQueryConfigs: Record<string, RelationConnectQueryConfig>,
    permissionOptions?: {
      shouldBypassPermissionChecks?: boolean;
      objectRecordsPermissions?: ObjectRecordsPermissions;
    },
    queryRunner?: QueryRunner,
  ): Promise<QueryDeepPartialEntity<Entity>[]> {
    const entitiesArray = Array.isArray(entities) ? entities : [entities];

    const updatedEntitiesWithDisconnect = this.processRelationDisconnect({
      entities: entitiesArray,
      relationDisconnectQueryFieldsByEntityIndex,
    });

    const updatedEntitiesWithConnect = await this.processRelationConnect({
      entities: updatedEntitiesWithDisconnect,
      permissionOptions,
      relationConnectQueryConfigs,
      queryRunner,
    });

    return updatedEntitiesWithConnect;
  }

  private async processRelationConnect<Entity extends ObjectLiteral>({
    entities,
    relationConnectQueryConfigs,
    permissionOptions,
    queryRunner,
  }: {
    entities: QueryDeepPartialEntityWithRelationConnect<Entity>[];
    relationConnectQueryConfigs: Record<string, RelationConnectQueryConfig>;
    permissionOptions?: {
      shouldBypassPermissionChecks?: boolean;
      objectRecordsPermissions?: ObjectRecordsPermissions;
    };
    queryRunner?: QueryRunner;
  }): Promise<QueryDeepPartialEntity<Entity>[]> {
    if (!isDefined(relationConnectQueryConfigs)) return entities;

    const recordsToConnectWithConfig = await this.executeConnectQueries(
      relationConnectQueryConfigs,
      permissionOptions,
      queryRunner,
    );

    const updatedEntities = this.updateEntitiesWithRecordToConnectId<Entity>(
      entities,
      recordsToConnectWithConfig,
    );

    return updatedEntities;
  }

  private async executeConnectQueries(
    relationConnectQueryConfigs: Record<string, RelationConnectQueryConfig>,
    permissionOptions?: {
      shouldBypassPermissionChecks?: boolean;
      objectRecordsPermissions?: ObjectRecordsPermissions;
    },
    queryRunner?: QueryRunner,
  ): Promise<[RelationConnectQueryConfig, Record<string, unknown>[]][]> {
    const AllRecordsToConnectWithConfig: [
      RelationConnectQueryConfig,
      Record<string, unknown>[],
    ][] = [];

    for (const connectQueryConfig of Object.values(
      relationConnectQueryConfigs,
    )) {
      const { clause, parameters } = createSqlWhereTupleInClause(
        connectQueryConfig.recordToConnectConditions,
        connectQueryConfig.targetObjectName,
      );

      const recordsToConnect = await this.workspaceEntityManager
        .createQueryBuilder(
          connectQueryConfig.targetObjectName,
          connectQueryConfig.targetObjectName,
          queryRunner,
          permissionOptions,
        )
        .select(getRecordToConnectFields(connectQueryConfig))
        .where(clause, parameters)
        .getRawMany();

      AllRecordsToConnectWithConfig.push([
        connectQueryConfig,
        recordsToConnect,
      ]);
    }

    return AllRecordsToConnectWithConfig;
  }

  private updateEntitiesWithRecordToConnectId<Entity extends ObjectLiteral>(
    entities: QueryDeepPartialEntityWithRelationConnect<Entity>[],
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
            const recordToConnectTotal = recordToConnect.length;
            const connectFieldName = connectQueryConfig.connectFieldName;

            throw new TwentyORMException(
              `Expected 1 record to connect to ${connectFieldName}, but found ${recordToConnectTotal}.`,
              TwentyORMExceptionCode.CONNECT_RECORD_NOT_FOUND,
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
    entities: QueryDeepPartialEntityWithRelationConnect<Entity>[];
    relationDisconnectQueryFieldsByEntityIndex: RelationDisconnectQueryFieldsByEntityIndex;
  }): QueryDeepPartialEntityWithRelationConnect<Entity>[] {
    return entities.map((entity, index) => {
      const nestedRelationDisconnectFields =
        relationDisconnectQueryFieldsByEntityIndex[index];

      if (!isDefined(nestedRelationDisconnectFields)) return entity;

      for (const [disconnectFieldName, disconnectObject] of Object.entries(
        nestedRelationDisconnectFields ?? {},
      )) {
        entity = {
          ...entity,
          [disconnectFieldName]: null,
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
