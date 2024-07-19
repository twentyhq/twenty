import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { COMMENT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ActivityWorkspaceEntity } from 'src/modules/activity/standard-objects/activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.comment,
  namePlural: 'comments',
  labelSingular: 'Comment',
  labelPlural: 'Comments',
  description: 'A comment',
  icon: 'IconMessageCircle',
})
@WorkspaceIsSystem()
export class CommentWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: COMMENT_STANDARD_FIELD_IDS.body,
    type: FieldMetadataType.TEXT,
    label: 'Body',
    description: 'Comment body',
    icon: 'IconLink',
  })
  body: string;

  @WorkspaceRelation({
    standardId: COMMENT_STANDARD_FIELD_IDS.author,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Author',
    description: 'Comment author',
    icon: 'IconCircleUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'authoredComments',
  })
  author: Relation<WorkspaceMemberWorkspaceEntity>;

  @WorkspaceJoinColumn('author')
  authorId: string;

  @WorkspaceRelation({
    standardId: COMMENT_STANDARD_FIELD_IDS.activity,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Activity',
    description: 'Comment activity',
    icon: 'IconNotes',
    inverseSideTarget: () => ActivityWorkspaceEntity,
    inverseSideFieldKey: 'comments',
  })
  activity: Relation<ActivityWorkspaceEntity>;

  @WorkspaceJoinColumn('activity')
  activityId: string;
}
