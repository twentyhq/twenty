import { Injectable } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { ViewSortSyncService } from 'src/modules/view/services/view-sort-sync.service';
import { ViewSortWorkspaceEntity } from 'src/modules/view/standard-objects/view-sort.workspace-entity';

import { BaseViewSyncListener } from './base-view-sync.listener';

@Injectable()
export class ViewSortListener extends BaseViewSyncListener<ViewSortWorkspaceEntity> {
  constructor(viewSortSyncService: ViewSortSyncService) {
    super(
      {
        create:
          viewSortSyncService.createCoreViewSort.bind(viewSortSyncService),
        update:
          viewSortSyncService.updateCoreViewSort.bind(viewSortSyncService),
        delete:
          viewSortSyncService.deleteCoreViewSort.bind(viewSortSyncService),
        destroy:
          viewSortSyncService.destroyCoreViewSort.bind(viewSortSyncService),
        restore:
          viewSortSyncService.restoreCoreViewSort.bind(viewSortSyncService),
      },
      ViewSortListener.name,
      'view sort',
    );
  }

  @OnDatabaseBatchEvent('viewSort', DatabaseEventAction.CREATED)
  async handleViewSortCreated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordCreateEvent<ViewSortWorkspaceEntity>
    >,
  ) {
    return this.handleCreated(batchEvent);
  }

  @OnDatabaseBatchEvent('viewSort', DatabaseEventAction.UPDATED)
  async handleViewSortUpdated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<ViewSortWorkspaceEntity>
    >,
  ) {
    return this.handleUpdated(batchEvent);
  }

  @OnDatabaseBatchEvent('viewSort', DatabaseEventAction.DELETED)
  async handleViewSortDeleted(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<ViewSortWorkspaceEntity>
    >,
  ) {
    return this.handleDeleted(batchEvent);
  }

  @OnDatabaseBatchEvent('viewSort', DatabaseEventAction.DESTROYED)
  async handleViewSortDestroyed(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDestroyEvent<ViewSortWorkspaceEntity>
    >,
  ) {
    return this.handleDestroyed(batchEvent);
  }

  @OnDatabaseBatchEvent('viewSort', DatabaseEventAction.RESTORED)
  async handleViewSortRestored(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordRestoreEvent<ViewSortWorkspaceEntity>
    >,
  ) {
    return this.handleRestored(batchEvent);
  }
}
