import { Module } from '@nestjs/common';

import { WorkspaceMemberService } from 'src/workspace/messaging/repositories/workspace-member/workspace-member.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

// TODO: Move outside of the messaging module
@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [WorkspaceMemberService],
  exports: [WorkspaceMemberService],
})
export class WorkspaceMemberModule {}
