import { FieldMetadataType } from 'twenty-shared';

import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { VIEW_GROUP_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.viewGroup,
  namePlural: 'viewGroups',
  labelSingular: 'View Group',
  labelPlural: 'View Groups',
  description: '(System) View Groups',
  icon: STANDARD_OBJECT_ICONS.viewGroup,
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class ViewGroupWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: VIEW_GROUP_STANDARD_FIELD_IDS.fieldMetadataId,
    type: FieldMetadataType.UUID,
    label: 'Field Metadata Id',
    description: 'View Group target field',
    icon: 'IconTag',
  })
  fieldMetadataId: string;

  @WorkspaceField({
    standardId: VIEW_GROUP_STANDARD_FIELD_IDS.isVisible,
    type: FieldMetadataType.BOOLEAN,
    label: 'Visible',
    description: 'View Group visibility',
    icon: 'IconEye',
    defaultValue: true,
  })
  isVisible: boolean;

  @WorkspaceField({
    standardId: VIEW_GROUP_STANDARD_FIELD_IDS.fieldValue,
    type: FieldMetadataType.TEXT,
    label: 'Field Value',
    description: 'Group by this field value',
  })
  fieldValue: string;

  @WorkspaceField({
    standardId: VIEW_GROUP_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.NUMBER,
    label: 'Position',
    description: 'View Field position',
    icon: 'IconList',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceRelation({
    standardId: VIEW_GROUP_STANDARD_FIELD_IDS.view,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'View',
    description: 'View Group related view',
    icon: 'IconLayoutCollage',
    inverseSideTarget: () => ViewWorkspaceEntity,
    inverseSideFieldKey: 'viewGroups',
  })
  @WorkspaceIsNullable()
  view?: ViewWorkspaceEntity | null;

  @WorkspaceJoinColumn('view')
  viewId: string | null;
}
