import { Module } from '@nestjs/common';

import { WorkspaceMemberService } from 'src/workspace/repositories/workspace-member/workspace-member.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [WorkspaceMemberService],
  exports: [WorkspaceMemberService],
})
export class WorkspaceMemberModule {}
