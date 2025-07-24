import { Injectable } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { ViewFilterGroupSyncService } from 'src/modules/view/services/view-filter-group-sync.service';
import { ViewFilterGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter-group.workspace-entity';

import { BaseViewSyncListener } from './base-view-sync.listener';

@Injectable()
export class ViewFilterGroupListener extends BaseViewSyncListener<ViewFilterGroupWorkspaceEntity> {
  constructor(viewFilterGroupSyncService: ViewFilterGroupSyncService) {
    super(
      {
        create: viewFilterGroupSyncService.createCoreViewFilterGroup.bind(
          viewFilterGroupSyncService,
        ),
        update: viewFilterGroupSyncService.updateCoreViewFilterGroup.bind(
          viewFilterGroupSyncService,
        ),
        delete: viewFilterGroupSyncService.deleteCoreViewFilterGroup.bind(
          viewFilterGroupSyncService,
        ),
        destroy: viewFilterGroupSyncService.destroyCoreViewFilterGroup.bind(
          viewFilterGroupSyncService,
        ),
        restore: viewFilterGroupSyncService.restoreCoreViewFilterGroup.bind(
          viewFilterGroupSyncService,
        ),
      },
      ViewFilterGroupListener.name,
      'view filter group',
    );
  }

  @OnDatabaseBatchEvent('viewFilterGroup', DatabaseEventAction.CREATED)
  async handleViewFilterGroupCreated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordCreateEvent<ViewFilterGroupWorkspaceEntity>
    >,
  ) {
    return this.handleCreated(batchEvent);
  }

  @OnDatabaseBatchEvent('viewFilterGroup', DatabaseEventAction.UPDATED)
  async handleViewFilterGroupUpdated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<ViewFilterGroupWorkspaceEntity>
    >,
  ) {
    return this.handleUpdated(batchEvent);
  }

  @OnDatabaseBatchEvent('viewFilterGroup', DatabaseEventAction.DELETED)
  async handleViewFilterGroupDeleted(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<ViewFilterGroupWorkspaceEntity>
    >,
  ) {
    return this.handleDeleted(batchEvent);
  }

  @OnDatabaseBatchEvent('viewFilterGroup', DatabaseEventAction.DESTROYED)
  async handleViewFilterGroupDestroyed(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDestroyEvent<ViewFilterGroupWorkspaceEntity>
    >,
  ) {
    return this.handleDestroyed(batchEvent);
  }

  @OnDatabaseBatchEvent('viewFilterGroup', DatabaseEventAction.RESTORED)
  async handleViewFilterGroupRestored(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordRestoreEvent<ViewFilterGroupWorkspaceEntity>
    >,
  ) {
    return this.handleRestored(batchEvent);
  }
}
