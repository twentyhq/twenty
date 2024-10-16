import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { VIEW_FIELD_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.viewField,
  namePlural: 'viewFields',
  labelSingular: 'View Field',
  labelPlural: 'View Fields',
  description: '(System) View Fields',
  icon: 'IconTag',
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
/*
TODO: add soon once we've confirmed it's stabled
@WorkspaceIndex(['fieldMetadataId', 'viewId'], {
  isUnique: true,
  indexWhereClause: '"deletedAt" IS NULL',
})*/
export class ViewFieldWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: VIEW_FIELD_STANDARD_FIELD_IDS.fieldMetadataId,
    type: FieldMetadataType.UUID,
    label: 'Field Metadata Id',
    description: 'View Field target field',
    icon: 'IconTag',
  })
  fieldMetadataId: string;

  @WorkspaceField({
    standardId: VIEW_FIELD_STANDARD_FIELD_IDS.isVisible,
    type: FieldMetadataType.BOOLEAN,
    label: 'Visible',
    description: 'View Field visibility',
    icon: 'IconEye',
    defaultValue: true,
  })
  isVisible: boolean;

  @WorkspaceField({
    standardId: VIEW_FIELD_STANDARD_FIELD_IDS.size,
    type: FieldMetadataType.NUMBER,
    label: 'Size',
    description: 'View Field size',
    icon: 'IconEye',
    defaultValue: 0,
  })
  size: number;

  @WorkspaceField({
    standardId: VIEW_FIELD_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.NUMBER,
    label: 'Position',
    description: 'View Field position',
    icon: 'IconList',
    defaultValue: 0,
  })
  position: number;

  @WorkspaceRelation({
    standardId: VIEW_FIELD_STANDARD_FIELD_IDS.view,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'View',
    description: 'View Field related view',
    icon: 'IconLayoutCollage',
    inverseSideTarget: () => ViewWorkspaceEntity,
    inverseSideFieldKey: 'viewFields',
  })
  @WorkspaceIsNullable()
  view?: ViewWorkspaceEntity | null;

  @WorkspaceJoinColumn('view')
  viewId: string | null;
}
