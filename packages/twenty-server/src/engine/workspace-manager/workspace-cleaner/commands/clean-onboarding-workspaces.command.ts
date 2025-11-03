import { InjectRepository } from '@nestjs/typeorm';

import { Command, Option } from 'nest-commander';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, LessThan, Repository } from 'typeorm';

import {
  type MigrationCommandOptions,
  MigrationCommandRunner,
} from 'src/database/commands/command-runners/migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CleanerWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

@Command({
  name: 'workspace:clean:onboarding',
  description: 'Clean onboarding workspaces',
})
export class CleanOnboardingWorkspacesCommand extends MigrationCommandRunner {
  private workspaceIds: string[] = [];

  constructor(
    private readonly cleanerWorkspaceService: CleanerWorkspaceService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description:
      'workspace id. Command runs on all onboarding workspaces if not provided',
    required: false,
  })
  parseWorkspaceId(val: string): string[] {
    this.workspaceIds.push(val);

    return this.workspaceIds;
  }

  async fetchOnboardingWorkspaceIds(): Promise<string[]> {
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const onboardingWorkspaces = await this.workspaceRepository.find({
      select: ['id'],
      where: {
        activationStatus: In([
          WorkspaceActivationStatus.PENDING_CREATION,
          WorkspaceActivationStatus.ONGOING_CREATION,
        ]),
        createdAt: LessThan(sevenDaysAgo),
      },
      withDeleted: true,
    });

    return onboardingWorkspaces.map((workspace) => workspace.id);
  }

  override async runMigrationCommand(
    _passedParams: string[],
    options: MigrationCommandOptions,
  ): Promise<void> {
    const { dryRun } = options;

    const onboardingWorkspaceIds =
      this.workspaceIds.length > 0
        ? this.workspaceIds
        : await this.fetchOnboardingWorkspaceIds();

    this.logger.log(
      `${dryRun ? 'DRY RUN - ' : ''}Cleaning ${onboardingWorkspaceIds.length} onboarding workspaces`,
    );

    await this.cleanerWorkspaceService.batchCleanOnboardingWorkspaces(
      onboardingWorkspaceIds,
      dryRun,
    );
  }
}
