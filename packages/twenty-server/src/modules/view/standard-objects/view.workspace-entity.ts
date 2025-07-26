import { registerEnumType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { VIEW_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';
import { ViewFilterGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter-group.workspace-entity';
import { ViewFilterWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter.workspace-entity';
import { ViewGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-group.workspace-entity';
import { ViewSortWorkspaceEntity } from 'src/modules/view/standard-objects/view-sort.workspace-entity';

export enum ViewOpenRecordInType {
  SIDE_PANEL = 'SIDE_PANEL',
  RECORD_PAGE = 'RECORD_PAGE',
}

registerEnumType(ViewOpenRecordInType, {
  name: 'ViewOpenRecordInType',
});

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.view,
  namePlural: 'views',
  labelSingular: msg`View`,
  labelPlural: msg`Views`,
  description: msg`(System) Views`,
  icon: STANDARD_OBJECT_ICONS.view,
  labelIdentifierStandardId: VIEW_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSystem()
export class ViewWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`View name`,
  })
  name: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.objectMetadataId,
    type: FieldMetadataType.UUID,
    label: msg`Object Metadata Id`,
    description: msg`View target object`,
  })
  objectMetadataId: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.TEXT,
    label: msg`Type`,
    description: msg`View type`,
    defaultValue: "'table'",
  })
  type: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.key,
    type: FieldMetadataType.SELECT,
    label: msg`Key`,
    description: msg`View key`,
    options: [{ value: 'INDEX', label: 'Index', position: 0, color: 'red' }],
    defaultValue: "'INDEX'",
  })
  @WorkspaceIsNullable()
  key: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.icon,
    type: FieldMetadataType.TEXT,
    label: msg`Icon`,
    description: msg`View icon`,
  })
  icon: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.kanbanFieldMetadataId,
    type: FieldMetadataType.TEXT,
    label: msg`kanbanfieldMetadataId`,
    description: msg`View Kanban column field`,
  })
  /**
   * @deprecated Use `viewGroups.fieldMetadataId` instead
   */
  kanbanFieldMetadataId: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`View position`,
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.isCompact,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Compact View`,
    description: msg`Describes if the view is in compact mode`,
    defaultValue: false,
  })
  isCompact: boolean;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.openRecordIn,
    type: FieldMetadataType.SELECT,
    label: msg`Open Record In`,
    description: msg`Display the records in a side panel or in a record page`,
    defaultValue: `'${ViewOpenRecordInType.SIDE_PANEL}'`,
    options: [
      {
        value: ViewOpenRecordInType.SIDE_PANEL,
        label: 'Side Panel',
        position: 0,
        color: 'green',
      },
      {
        value: ViewOpenRecordInType.RECORD_PAGE,
        label: 'Record Page',
        position: 1,
        color: 'blue',
      },
    ],
  })
  openRecordIn: ViewOpenRecordInType;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.viewFields,
    type: RelationType.ONE_TO_MANY,
    label: msg`View Fields`,
    description: msg`View Fields`,
    icon: 'IconTag',
    inverseSideTarget: () => ViewFieldWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  viewFields: Relation<ViewFieldWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.viewGroups,
    type: RelationType.ONE_TO_MANY,
    label: msg`View Groups`,
    description: msg`View Groups`,
    icon: 'IconTag',
    inverseSideTarget: () => ViewGroupWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  viewGroups: Relation<ViewGroupWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.viewFilters,
    type: RelationType.ONE_TO_MANY,
    label: msg`View Filters`,
    description: msg`View Filters`,
    icon: 'IconFilterBolt',
    inverseSideTarget: () => ViewFilterWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  viewFilters: Relation<ViewFilterWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.viewFilterGroups,
    type: RelationType.ONE_TO_MANY,
    label: msg`View Filter Groups`,
    description: msg`View Filter Groups`,
    icon: 'IconFilterBolt',
    inverseSideTarget: () => ViewFilterGroupWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  viewFilterGroups: Relation<ViewFilterGroupWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.viewSorts,
    type: RelationType.ONE_TO_MANY,
    label: msg`View Sorts`,
    description: msg`View Sorts`,
    icon: 'IconArrowsSort',
    inverseSideTarget: () => ViewSortWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  viewSorts: Relation<ViewSortWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.favorites,
    type: RelationType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the view`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.kanbanAggregateOperation,
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
    defaultValue: `'${AggregateOperations.COUNT}'`,
  })
  @WorkspaceIsNullable()
  kanbanAggregateOperation?: AggregateOperations | null;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.kanbanAggregateOperationFieldMetadataId,
    type: FieldMetadataType.UUID,
    label: msg`Field metadata used for aggregate operation`,
    description: msg`Field metadata used for aggregate operation`,
    defaultValue: null,
  })
  @WorkspaceIsNullable()
  kanbanAggregateOperationFieldMetadataId?: string | null;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.anyFieldFilterValue,
    type: FieldMetadataType.TEXT,
    label: msg`Any field filter value`,
    description: msg`Any field filter value`,
    defaultValue: null,
  })
  @WorkspaceIsNullable()
  anyFieldFilterValue?: string | null;
}
