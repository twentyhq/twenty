import { Module } from '@nestjs/common';

import { WorkspaceHealthCommand } from 'src/engine/workspace-manager/workspace-health/commands/workspace-health.command';
import { WorkspaceHealthModule } from 'src/engine/workspace-manager/workspace-health/workspace-health.module';

@Module({
  imports: [WorkspaceHealthModule],
  providers: [WorkspaceHealthCommand],
})
export class WorkspaceHealthCommandModule {}
