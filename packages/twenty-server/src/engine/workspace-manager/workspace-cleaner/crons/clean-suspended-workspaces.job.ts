import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared';
import { Repository } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CleanerWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

@Processor(MessageQueue.cronQueue)
export class CleanSuspendedWorkspacesJob {
  constructor(
    private readonly cleanerWorkspaceService: CleanerWorkspaceService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  @Process(CleanSuspendedWorkspacesJob.name)
  async handle(): Promise<void> {
    const suspendedWorkspaceIds = await this.workspaceRepository.find({
      select: ['id'],
      where: {
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
      },
      withDeleted: true,
    });

    await this.cleanerWorkspaceService.batchWarnOrCleanSuspendedWorkspaces(
      suspendedWorkspaceIds.map((workspace) => workspace.id),
    );
  }
}
