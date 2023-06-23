import { Module } from '@nestjs/common';
import { WorkspaceService } from './services/workspace.service';
import { WorkspaceMemberService } from './services/workspace-member.service';

@Module({
  providers: [WorkspaceService, WorkspaceMemberService],
  exports: [WorkspaceService, WorkspaceMemberService],
})
export class WorkspaceModule {}
