import { Injectable } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { ViewFilterSyncService } from 'src/modules/view/services/view-filter-sync.service';
import { ViewFilterWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter.workspace-entity';

import { BaseViewSyncListener } from './base-view-sync.listener';

@Injectable()
export class ViewFilterListener extends BaseViewSyncListener<ViewFilterWorkspaceEntity> {
  constructor(viewFilterSyncService: ViewFilterSyncService) {
    super(
      {
        create: viewFilterSyncService.createCoreViewFilter.bind(
          viewFilterSyncService,
        ),
        update: viewFilterSyncService.updateCoreViewFilter.bind(
          viewFilterSyncService,
        ),
        delete: viewFilterSyncService.deleteCoreViewFilter.bind(
          viewFilterSyncService,
        ),
        destroy: viewFilterSyncService.destroyCoreViewFilter.bind(
          viewFilterSyncService,
        ),
        restore: viewFilterSyncService.restoreCoreViewFilter.bind(
          viewFilterSyncService,
        ),
      },
      ViewFilterListener.name,
      'view filter',
    );
  }

  @OnDatabaseBatchEvent('viewFilter', DatabaseEventAction.CREATED)
  async handleViewFilterCreated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordCreateEvent<ViewFilterWorkspaceEntity>
    >,
  ) {
    return this.handleCreated(batchEvent);
  }

  @OnDatabaseBatchEvent('viewFilter', DatabaseEventAction.UPDATED)
  async handleViewFilterUpdated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<ViewFilterWorkspaceEntity>
    >,
  ) {
    return this.handleUpdated(batchEvent);
  }

  @OnDatabaseBatchEvent('viewFilter', DatabaseEventAction.DELETED)
  async handleViewFilterDeleted(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<ViewFilterWorkspaceEntity>
    >,
  ) {
    return this.handleDeleted(batchEvent);
  }

  @OnDatabaseBatchEvent('viewFilter', DatabaseEventAction.DESTROYED)
  async handleViewFilterDestroyed(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDestroyEvent<ViewFilterWorkspaceEntity>
    >,
  ) {
    return this.handleDestroyed(batchEvent);
  }

  @OnDatabaseBatchEvent('viewFilter', DatabaseEventAction.RESTORED)
  async handleViewFilterRestored(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordRestoreEvent<ViewFilterWorkspaceEntity>
    >,
  ) {
    return this.handleRestored(batchEvent);
  }
}
