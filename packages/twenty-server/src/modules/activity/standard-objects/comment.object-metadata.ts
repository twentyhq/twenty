import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { COMMENT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { ActivityObjectMetadata } from 'src/modules/activity/standard-objects/activity.object-metadata';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import { IsNotAuditLogged } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-not-audit-logged.decorator';

@ObjectMetadata({
  standardId: STANDARD_OBJECT_IDS.comment,
  namePlural: 'comments',
  labelSingular: 'Comment',
  labelPlural: 'Comments',
  description: 'A comment',
  icon: 'IconMessageCircle',
})
@IsSystem()
@IsNotAuditLogged()
export class CommentObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: COMMENT_STANDARD_FIELD_IDS.body,
    type: FieldMetadataType.TEXT,
    label: 'Body',
    description: 'Comment body',
    icon: 'IconLink',
  })
  body: string;

  @FieldMetadata({
    standardId: COMMENT_STANDARD_FIELD_IDS.author,
    type: FieldMetadataType.RELATION,
    label: 'Author',
    description: 'Comment author',
    icon: 'IconCircleUser',
    joinColumn: 'authorId',
  })
  author: Relation<WorkspaceMemberObjectMetadata>;

  @FieldMetadata({
    standardId: COMMENT_STANDARD_FIELD_IDS.activity,
    type: FieldMetadataType.RELATION,
    label: 'Activity',
    description: 'Comment activity',
    icon: 'IconNotes',
    joinColumn: 'activityId',
  })
  activity: Relation<ActivityObjectMetadata>;
}
