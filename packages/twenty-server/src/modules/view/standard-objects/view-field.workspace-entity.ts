import { registerEnumType } from '@nestjs/graphql';

import { Relation } from 'typeorm';
import { FieldMetadataType } from 'twenty-shared';

import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIndex } from 'src/engine/twenty-orm/decorators/workspace-index.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { VIEW_FIELD_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

registerEnumType(AGGREGATE_OPERATIONS, {
  name: 'AggregateOperations',
});

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.viewField,
  namePlural: 'viewFields',
  labelSingular: 'View Field',
  labelPlural: 'View Fields',
  description: '(System) View Fields',
  icon: STANDARD_OBJECT_ICONS.viewField,
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
@WorkspaceIndex(['fieldMetadataId', 'viewId'], {
  isUnique: true,
  indexWhereClause: '"deletedAt" IS NULL',
})
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
  @WorkspaceIsSystem()
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
  view: Relation<ViewWorkspaceEntity>;

  @WorkspaceField({
    standardId: VIEW_FIELD_STANDARD_FIELD_IDS.aggregateOperation,
    type: FieldMetadataType.SELECT,
    label: 'Aggregate operation',
    description: 'Optional aggregate operation',
    icon: 'IconCalculator',
    options: [
      {
        value: AGGREGATE_OPERATIONS.avg,
        label: 'Average',
        position: 0,
        color: 'red',
      },
      {
        value: AGGREGATE_OPERATIONS.count,
        label: 'Count',
        position: 1,
        color: 'purple',
      },
      {
        value: AGGREGATE_OPERATIONS.max,
        label: 'Maximum',
        position: 2,
        color: 'sky',
      },
      {
        value: AGGREGATE_OPERATIONS.min,
        label: 'Minimum',
        position: 3,
        color: 'turquoise',
      },
      {
        value: AGGREGATE_OPERATIONS.sum,
        label: 'Sum',
        position: 4,
        color: 'yellow',
      },
      {
        value: AGGREGATE_OPERATIONS.countEmpty,
        label: 'Count empty',
        position: 5,
        color: 'red',
      },
      {
        value: AGGREGATE_OPERATIONS.countNotEmpty,
        label: 'Count not empty',
        position: 6,
        color: 'purple',
      },
      {
        value: AGGREGATE_OPERATIONS.countUniqueValues,
        label: 'Count unique values',
        position: 7,
        color: 'sky',
      },
      {
        value: AGGREGATE_OPERATIONS.percentageEmpty,
        label: 'Percent empty',
        position: 8,
        color: 'turquoise',
      },
      {
        value: AGGREGATE_OPERATIONS.percentageNotEmpty,
        label: 'Percent not empty',
        position: 9,
        color: 'yellow',
      },
    ],
    defaultValue: null,
  })
  @WorkspaceIsNullable()
  aggregateOperation?: AGGREGATE_OPERATIONS | null;

  @WorkspaceJoinColumn('view')
  viewId: string;
}
