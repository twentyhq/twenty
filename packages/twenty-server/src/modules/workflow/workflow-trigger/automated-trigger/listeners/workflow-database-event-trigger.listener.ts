import { Injectable, Logger } from '@nestjs/common';

import {
  ObjectRecordEvent,
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordDestroyEvent,
  type ObjectRecordUpdateEvent,
  type ObjectRecordUpsertEvent,
} from 'twenty-shared/database-events';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, Raw } from 'typeorm';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import {
  AutomatedTriggerType,
  type WorkflowAutomatedTriggerWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import {
  type UpdateEventTriggerSettings,
  type UpsertEventTriggerSettings,
} from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
import {
  WorkflowTriggerJob,
  type WorkflowTriggerJobData,
} from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';

@Injectable()
export class WorkflowDatabaseEventTriggerListener {
  private readonly logger = new Logger(
    WorkflowDatabaseEventTriggerListener.name,
  );

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  @OnDatabaseBatchEvent('*', DatabaseEventAction.CREATED)
  async handleObjectRecordCreateEvent(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    if (await this.shouldIgnoreEvent(payload)) {
      return;
    }

    const clonedPayload = structuredClone(payload);

    await this.enrichCreatedEvent(clonedPayload);
    await this.handleEvent({
      payload: clonedPayload,
      action: DatabaseEventAction.CREATED,
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPDATED)
  async handleObjectRecordUpdateEvent(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent>,
  ) {
    if (await this.shouldIgnoreEvent(payload)) {
      return;
    }

    const clonedPayload = structuredClone(payload);

    await this.enrichUpdatedEvent(clonedPayload);

    await this.handleEvent({
      payload: clonedPayload,
      action: DatabaseEventAction.UPDATED,
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DELETED)
  async handleObjectRecordDeleteEvent(
    payload: WorkspaceEventBatch<ObjectRecordDeleteEvent>,
  ) {
    if (await this.shouldIgnoreEvent(payload)) {
      return;
    }

    const clonedPayload = structuredClone(payload);

    await this.enrichDeletedEvent(clonedPayload);
    await this.handleEvent({
      payload: clonedPayload,
      action: DatabaseEventAction.DELETED,
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DESTROYED)
  async handleObjectRecordDestroyEvent(
    payload: WorkspaceEventBatch<ObjectRecordDestroyEvent>,
  ) {
    if (await this.shouldIgnoreEvent(payload)) {
      return;
    }

    const clonedPayload = structuredClone(payload);

    await this.enrichDestroyedEvent(clonedPayload);
    await this.handleEvent({
      payload: clonedPayload,
      action: DatabaseEventAction.DESTROYED,
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPSERTED)
  async handleObjectRecordUpsertEvent(
    payload: WorkspaceEventBatch<ObjectRecordUpsertEvent>,
  ) {
    if (await this.shouldIgnoreEvent(payload)) {
      return;
    }

    const clonedPayload = structuredClone(payload);

    await this.handleEvent({
      payload: clonedPayload,
      action: DatabaseEventAction.UPSERTED,
    });
  }

  private async enrichCreatedEvent(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    const workspaceId = payload.workspaceId;
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
      payload.objectMetadata.nameSingular,
      workspaceId,
    );

    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.after),
      workspaceId,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
  }

  private async enrichUpdatedEvent(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent>,
  ) {
    const workspaceId = payload.workspaceId;
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
      payload.objectMetadata.nameSingular,
      workspaceId,
    );

    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.before),
      workspaceId,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.after),
      workspaceId,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
  }

  private async enrichDeletedEvent(
    payload: WorkspaceEventBatch<ObjectRecordDeleteEvent>,
  ) {
    const workspaceId = payload.workspaceId;
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
      payload.objectMetadata.nameSingular,
      workspaceId,
    );

    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.before),
      workspaceId,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
  }

  private async enrichDestroyedEvent(
    payload: WorkspaceEventBatch<ObjectRecordDestroyEvent>,
  ) {
    const workspaceId = payload.workspaceId;
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
      payload.objectMetadata.nameSingular,
      workspaceId,
    );

    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.before),
      workspaceId,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
  }

  private async enrichRecordsWithRelations({
    records,
    workspaceId,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    records: Partial<ObjectRecord>[];
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const { fieldIdByJoinColumnName } = buildFieldMapsFromFlatObjectMetadata(
        flatFieldMetadataMaps,
        flatObjectMetadata,
      );

      for (const [joinColumnName, joinFieldId] of Object.entries(
        fieldIdByJoinColumnName,
      )) {
        const joinField = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityMaps: flatFieldMetadataMaps,
          flatEntityId: joinFieldId,
        });

        const joinRecordIds = records
          .map((record) => record[joinColumnName])
          .filter(isDefined);

        if (joinRecordIds.length === 0) {
          continue;
        }

        const relatedObjectMetadataId =
          joinField.relationTargetObjectMetadataId;

        if (!isDefined(relatedObjectMetadataId)) {
          continue;
        }

        const relatedObjectMetadataNameSingular =
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: relatedObjectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          })?.nameSingular;

        if (!isDefined(relatedObjectMetadataNameSingular)) {
          continue;
        }

        const relatedObjectRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            relatedObjectMetadataNameSingular,
            { shouldBypassPermissionChecks: true },
          );

        const relatedRecords = await relatedObjectRepository.find({
          where: { id: In(joinRecordIds) },
        });

        for (const record of records) {
          record[joinField.name] = relatedRecords.find(
            (relatedRecord) => relatedRecord.id === record[joinColumnName],
          );
        }
      }
    }, authContext);
  }

  private async shouldIgnoreEvent(
    payload: WorkspaceEventBatch<ObjectRecordEvent>,
  ) {
    const workspaceId = payload.workspaceId;
    const databaseEventName = payload.name;

    if (!workspaceId || !databaseEventName) {
      this.logger.warn(
        `Ignoring database event batch with missing metadata (workspaceId=${workspaceId}, eventName=${databaseEventName}, eventsCount=${payload.events.length})`,
      );

      return true;
    }

    return false;
  }

  private async handleEvent({
    payload,
    action,
  }: {
    payload: WorkspaceEventBatch<ObjectRecordEvent>;
    action: DatabaseEventAction;
  }) {
    const workspaceId = payload.workspaceId;
    const databaseEventName = payload.name;
    const automatedTriggerTableName = 'workflowAutomatedTrigger';

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowAutomatedTriggerRepository =
        await this.globalWorkspaceOrmManager.getRepository<WorkflowAutomatedTriggerWorkspaceEntity>(
          workspaceId,
          automatedTriggerTableName,
          { shouldBypassPermissionChecks: true },
        );

      const eventListeners = await workflowAutomatedTriggerRepository.find({
        where: {
          type: AutomatedTriggerType.DATABASE_EVENT,
          settings: Raw(
            () =>
              `"${automatedTriggerTableName}"."settings"->>'eventName' = :eventName`,
            { eventName: databaseEventName },
          ),
        },
      });

      let matchedEventCount = 0;
      let filteredEventCount = 0;
      let enqueuedJobCount = 0;

      for (const eventListener of eventListeners) {
        for (const eventPayload of payload.events) {
          matchedEventCount += 1;

          const shouldTriggerJob = this.shouldTriggerJob({
            eventPayload,
            eventListener,
            action,
          });

          if (!shouldTriggerJob) {
            filteredEventCount += 1;

            continue;
          }

          enqueuedJobCount += 1;

          await this.messageQueueService.add<WorkflowTriggerJobData>(
            WorkflowTriggerJob.name,
            {
              workspaceId,
              workflowId: eventListener.workflowId,
              payload: eventPayload,
            },
            { retryLimit: 3 },
          );
        }
      }

      if (
        payload.events.length > 0 &&
        eventListeners.length > 0 &&
        enqueuedJobCount === 0
      ) {
        this.logger.warn(
          `Database event batch produced no workflow jobs (workspaceId=${workspaceId}, eventName=${databaseEventName}, action=${action}, listeners=${eventListeners.length}, events=${payload.events.length}, matched=${matchedEventCount}, filtered=${filteredEventCount})`,
        );
      }
    }, authContext);
  }

  private shouldTriggerJob({
    eventPayload,
    eventListener,
    action,
  }: {
    eventPayload: ObjectRecordEvent;
    eventListener: WorkflowAutomatedTriggerWorkspaceEntity;
    action: DatabaseEventAction;
  }) {
    if (action === DatabaseEventAction.UPDATED) {
      const settings = eventListener.settings as UpdateEventTriggerSettings;
      const updateEventPayload = eventPayload as ObjectRecordUpdateEvent;

      return this.shouldTriggerJobForFieldFilteredEvent({
        fields: settings.fields,
        eventPayload: updateEventPayload,
      });
    }

    if (action === DatabaseEventAction.UPSERTED) {
      const settings = eventListener.settings as UpsertEventTriggerSettings;
      const upsertEventPayload = eventPayload as ObjectRecordUpsertEvent;

      return this.shouldTriggerJobForFieldFilteredEvent({
        fields: settings.fields,
        eventPayload: upsertEventPayload,
      });
    }

    return true;
  }

  private shouldTriggerJobForFieldFilteredEvent({
    fields,
    eventPayload,
  }: {
    fields?: string[];
    eventPayload: ObjectRecordUpdateEvent | ObjectRecordUpsertEvent;
  }) {
    if (!isNonEmptyArray(fields)) {
      return true;
    }

    const updatedFields = eventPayload.properties.updatedFields ?? [];

    if (
      this.hasIntersection({
        left: fields,
        right: updatedFields,
      })
    ) {
      return true;
    }

    return fields.some((field) =>
      this.didFieldValueChange({
        field,
        before: eventPayload.properties.before as Record<string, unknown>,
        after: eventPayload.properties.after as Record<string, unknown>,
      }),
    );
  }

  private hasIntersection({
    left,
    right,
  }: {
    left: string[];
    right: string[];
  }) {
    const normalizedRight = new Set(
      right.map((field) => field.trim().toLowerCase()),
    );

    return left.some((field) =>
      normalizedRight.has(field.trim().toLowerCase()),
    );
  }

  private didFieldValueChange({
    field,
    before,
    after,
  }: {
    field: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  }) {
    if (!before || !after) {
      return false;
    }

    return !Object.is(before[field], after[field]);
  }
}
