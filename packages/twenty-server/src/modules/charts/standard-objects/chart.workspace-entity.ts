import { Relation } from 'typeorm';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { CHART_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { AnalyticsQueryWorkspaceEntity } from 'src/modules/charts/standard-objects/analytics-query.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.chart,
  namePlural: 'charts',
  labelSingular: 'Chart',
  labelPlural: 'Charts',
  description: 'A chart for data visualization',
  icon: 'IconChartBar',
})
export class ChartWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CHART_STANDARD_FIELD_IDS.title,
    type: FieldMetadataType.TEXT,
    label: 'Title',
    description: 'Chart title',
    icon: 'IconNotes',
  })
  title: string;

  @WorkspaceField({
    standardId: CHART_STANDARD_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: 'Description',
    description: 'Chart description',
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  description: string;

  @WorkspaceRelation({
    standardId: CHART_STANDARD_FIELD_IDS.analyticsQueries,
    label: 'Analytics queries',
    description: 'Associated analytics queries',
    icon: 'IconDatabaseSearch',
    type: RelationMetadataType.ONE_TO_MANY, // TODO: Change to RelationMetadataType.ONE_TO_ONE and figure out why workspace:sync-metadata command fails
    inverseSideTarget: () => AnalyticsQueryWorkspaceEntity,
    inverseSideFieldKey: 'chart',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  analyticsQueries: Relation<AnalyticsQueryWorkspaceEntity[]>;
}
