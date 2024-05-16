import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { CommentWorkspaceEntity } from 'src/modules/activity/standard-objects/comment.workspace-entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { WorkspaceMemberDeleteManyPreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-delete-many.pre-query.hook';
import { WorkspaceMemberDeleteOnePreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-delete-one.pre-query.hook';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      AttachmentWorkspaceEntity,
      CommentWorkspaceEntity,
    ]),
  ],
  providers: [
    {
      provide: WorkspaceMemberDeleteOnePreQueryHook.name,
      useClass: WorkspaceMemberDeleteOnePreQueryHook,
    },
    {
      provide: WorkspaceMemberDeleteManyPreQueryHook.name,
      useClass: WorkspaceMemberDeleteManyPreQueryHook,
    },
  ],
})
export class WorkspaceMemberQueryHookModule {}
