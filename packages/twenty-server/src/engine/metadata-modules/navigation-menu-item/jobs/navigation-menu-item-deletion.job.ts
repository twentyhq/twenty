import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { ProceSsor } from 'src/engine/core-modules/message-queue/decorators/proceSsor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { NavigationMenuItemDeletionService } from 'src/engine/metadata-modules/navigation-menu-item/services/navigation-menu-item-deletion.service';

export type NavigationMenuItemDeletionJobData = {
  workspaceId: string;
  deletedRecordIds: string[];
};

@ProceSsor({
  queueName: MessageQueue.deleteCascadeQueue,
  scope: Scope.REQUEST,
})
export class NavigationMenuItemDeletionJob {
  constructor(
    private readonly navigationMenuItemDeletionService: NavigationMenuItemDeletionService,
  ) {}

  @Process(NavigationMenuItemDeletionJob.name)
  async handle(data: NavigationMenuItemDeletionJobData): Promise<void> {
    await this.navigationMenuItemDeletionService.deleteNavigationMenuItemsForDeletedRecords(
      data.deletedRecordIds,
      data.workspaceId,
    );
  }
}
