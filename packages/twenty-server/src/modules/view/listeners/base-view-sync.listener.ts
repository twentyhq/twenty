import { Inject, Injectable, Logger } from '@nestjs/common';

import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/modules/view/views.exception';

type EntityWithId = { id: string };

type SyncOperations<T extends EntityWithId> = {
  create: (workspaceId: string, entity: T) => Promise<void>;
  update: (
    workspaceId: string,
    entity: T,
    diff?: Partial<ObjectRecordDiff<T>>,
  ) => Promise<void>;
  delete: (workspaceId: string, entity: Pick<T, 'id'>) => Promise<void>;
  destroy: (workspaceId: string, entity: Pick<T, 'id'>) => Promise<void>;
  restore: (workspaceId: string, entity: Pick<T, 'id'>) => Promise<void>;
};

@Injectable()
export abstract class BaseViewSyncListener<T extends EntityWithId> {
  @Inject(FeatureFlagService)
  protected readonly featureFlagService: FeatureFlagService;

  @Inject(ExceptionHandlerService)
  protected readonly exceptionHandlerService: ExceptionHandlerService;

  protected readonly logger: Logger;

  constructor(
    protected readonly syncOperations: SyncOperations<T>,
    loggerName: string,
    protected readonly entityTypeName: string,
  ) {
    this.logger = new Logger(loggerName);
  }

  protected async handleCreated(
    batchEvent: WorkspaceEventBatch<ObjectRecordCreateEvent<T>>,
  ): Promise<void> {
    const isEnabled = await this.isFeatureFlagEnabled(batchEvent.workspaceId);

    if (!isEnabled) {
      return;
    }

    for (const event of batchEvent.events) {
      try {
        await this.syncOperations.create(
          batchEvent.workspaceId,
          event.properties.after,
        );
      } catch (error) {
        this.captureException(
          error,
          batchEvent.workspaceId,
          'create',
          event.properties.after.id,
        );
      }
    }
  }

  protected async handleUpdated(
    batchEvent: WorkspaceEventBatch<ObjectRecordUpdateEvent<T>>,
  ): Promise<void> {
    const isEnabled = await this.isFeatureFlagEnabled(batchEvent.workspaceId);

    if (!isEnabled) {
      return;
    }

    for (const event of batchEvent.events) {
      try {
        await this.syncOperations.update(
          batchEvent.workspaceId,
          event.properties.after,
          event.properties.diff,
        );
      } catch (error) {
        this.captureException(
          error,
          batchEvent.workspaceId,
          'update',
          event.properties.after.id,
        );
      }
    }
  }

  protected async handleDeleted(
    batchEvent: WorkspaceEventBatch<ObjectRecordDeleteEvent<T>>,
  ): Promise<void> {
    const isEnabled = await this.isFeatureFlagEnabled(batchEvent.workspaceId);

    if (!isEnabled) {
      return;
    }

    for (const event of batchEvent.events) {
      try {
        await this.syncOperations.delete(
          batchEvent.workspaceId,
          event.properties.before,
        );
      } catch (error) {
        this.captureException(
          error,
          batchEvent.workspaceId,
          'delete',
          event.properties.before.id,
        );
      }
    }
  }

  protected async handleDestroyed(
    batchEvent: WorkspaceEventBatch<ObjectRecordDestroyEvent<T>>,
  ): Promise<void> {
    const isEnabled = await this.isFeatureFlagEnabled(batchEvent.workspaceId);

    if (!isEnabled) {
      return;
    }

    for (const event of batchEvent.events) {
      try {
        await this.syncOperations.destroy(
          batchEvent.workspaceId,
          event.properties.before,
        );
      } catch (error) {
        this.captureException(
          error,
          batchEvent.workspaceId,
          'destroy',
          event.properties.before.id,
        );
      }
    }
  }

  protected async handleRestored(
    batchEvent: WorkspaceEventBatch<ObjectRecordRestoreEvent<T>>,
  ): Promise<void> {
    const isEnabled = await this.isFeatureFlagEnabled(batchEvent.workspaceId);

    if (!isEnabled) {
      return;
    }

    for (const event of batchEvent.events) {
      try {
        await this.syncOperations.restore(
          batchEvent.workspaceId,
          event.properties.after,
        );
      } catch (error) {
        this.captureException(
          error,
          batchEvent.workspaceId,
          'restore',
          event.properties.after.id,
        );
      }
    }
  }

  private async isFeatureFlagEnabled(workspaceId: string): Promise<boolean> {
    const featureFlags =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspaceId);

    return featureFlags.IS_CORE_VIEW_SYNCING_ENABLED;
  }

  private captureException(
    error: Error,
    workspaceId: string,
    operation: string,
    entityId: string,
  ) {
    const viewException = new ViewException(
      `Failed to sync ${this.entityTypeName} ${entityId} to core: ${error.message}`,
      ViewExceptionCode.CORE_VIEW_SYNC_ERROR,
    );

    this.exceptionHandlerService.captureExceptions([viewException], {
      workspace: {
        id: workspaceId,
      },
      additionalData: {
        entityId: entityId,
        entityType: this.entityTypeName,
        operation: operation,
      },
    });
  }
}
