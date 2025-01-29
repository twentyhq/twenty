import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { VIEW_FILTER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.viewFilter,
  namePlural: 'viewFilters',
  labelSingular: msg`View Filter`,
  labelPlural: msg`View Filters`,
  description: msg`(System) View Filters`,
  icon: STANDARD_OBJECT_ICONS.viewFilter,
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class ViewFilterWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: VIEW_FILTER_STANDARD_FIELD_IDS.fieldMetadataId,
    type: FieldMetadataType.UUID,
    label: msg`Field Metadata Id`,
    description: msg`View Filter target field`,
  })
  fieldMetadataId: string;

  @WorkspaceField({
    standardId: VIEW_FILTER_STANDARD_FIELD_IDS.operand,
    type: FieldMetadataType.TEXT,
    label: msg`Operand`,
    description: msg`View Filter operand`,
    defaultValue: "'Contains'",
  })
  operand: string;

  @WorkspaceField({
    standardId: VIEW_FILTER_STANDARD_FIELD_IDS.value,
    type: FieldMetadataType.TEXT,
    label: msg`Value`,
    description: msg`View Filter value`,
  })
  value: string;

  @WorkspaceField({
    standardId: VIEW_FILTER_STANDARD_FIELD_IDS.displayValue,
    type: FieldMetadataType.TEXT,
    label: msg`Display Value`,
    description: msg`View Filter Display Value`,
  })
  displayValue: string;

  @WorkspaceRelation({
    standardId: VIEW_FILTER_STANDARD_FIELD_IDS.view,
    type: RelationMetadataType.MANY_TO_ONE,
    label: msg`View`,
    description: msg`View Filter related view`,
    icon: 'IconLayoutCollage',
    inverseSideTarget: () => ViewWorkspaceEntity,
    inverseSideFieldKey: 'viewFilters',
  })
  @WorkspaceIsNullable()
  view: Relation<ViewWorkspaceEntity> | null;

  @WorkspaceJoinColumn('view')
  viewId: string | null;

  @WorkspaceField({
    standardId: VIEW_FILTER_STANDARD_FIELD_IDS.viewFilterGroupId,
    type: FieldMetadataType.UUID,
    label: msg`View Filter Group Id`,
    description: msg`View Filter Group`,
  })
  @WorkspaceIsNullable()
  viewFilterGroupId: string | null;

  @WorkspaceField({
    standardId: VIEW_FILTER_STANDARD_FIELD_IDS.positionInViewFilterGroup,
    type: FieldMetadataType.POSITION,
    label: msg`Position in view filter group`,
    description: msg`Position in the view filter group`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  positionInViewFilterGroup: number | null;
}
