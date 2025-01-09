import { Relation } from 'typeorm';
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
import { VIEW_FILTER_GROUP_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

export enum ViewFilterGroupLogicalOperator {
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
}

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.viewFilterGroup,
  namePlural: 'viewFilterGroups',
  labelSingular: 'View Filter Group',
  labelPlural: 'View Filter Groups',
  description: '(System) View Filter Groups',
  icon: 'IconFilterBolt',
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class ViewFilterGroupWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: VIEW_FILTER_GROUP_STANDARD_FIELD_IDS.view,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'View',
    description: 'View',
    inverseSideTarget: () => ViewWorkspaceEntity,
    inverseSideFieldKey: 'viewFilterGroups',
  })
  view: Relation<ViewWorkspaceEntity>;

  @WorkspaceJoinColumn('view')
  viewId: string;

  @WorkspaceField({
    standardId: VIEW_FILTER_GROUP_STANDARD_FIELD_IDS.parentViewFilterGroupId,
    type: FieldMetadataType.UUID,
    label: 'Parent View Filter Group Id',
    description: 'Parent View Filter Group',
  })
  @WorkspaceIsNullable()
  parentViewFilterGroupId: string | null;

  @WorkspaceField({
    standardId: VIEW_FILTER_GROUP_STANDARD_FIELD_IDS.logicalOperator,
    type: FieldMetadataType.SELECT,
    label: 'Logical Operator',
    description: 'Logical operator for the filter group',
    options: [
      {
        value: ViewFilterGroupLogicalOperator.AND,
        label: 'AND',
        position: 0,
        color: 'blue',
      },
      {
        value: ViewFilterGroupLogicalOperator.OR,
        label: 'OR',
        position: 1,
        color: 'green',
      },
      {
        value: ViewFilterGroupLogicalOperator.NOT,
        label: 'NOT',
        position: 2,
        color: 'red',
      },
    ],
    defaultValue: `'${ViewFilterGroupLogicalOperator.NOT}'`,
  })
  logicalOperator: string;

  @WorkspaceField({
    standardId: VIEW_FILTER_GROUP_STANDARD_FIELD_IDS.positionInViewFilterGroup,
    type: FieldMetadataType.POSITION,
    label: 'Position in view filter group',
    description: 'Position in the parent view filter group',
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  positionInViewFilterGroup: number | null;
}
