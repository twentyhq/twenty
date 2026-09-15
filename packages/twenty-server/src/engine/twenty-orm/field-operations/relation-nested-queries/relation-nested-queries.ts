import { RELATION_NESTED_QUERY_KEYWORDS } from 'twenty-shared/constants';
import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type EntityTarget, type ObjectLiteral } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { v4 } from 'uuid';

import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

import { type QueryDeepPartialEntityWithNestedRelationFields } from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-nested-relation-fields.type';
import { type RelationConnectQueryConfig } from 'src/engine/twenty-orm/entity-manager/types/relation-connect-query-config.type';
import {
  type RelationConnectQueryFieldsByEntityIndex,
  type RelationCreateQueryFieldsByEntityIndex,
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
import { getNestedRelationFieldNames } from 'src/engine/twenty-orm/utils/get-nested-relation-field-names.util';

export class RelationNestedQueries {
  private readonly internalContext: WorkspaceInternalContext;
  private readonly repository: WorkspaceRepository;

  constructor(repository: WorkspaceRepository) {
    this.repository = repository;
    this.internalContext = repository.getInternalContext();
  }

  prepareNestedRelationQueries<Entity extends ObjectLiteral>(
    entities:
      | QueryDeepPartialEntityWithNestedRelationFields<Entity>[]
      | QueryDeepPartialEntityWithNestedRelationFields<Entity>,
    target: EntityTarget<Entity>,
  ):
    | [
        RelationConnectQueryConfig[],
        RelationDisconnectQueryFieldsByEntityIndex,
        RelationCreateQueryFieldsByEntityIndex,
      ]
    | null {
    const entitiesArray = Array.isArray(entities) ? entities : [entities];
    const objectMetadata = getObjectMetadataFromEntityTarget(
      target,
      this.internalContext,
    );

    const {
      relationConnectQueryFieldsByEntityIndex,
      relationCreateQueryFieldsByEntityIndex,
      relationDisconnectQueryFieldsByEntityIndex,
    } = extractNestedRelationFieldsByEntityIndex(
      entitiesArray,
      getNestedRelationFieldNames({
        flatObjectMetadata: objectMetadata,
        flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
      }),
    );

    const connectConfig = this.prepareRelationConnect(
      entitiesArray,
      target,
      relationConnectQueryFieldsByEntityIndex,
    );

    return connectConfig.length > 0 ||
      Object.keys(relationCreateQueryFieldsByEntityIndex).length > 0 ||
      Object.keys(relationDisconnectQueryFieldsByEntityIndex).length > 0
      ? [
          connectConfig,
          relationDisconnectQueryFieldsByEntityIndex,
          relationCreateQueryFieldsByEntityIndex,
        ]
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
    createRecords,
    target,
  }: {
    entities:
      | QueryDeepPartialEntityWithNestedRelationFields<Entity>[]
      | QueryDeepPartialEntityWithNestedRelationFields<Entity>;
    relationNestedConfig: [
      RelationConnectQueryConfig[],
      RelationDisconnectQueryFieldsByEntityIndex,
      RelationCreateQueryFieldsByEntityIndex,
    ];
    createRecords?: (options: {
      targetObjectMetadata: FlatObjectMetadata;
      records: Partial<ObjectRecord>[];
    }) => Promise<ObjectRecord[]>;
    target: EntityTarget<Entity>;
  }): Promise<QueryDeepPartialEntity<Entity>[]> {
    const entitiesArray = Array.isArray(entities) ? entities : [entities];

    const [
      relationConnectQueryConfigs,
      relationDisconnectQueryFieldsByEntityIndex,
      relationCreateQueryFieldsByEntityIndex,
    ] = relationNestedConfig;

    const updatedEntitiesWithDisconnect = this.processRelationDisconnect({
      entities: entitiesArray,
      relationDisconnectQueryFieldsByEntityIndex,
    });

    const updatedEntitiesWithCreate = await this.processRelationCreate({
      entities: updatedEntitiesWithDisconnect,
      target,
      relationCreateQueryFieldsByEntityIndex,
      createRecords,
    });

    const updatedEntitiesWithConnect = await this.processRelationConnect({
      entities: updatedEntitiesWithCreate,
      relationConnectQueryConfigs,
    });

    return updatedEntitiesWithConnect;
  }

  private async processRelationCreate<Entity extends ObjectLiteral>({
    entities,
    target,
    relationCreateQueryFieldsByEntityIndex,
    createRecords,
  }: {
    entities: QueryDeepPartialEntityWithNestedRelationFields<Entity>[];
    target: EntityTarget<Entity>;
    relationCreateQueryFieldsByEntityIndex: RelationCreateQueryFieldsByEntityIndex;
    createRecords?: (options: {
      targetObjectMetadata: FlatObjectMetadata;
      records: Partial<ObjectRecord>[];
    }) => Promise<ObjectRecord[]>;
  }): Promise<QueryDeepPartialEntityWithNestedRelationFields<Entity>[]> {
    if (Object.keys(relationCreateQueryFieldsByEntityIndex).length === 0) {
      return entities;
    }
    if (!isDefined(createRecords)) {
      throw new TwentyOrmException(
        'Nested relation create is not supported in this operation',
        TwentyOrmExceptionCode.INVALID_PARAMETER,
      );
    }

    const objectMetadata = getObjectMetadataFromEntityTarget(
      target,
      this.internalContext,
    );
    const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
      this.internalContext.flatFieldMetadataMaps,
      objectMetadata,
    );
    const groups = new Map<
      string,
      {
        targetObjectMetadata: FlatObjectMetadata;
        entries: {
          entityIndex: number;
          fieldName: string;
          record: Partial<ObjectRecord>;
        }[];
      }
    >();

    for (const [entityIndex, fields] of Object.entries(
      relationCreateQueryFieldsByEntityIndex,
    )) {
      for (const [fieldName, createObject] of Object.entries(fields)) {
        const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldIdByName[fieldName],
          flatEntityMaps: this.internalContext.flatFieldMetadataMaps,
        });

        if (
          !isDefined(fieldMetadata) ||
          (!isFieldMetadataEntityOfType(
            fieldMetadata,
            FieldMetadataType.RELATION,
          ) &&
            !isFieldMetadataEntityOfType(
              fieldMetadata,
              FieldMetadataType.MORPH_RELATION,
            )) ||
          fieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE ||
          !isDefined(fieldMetadata.relationTargetObjectMetadataId)
        ) {
          throw new TwentyOrmException(
            `Create is not allowed for ${fieldName} on ${objectMetadata.nameSingular}`,
            TwentyOrmExceptionCode.INVALID_PARAMETER,
          );
        }

        const joinColumnName = getAssociatedRelationFieldName(fieldName);
        const entity = entities[Number(entityIndex)];
        const entityRecord = entity as Record<string, unknown>;

        if (isDefined(entityRecord[joinColumnName])) {
          throw new TwentyOrmException(
            `Cannot provide both ${fieldName}.create and ${joinColumnName}`,
            TwentyOrmExceptionCode.INVALID_PARAMETER,
          );
        }

        const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
          flatEntityMaps: this.internalContext.flatObjectMetadataMaps,
        });

        if (!isDefined(targetObjectMetadata)) {
          throw new TwentyOrmException(
            `Target object metadata not found for ${fieldName}`,
            TwentyOrmExceptionCode.MALFORMED_METADATA,
          );
        }

        const group = groups.get(targetObjectMetadata.id) ?? {
          targetObjectMetadata,
          entries: [],
        };

        group.entries.push({
          entityIndex: Number(entityIndex),
          fieldName,
          record: createObject[RELATION_NESTED_QUERY_KEYWORDS.CREATE],
        });
        groups.set(targetObjectMetadata.id, group);
      }
    }

    const updatedEntities = entities.map((entity) => ({ ...entity }));

    for (const { targetObjectMetadata, entries } of groups.values()) {
      const recordsWithIds = entries.map(({ record }) => ({
        ...record,
        id: record.id ?? v4(),
      }));
      const createdRecords = await createRecords({
        targetObjectMetadata,
        records: recordsWithIds,
      });

      if (createdRecords.length !== entries.length) {
        throw new TwentyOrmException(
          `Expected ${entries.length} created ${targetObjectMetadata.namePlural} records, received ${createdRecords.length}`,
          TwentyOrmExceptionCode.INVALID_PARAMETER,
        );
      }

      const createdRecordIds = new Set(
        createdRecords.map(({ id }) => id).filter(isDefined),
      );

      entries.forEach(({ entityIndex, fieldName }, index) => {
        const createdRecordId = recordsWithIds[index].id;

        if (!createdRecordIds.has(createdRecordId)) {
          throw new TwentyOrmException(
            `Created ${targetObjectMetadata.nameSingular} record ${createdRecordId} was not returned`,
            TwentyOrmExceptionCode.INVALID_PARAMETER,
          );
        }

        updatedEntities[entityIndex] = {
          ...updatedEntities[entityIndex],
          [getAssociatedRelationFieldName(fieldName)]: createdRecordId,
          [fieldName]: null,
        };
      });
    }

    return updatedEntities;
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
    const targetObjectMetadataId =
      this.internalContext.objectIdByNameSingular[targetObjectName];

    if (!isDefined(targetObjectMetadataId)) {
      throw new TwentyOrmException(
        `Target object metadata not found for ${targetObjectName}`,
        TwentyOrmExceptionCode.MALFORMED_METADATA,
      );
    }

    const targetQueryBuilder = this.repository
      .getRepositoryForObjectMetadataId(targetObjectMetadataId)
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
