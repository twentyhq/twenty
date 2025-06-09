import { registerEnumType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIndex } from 'src/engine/twenty-orm/decorators/workspace-index.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { VIEW_FIELD_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

registerEnumType(AggregateOperations, {
  name: 'AggregateOperations',
});

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.viewField,
  namePlural: 'viewFields',
  labelSingular: msg`View Field`,
  labelPlural: msg`View Fields`,
  description: msg`(System) View Fields`,
  icon: STANDARD_OBJECT_ICONS.viewField,
})
@WorkspaceIsSystem()
@WorkspaceIndex(['fieldMetadataId', 'viewId'], {
  isUnique: true,
  indexWhereClause: '"deletedAt" IS NULL',
})
export class ViewFieldWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: VIEW_FIELD_STANDARD_FIELD_IDS.fieldMetadataId,
    type: FieldMetadataType.UUID,
    label: msg`Field Metadata Id`,
    description: msg`View Field target field`,
    icon: 'IconTag',
  })
  fieldMetadataId: string;

  @WorkspaceField({
    standardId: VIEW_FIELD_STANDARD_FIELD_IDS.isVisible,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Visible`,
    description: msg`View Field visibility`,
    icon: 'IconEye',
    defaultValue: true,
  })
  isVisible: boolean;

  @WorkspaceField({
    standardId: VIEW_FIELD_STANDARD_FIELD_IDS.size,
    type: FieldMetadataType.NUMBER,
    label: msg`Size`,
    description: msg`View Field size`,
    icon: 'IconEye',
    defaultValue: 0,
  })
  size: number;

  @WorkspaceField({
    standardId: VIEW_FIELD_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.NUMBER,
    label: msg`Position`,
    description: msg`View Field position`,
    icon: 'IconList',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceRelation({
    standardId: VIEW_FIELD_STANDARD_FIELD_IDS.view,
    type: RelationType.MANY_TO_ONE,
    label: msg`View`,
    description: msg`View Field related view`,
    icon: 'IconLayoutCollage',
    inverseSideTarget: () => ViewWorkspaceEntity,
    inverseSideFieldKey: 'viewFields',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  view: Relation<ViewWorkspaceEntity>;

  @WorkspaceField({
    standardId: VIEW_FIELD_STANDARD_FIELD_IDS.aggregateOperation,
    type: FieldMetadataType.SELECT,
    label: msg`Aggregate operation`,
    description: msg`Optional aggregate operation`,
    icon: 'IconCalculator',
    options: [
      {
        value: AggregateOperations.AVG,
        label: 'Average',
        position: 0,
        color: 'red',
      },
      {
        value: AggregateOperations.COUNT,
        label: 'Count',
        position: 1,
        color: 'purple',
      },
      {
        value: AggregateOperations.MAX,
        label: 'Maximum',
        position: 2,
        color: 'sky',
      },
      {
        value: AggregateOperations.MIN,
        label: 'Minimum',
        position: 3,
        color: 'turquoise',
      },
      {
        value: AggregateOperations.SUM,
        label: 'Sum',
        position: 4,
        color: 'yellow',
      },
      {
        value: AggregateOperations.COUNT_EMPTY,
        label: 'Count empty',
        position: 5,
        color: 'red',
      },
      {
        value: AggregateOperations.COUNT_NOT_EMPTY,
        label: 'Count not empty',
        position: 6,
        color: 'purple',
      },
      {
        value: AggregateOperations.COUNT_UNIQUE_VALUES,
        label: 'Count unique values',
        position: 7,
        color: 'sky',
      },
      {
        value: AggregateOperations.PERCENTAGE_EMPTY,
        label: 'Percent empty',
        position: 8,
        color: 'turquoise',
      },
      {
        value: AggregateOperations.PERCENTAGE_NOT_EMPTY,
        label: 'Percent not empty',
        position: 9,
        color: 'yellow',
      },
      {
        value: AggregateOperations.COUNT_TRUE,
        label: 'Count true',
        position: 10,
        color: 'red',
      },
      {
        value: AggregateOperations.COUNT_FALSE,
        label: 'Count false',
        position: 11,
        color: 'purple',
      },
    ],
    defaultValue: null,
  })
  @WorkspaceIsNullable()
  aggregateOperation?: AggregateOperations | null;

  @WorkspaceJoinColumn('view')
  viewId: string;
}
