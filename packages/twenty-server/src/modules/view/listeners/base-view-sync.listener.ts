import { Inject, Injectable, Logger } from '@nestjs/common';

import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';

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
        this.logger.error(
          `Failed to sync ${this.entityTypeName} ${event.properties.after.id} to core:`,
          error,
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
        this.logger.error(
          `Failed to sync ${this.entityTypeName} ${event.properties.after.id} to core:`,
          error,
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
        this.logger.error(
          `Failed to sync ${this.entityTypeName} ${event.properties.before.id} to core:`,
          error,
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
        this.logger.error(
          `Failed to sync ${this.entityTypeName} ${event.properties.before.id} to core:`,
          error,
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
        this.logger.error(
          `Failed to sync ${this.entityTypeName} ${event.properties.after.id} to core:`,
          error,
        );
      }
    }
  }

  private async isFeatureFlagEnabled(workspaceId: string): Promise<boolean> {
    const featureFlags =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspaceId);

    return featureFlags?.IS_CORE_VIEW_SYNCING_ENABLED ?? false;
  }
}
