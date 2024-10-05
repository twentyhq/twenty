import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { VIEW_FILTER_GROUP_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

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
  @WorkspaceField({
    standardId: VIEW_FILTER_GROUP_STANDARD_FIELD_IDS.viewId,
    type: FieldMetadataType.UUID,
    label: 'View Id',
    description: 'View Filter Group related view',
  })
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
}
