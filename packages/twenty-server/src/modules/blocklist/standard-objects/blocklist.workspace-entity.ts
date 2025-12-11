import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationOnDeleteAction } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { BLOCKLIST_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.blocklist,

  namePlural: 'blocklists',
  labelSingular: msg`Blocklist`,
  labelPlural: msg`Blocklists`,
  description: msg`Blocklist`,
  icon: STANDARD_OBJECT_ICONS.blocklist,
  labelIdentifierStandardId: BLOCKLIST_STANDARD_FIELD_IDS.handle,
})
@WorkspaceIsSystem()
export class BlocklistWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: BLOCKLIST_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: msg`Handle`,
    description: msg`Handle`,
    icon: 'IconAt',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  handle: string | null;

  @WorkspaceRelation({
    standardId: BLOCKLIST_STANDARD_FIELD_IDS.workspaceMember,
    type: RelationType.MANY_TO_ONE,
    label: msg`WorkspaceMember`,
    description: msg`WorkspaceMember`,
    icon: 'IconCircleUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'blocklist',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  workspaceMember: Relation<WorkspaceMemberWorkspaceEntity>;

  @WorkspaceJoinColumn('workspaceMember')
  workspaceMemberId: string;
}
