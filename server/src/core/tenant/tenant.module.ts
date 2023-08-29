import { Module } from '@nestjs/common';

import { AuthModule } from 'src/core/auth/auth.module';
import { WorkspaceModule } from 'src/core/workspace/workspace.module';

@Module({
  imports: [AuthModule, WorkspaceModule],
  exports: [WorkspaceModule],
})
export class TenantModule {}
