import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
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
  labelSingular: msg`View Filter Group`,
  labelPlural: msg`View Filter Groups`,
  description: msg`(System) View Filter Groups`,
  icon: 'IconFilterBolt',
})
@WorkspaceIsSystem()
export class ViewFilterGroupWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: VIEW_FILTER_GROUP_STANDARD_FIELD_IDS.view,
    type: RelationType.MANY_TO_ONE,
    label: msg`View`,
    description: msg`View`,
    inverseSideTarget: () => ViewWorkspaceEntity,
    inverseSideFieldKey: 'viewFilterGroups',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  view: Relation<ViewWorkspaceEntity>;

  @WorkspaceJoinColumn('view')
  viewId: string;

  @WorkspaceField({
    standardId: VIEW_FILTER_GROUP_STANDARD_FIELD_IDS.parentViewFilterGroupId,
    type: FieldMetadataType.UUID,
    label: msg`Parent View Filter Group Id`,
    description: msg`Parent View Filter Group`,
  })
  @WorkspaceIsNullable()
  parentViewFilterGroupId: string | null;

  @WorkspaceField({
    standardId: VIEW_FILTER_GROUP_STANDARD_FIELD_IDS.logicalOperator,
    type: FieldMetadataType.SELECT,
    label: msg`Logical Operator`,
    description: msg`Logical operator for the filter group`,
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
    type: FieldMetadataType.NUMBER,
    label: msg`Position in view filter group`,
    description: msg`Position in the parent view filter group`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsNullable()
  positionInViewFilterGroup: number | null;
}
