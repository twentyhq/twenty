import { Module } from '@nestjs/common';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { CommentWorkspaceEntity } from 'src/modules/activity/standard-objects/comment.workspace-entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { WorkspaceMemberDeleteManyPreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-delete-many.pre-query.hook';
import { WorkspaceMemberDeleteOnePreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-delete-one.pre-query.hook';

@Module({
  imports: [
    TwentyORMModule.forFeature([
      AttachmentWorkspaceEntity,
      CommentWorkspaceEntity,
    ]),
  ],
  providers: [
    WorkspaceMemberDeleteOnePreQueryHook,
    WorkspaceMemberDeleteManyPreQueryHook,
  ],
})
export class WorkspaceMemberQueryHookModule {}
