import { Injectable, Logger } from '@nestjs/common';

import { In, ObjectLiteral, type FindOptionsWhere } from 'typeorm';

import { type ObjectRecordNonDestructiveEvent } from 'src/engine/core-modules/event-emitter/types/object-record-non-destructive-event';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { VirtualFieldComputationService } from 'src/modules/virtual-fields/services/virtual-field-computation.service';
import { VirtualFieldDiscoveryService } from 'src/modules/virtual-fields/services/virtual-field-discovery.service';
import { VirtualFieldEntityResolver } from 'src/modules/virtual-fields/services/virtual-field-entity-resolver.service';
import { VirtualFieldsBatchUpdateService } from 'src/modules/virtual-fields/services/virtual-fields-batch-update.service';
import { PrimitiveValue } from 'src/modules/virtual-fields/types/PrimitiveValue';
import { type VirtualField } from 'src/modules/virtual-fields/types/VirtualField';
import { extractVirtualFieldDependencies } from 'src/modules/virtual-fields/utils/extract-virtual-field-dependencies.util';

export type ProcessEventsParams = {
  events: ObjectRecordNonDestructiveEvent[];
  workspaceId: string;
};

type VirtualFieldMetadata = {
  fieldName: string;
  virtualField: VirtualField;
  objectMetadataId: string;
};

type BatchUpdateOperation = {
  entityId: string;
  fieldName: string;
  value: PrimitiveValue;
};

@Injectable()
export class VirtualFieldProcessor {
  private readonly logger = new Logger(VirtualFieldProcessor.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly virtualFieldDiscoveryService: VirtualFieldDiscoveryService,
    private readonly batchUpdateService: VirtualFieldsBatchUpdateService,
    private readonly entityResolver: VirtualFieldEntityResolver,
    private readonly computationService: VirtualFieldComputationService,
  ) {}

  async processEventsForComputedFields(
    params: ProcessEventsParams,
  ): Promise<void> {
    const { events, workspaceId } = params;

    this.logger.debug('Processing events for computed fields - entry point', {
      workspaceId,
      eventCount: events.length,
    });

    if (events.length === 0) {
      return;
    }

    const objectMetadataMaps = await this.getObjectMetadataMaps(workspaceId);
    const allVirtualFields =
      await this.virtualFieldDiscoveryService.getAllVirtualFields(workspaceId);
    const dependencyIndex = this.buildDependencyIndex(
      allVirtualFields,
      objectMetadataMaps,
    );

    const eventsWithAffectedVirtualFields = this.filterEventsWithVirtualFields(
      events,
      dependencyIndex,
    );

    if (eventsWithAffectedVirtualFields.length === 0) {
      this.logger.debug('No events affect virtual fields', {
        workspaceId,
        totalEvents: events.length,
      });

      return;
    }

    this.logger.log('Processing events for computed fields', {
      workspaceId,
      totalEvents: events.length,
      eventsWithAffectedVirtualFields: eventsWithAffectedVirtualFields.length,
    });

    await this.processEventBatch(
      eventsWithAffectedVirtualFields,
      dependencyIndex,
      objectMetadataMaps,
      workspaceId,
    );
  }

  async processAllRecordsForEntity(
    objectMetadataId: string,
    workspaceId: string,
  ): Promise<void> {
    this.logger.log('Processing all records for entity virtual fields', {
      objectMetadataId,
      workspaceId,
    });

    const objectMetadataMaps = await this.getObjectMetadataMaps(workspaceId);
    const virtualFields = await this.getVirtualFieldsForEntity(
      objectMetadataId,
      workspaceId,
    );

    if (virtualFields.length === 0) {
      this.logger.debug('No virtual fields found for object', {
        objectMetadataId,
      });

      return;
    }

    const repository = await this.getRepositoryForEntity(
      objectMetadataId,
      workspaceId,
    );

    const allRecords = await repository.find({ select: ['id'] });

    this.logger.log('Processing virtual fields for all entity records', {
      objectMetadataId,
      recordCount: allRecords.length,
      virtualFieldCount: virtualFields.length,
    });

    const batchUpdateOperations = await this.computeFieldsForAllRecords(
      allRecords,
      virtualFields,
      objectMetadataMaps,
      workspaceId,
    );

    if (batchUpdateOperations.length > 0) {
      await this.batchUpdateService.executeBatchUpdates(
        repository,
        batchUpdateOperations,
      );

      this.logger.log('Completed initial virtual field calculations', {
        objectMetadataId,
        processedRecords: allRecords.length,
        updatedFields: batchUpdateOperations.length,
      });
    }
  }

  private async getObjectMetadataMaps(
    workspaceId: string,
  ): Promise<ObjectMetadataMaps> {
    const objectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMapsOrThrow(
        workspaceId,
      );

    this.logger.log('Retrieved object metadata maps', {
      workspaceId,
      objectCount: Object.keys(objectMetadataMaps.byId).length,
    });

    return objectMetadataMaps;
  }

  private buildDependencyIndex(
    allVirtualFields: VirtualFieldMetadata[],
    objectMetadataMaps: ObjectMetadataMaps,
  ): Map<string, VirtualFieldMetadata[]> {
    const dependencyIndex = new Map<string, VirtualFieldMetadata[]>();

    for (const virtualField of allVirtualFields) {
      const dependencies = extractVirtualFieldDependencies(
        virtualField.virtualField,
        objectMetadataMaps,
      );

      for (const dependency of dependencies) {
        if (!dependencyIndex.has(dependency)) {
          dependencyIndex.set(dependency, []);
        }
        dependencyIndex.get(dependency)!.push(virtualField);
      }
    }

    return dependencyIndex;
  }

  private filterEventsWithVirtualFields(
    events: ObjectRecordNonDestructiveEvent[],
    dependencyIndex: Map<string, VirtualFieldMetadata[]>,
  ): ObjectRecordNonDestructiveEvent[] {
    return events.filter((event) => {
      const affectedFields =
        dependencyIndex.get(event.objectMetadata.nameSingular) || [];

      return affectedFields.length > 0;
    });
  }

  private getAffectedVirtualFieldsForEvent(
    event: ObjectRecordNonDestructiveEvent,
    dependencyIndex: Map<string, VirtualFieldMetadata[]>,
  ): VirtualFieldMetadata[] {
    return dependencyIndex.get(event.objectMetadata.nameSingular) || [];
  }

  private groupVirtualFieldsByTargetObject(
    virtualFields: VirtualFieldMetadata[],
  ): Map<string, VirtualFieldMetadata[]> {
    const grouped = new Map<string, VirtualFieldMetadata[]>();

    for (const virtualField of virtualFields) {
      const objectMetadataId = virtualField.objectMetadataId;

      if (!grouped.has(objectMetadataId)) {
        grouped.set(objectMetadataId, []);
      }
      grouped.get(objectMetadataId)!.push(virtualField);
    }

    return grouped;
  }

  private async processEventBatch(
    events: ObjectRecordNonDestructiveEvent[],
    dependencyIndex: Map<string, VirtualFieldMetadata[]>,
    objectMetadataMaps: ObjectMetadataMaps,
    workspaceId: string,
  ): Promise<void> {
    const eventsByObjectId = this.groupEventsByObjectId(events);

    for (const [objectId, objectEvents] of eventsByObjectId.entries()) {
      try {
        await this.processEventsForObjectType(
          objectEvents,
          objectId,
          dependencyIndex,
          objectMetadataMaps,
          workspaceId,
        );
      } catch (error) {
        this.logger.error('Error processing events for object type', {
          objectId,
          eventCount: objectEvents.length,
          error,
        });
      }
    }
  }

  private groupEventsByObjectId(
    events: ObjectRecordNonDestructiveEvent[],
  ): Map<string, ObjectRecordNonDestructiveEvent[]> {
    const eventsByObjectId = new Map<
      string,
      ObjectRecordNonDestructiveEvent[]
    >();

    for (const event of events) {
      const objectId = event.objectMetadata.id;

      if (!eventsByObjectId.has(objectId)) {
        eventsByObjectId.set(objectId, []);
      }
      eventsByObjectId.get(objectId)!.push(event);
    }

    return eventsByObjectId;
  }

  private async processEventsForObjectType(
    events: ObjectRecordNonDestructiveEvent[],
    objectMetadataId: string,
    dependencyIndex: Map<string, VirtualFieldMetadata[]>,
    objectMetadataMaps: ObjectMetadataMaps,
    workspaceId: string,
  ): Promise<void> {
    const eventObjectName = events[0]?.objectMetadata.nameSingular;

    if (!eventObjectName) {
      return;
    }

    const affectedVirtualFields = this.getAffectedVirtualFieldsForEvent(
      events[0],
      dependencyIndex,
    );

    if (affectedVirtualFields.length === 0) {
      this.logger.debug('No virtual fields affected by object changes', {
        objectMetadataId,
        eventObjectName,
      });

      return;
    }

    const fieldsToProcessByObject = this.groupVirtualFieldsByTargetObject(
      affectedVirtualFields,
    );

    for (const [
      targetObjectId,
      virtualFields,
    ] of fieldsToProcessByObject.entries()) {
      try {
        await this.processVirtualFieldsForEvents(
          events,
          virtualFields,
          objectMetadataMaps,
          workspaceId,
        );
      } catch (error) {
        this.logger.error('Error processing virtual fields for target object', {
          targetObjectId,
          fieldCount: virtualFields.length,
          error,
        });
      }
    }
  }

  private async processVirtualFieldsForEvents(
    events: ObjectRecordNonDestructiveEvent[],
    virtualFields: VirtualFieldMetadata[],
    objectMetadataMaps: ObjectMetadataMaps,
    workspaceId: string,
  ): Promise<void> {
    const entityName = this.getEntityNameForVirtualFields(virtualFields);
    const repository = await this.getRepositoryForEntityName(
      entityName,
      workspaceId,
    );

    const batchUpdateOperations: BatchUpdateOperation[] = [];

    for (const event of events) {
      try {
        const operations = await this.processEventForVirtualFields(
          event,
          virtualFields,
          objectMetadataMaps,
          workspaceId,
        );

        batchUpdateOperations.push(...operations);
      } catch (error) {
        this.logger.error('Error processing event for batch updates', {
          eventId: event.recordId,
          objectType: event.objectMetadata.nameSingular,
          error,
        });
      }
    }

    if (batchUpdateOperations.length > 0) {
      await this.batchUpdateService.executeBatchUpdates(
        repository,
        batchUpdateOperations,
      );
    }
  }

  private async processEventForVirtualFields(
    event: ObjectRecordNonDestructiveEvent,
    virtualFields: VirtualFieldMetadata[],
    objectMetadataMaps: ObjectMetadataMaps,
    workspaceId: string,
  ): Promise<BatchUpdateOperation[]> {
    const batchUpdateOperations: BatchUpdateOperation[] = [];

    const affectedEntityIds = this.entityResolver.getAffectedEntityIds(
      event,
      virtualFields,
      objectMetadataMaps,
    );

    if (affectedEntityIds.length === 0) {
      return batchUpdateOperations;
    }
    const entityName = this.getEntityNameForVirtualFields(virtualFields);
    const repository = await this.getRepositoryForEntityName(
      entityName,
      workspaceId,
    );

    const affectedEntities = await repository.findBy({
      id: In(affectedEntityIds),
    } as unknown as FindOptionsWhere<ObjectLiteral>);

    const entitiesMap = new Map<string, ObjectLiteral>();

    for (const entity of affectedEntities) {
      entitiesMap.set(entity.id, entity);
    }

    for (const entityId of affectedEntityIds) {
      const entityData = entitiesMap.get(entityId);

      if (!entityData) {
        this.logger.warn('Entity not found for virtual field computation', {
          entityId,
        });
        continue;
      }

      for (const field of virtualFields) {
        try {
          const operation = await this.computeFieldValueForEntity(
            field,
            entityId,
            workspaceId,
            objectMetadataMaps,
            entityData,
          );

          if (operation) {
            batchUpdateOperations.push(operation);
          }
        } catch (error) {
          this.logger.error('Error computing field value', {
            entityId,
            fieldName: field.fieldName,
            error,
          });
        }
      }
    }

    return batchUpdateOperations;
  }

  private async computeFieldValueForEntity(
    field: VirtualFieldMetadata,
    entityId: string,
    workspaceId: string,
    objectMetadataMaps: ObjectMetadataMaps,
    entityData: ObjectLiteral,
  ): Promise<BatchUpdateOperation | null> {
    const computedResult = await this.computationService.computeFieldValue({
      virtualField: field.virtualField,
      entityData,
      workspaceId,
      objectMetadataMaps,
    });

    const valueToStore =
      this.computationService.extractStorableValue(computedResult);

    return {
      entityId,
      fieldName: field.fieldName,
      value: valueToStore,
    };
  }

  private async getVirtualFieldsForEntity(
    objectMetadataId: string,
    workspaceId: string,
  ): Promise<VirtualFieldMetadata[]> {
    return this.virtualFieldDiscoveryService.getVirtualFieldsForObjectMetadata(
      objectMetadataId,
      workspaceId,
    );
  }

  private async getRepositoryForEntity(
    objectMetadataId: string,
    workspaceId: string,
  ) {
    const entityName =
      this.virtualFieldDiscoveryService.getEntityNameFromTarget(
        objectMetadataId,
      );

    return this.getRepositoryForEntityName(entityName, workspaceId);
  }

  private async getRepositoryForEntityName(
    entityName: string,
    workspaceId: string,
  ) {
    return this.twentyORMGlobalManager.getRepositoryForWorkspace(
      workspaceId,
      entityName,
      { shouldBypassPermissionChecks: true },
    );
  }

  private getEntityNameForVirtualFields(
    virtualFields: VirtualFieldMetadata[],
  ): string {
    return this.virtualFieldDiscoveryService.getEntityNameFromTarget(
      virtualFields[0].objectMetadataId,
    );
  }

  private async computeFieldsForAllRecords(
    allRecords: ObjectLiteral[],
    virtualFields: VirtualFieldMetadata[],
    objectMetadataMaps: ObjectMetadataMaps,
    workspaceId: string,
  ): Promise<BatchUpdateOperation[]> {
    const batchUpdateOperations: BatchUpdateOperation[] = [];

    const entitiesMap = new Map<string, ObjectLiteral>();

    for (const record of allRecords) {
      entitiesMap.set(record.id, record);
    }

    for (const record of allRecords) {
      for (const field of virtualFields) {
        try {
          const operation = await this.computeFieldValueForEntity(
            field,
            record.id,
            workspaceId,
            objectMetadataMaps,
            record,
          );

          if (operation) {
            batchUpdateOperations.push(operation);
          }
        } catch (error) {
          this.logger.error('Error computing initial field value', {
            entityId: record.id,
            fieldName: field.fieldName,
            error,
          });
        }
      }
    }

    return batchUpdateOperations;
  }
}
