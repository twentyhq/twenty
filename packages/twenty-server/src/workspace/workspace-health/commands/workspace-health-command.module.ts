import { Module } from '@nestjs/common';

import { WorkspaceHealthCommand } from 'src/workspace/workspace-health/commands/workspace-health.command';
import { WorkspaceHealthModule } from 'src/workspace/workspace-health/workspace-health.module';

@Module({
  imports: [WorkspaceHealthModule],
  providers: [WorkspaceHealthCommand],
})
export class WorkspaceHealthCommandModule {}
