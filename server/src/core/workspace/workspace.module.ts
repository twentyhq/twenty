import { Module } from '@nestjs/common';
import { WorkspaceService } from './services/workspace.service';
import { WorkspaceMemberService } from './services/workspace-member.service';
import { WorkspaceMemberResolver } from './resolvers/workspace-member.resolver';
import { WorkspaceResolver } from './resolvers/workspace.resolver';
import { FileUploadService } from '../file/services/file-upload.service';

@Module({
  providers: [
    WorkspaceService,
    FileUploadService,
    WorkspaceMemberService,
    WorkspaceMemberResolver,
    WorkspaceResolver,
  ],
  exports: [WorkspaceService, WorkspaceMemberService],
})
export class WorkspaceModule {}
