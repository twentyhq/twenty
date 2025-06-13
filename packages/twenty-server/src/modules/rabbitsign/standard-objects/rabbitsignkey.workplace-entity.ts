import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { RABBIT_SIGN_KEY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.rabbitSignKey,
  namePlural: 'rabbitSignKeys',
  labelSingular: msg`RabbitSign Key`,
  labelPlural: msg`RabbitSign Keys`,
  description: msg`RabbitSign Key`,
  icon: 'IconKey',
})
@WorkspaceIsSystem()
export class RabbitSignKeyWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: RABBIT_SIGN_KEY_STANDARD_FIELD_IDS.keyId,
    type: FieldMetadataType.TEXT,
    label: msg`Key ID`,
    description: msg`RabbitSign Key ID`,
    icon: 'IconKey',
  })
  keyId: string;

  @WorkspaceField({
    standardId: RABBIT_SIGN_KEY_STANDARD_FIELD_IDS.keySecret,
    type: FieldMetadataType.TEXT,
    label: msg`Key Secret`,
    description: msg`RabbitSign Key Secret`,
    icon: 'IconLock',
  })
  keySecret: string;

  @WorkspaceRelation({
    standardId: RABBIT_SIGN_KEY_STANDARD_FIELD_IDS.workspaceMember,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workspace Member`,
    description: msg`Workspace Member`,
    icon: 'IconCircleUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'rabbitSignKeys',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  workspaceMember: Relation<WorkspaceMemberWorkspaceEntity>;

  @WorkspaceJoinColumn('workspaceMember')
  workspaceMemberId: string;
}
