import { Module } from '@nestjs/common';
import { WorkspaceService } from './services/workspace.service';
import { WorkspaceMemberService } from './services/workspace-member.service';
import { WorkspaceMemberResolver } from './resolvers/workspace-member.resolver';
import { WorkspaceMemberRelationsResolver } from './resolvers/workspace-member-relations.resolver';

@Module({
  providers: [
    WorkspaceService,
    WorkspaceMemberService,
    WorkspaceMemberResolver,
    WorkspaceMemberRelationsResolver,
  ],
  exports: [WorkspaceService, WorkspaceMemberService],
})
export class WorkspaceModule {}
