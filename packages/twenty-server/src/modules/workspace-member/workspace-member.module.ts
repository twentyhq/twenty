import { Module } from '@nestjs/common';

import { FileModule } from 'src/engine/core-modules/file/file.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceMemberAvatarFileDeletionListener } from 'src/modules/workspace-member/listeners/workspace-member-avatar-file-deletion.listener';

@Module({
  imports: [FileModule, UserWorkspaceModule],

  providers: [WorkspaceMemberAvatarFileDeletionListener],
})
export class WorkspaceMemberModule {}
