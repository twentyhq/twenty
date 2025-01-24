import { FieldMetadataType } from 'twenty-shared';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
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

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.view,
  namePlural: 'views',
  labelSingular: 'View',
  labelPlural: 'Views',
  description: '(System) Views',
  icon: STANDARD_OBJECT_ICONS.view,
  labelIdentifierStandardId: VIEW_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class ViewWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'View name',
  })
  name: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.objectMetadataId,
    type: FieldMetadataType.UUID,
    label: 'Object Metadata Id',
    description: 'View target object',
  })
  objectMetadataId: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.TEXT,
    label: 'Type',
    description: 'View type',
    defaultValue: "'table'",
  })
  type: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.key,
    type: FieldMetadataType.SELECT,
    label: 'Key',
    description: 'View key',
    options: [{ value: 'INDEX', label: 'Index', position: 0, color: 'red' }],
    defaultValue: "'INDEX'",
  })
  @WorkspaceIsNullable()
  key: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.icon,
    type: FieldMetadataType.TEXT,
    label: 'Icon',
    description: 'View icon',
  })
  icon: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.kanbanFieldMetadataId,
    type: FieldMetadataType.TEXT,
    label: 'kanbanfieldMetadataId',
    description: 'View Kanban column field',
  })
  /**
   * @deprecated Use `viewGroups.fieldMetadataId` instead
   */
  kanbanFieldMetadataId: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Position',
    description: 'View position',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.isCompact,
    type: FieldMetadataType.BOOLEAN,
    label: 'Compact View',
    description: 'Describes if the view is in compact mode',
    defaultValue: false,
  })
  isCompact: boolean;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.viewFields,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'View Fields',
    description: 'View Fields',
    icon: 'IconTag',
    inverseSideTarget: () => ViewFieldWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  viewFields: Relation<ViewFieldWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.viewGroups,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'View Groups',
    description: 'View Groups',
    icon: 'IconTag',
    inverseSideTarget: () => ViewGroupWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  viewGroups: Relation<ViewGroupWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.viewFilters,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'View Filters',
    description: 'View Filters',
    icon: 'IconFilterBolt',
    inverseSideTarget: () => ViewFilterWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  viewFilters: Relation<ViewFilterWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.viewFilterGroups,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'View Filter Groups',
    description: 'View Filter Groups',
    icon: 'IconFilterBolt',
    inverseSideTarget: () => ViewFilterGroupWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  viewFilterGroups: Relation<ViewFilterGroupWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.viewSorts,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'View Sorts',
    description: 'View Sorts',
    icon: 'IconArrowsSort',
    inverseSideTarget: () => ViewSortWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  viewSorts: Relation<ViewSortWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.favorites,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Favorites',
    description: 'Favorites linked to the view',
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.kanbanAggregateOperation,
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
    defaultValue: `'${AGGREGATE_OPERATIONS.count}'`,
  })
  @WorkspaceIsNullable()
  kanbanAggregateOperation?: AGGREGATE_OPERATIONS | null;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.kanbanAggregateOperationFieldMetadataId,
    type: FieldMetadataType.UUID,
    label: 'Field metadata used for aggregate operation',
    description: 'Field metadata used for aggregate operation',
    defaultValue: null,
  })
  @WorkspaceIsNullable()
  kanbanAggregateOperationFieldMetadataId?: string | null;
}
