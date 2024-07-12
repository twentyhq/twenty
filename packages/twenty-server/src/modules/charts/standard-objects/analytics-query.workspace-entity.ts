import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { ANALYTICS_QUERY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { AnalyticsQueryFilterWorkspaceEntity } from 'src/modules/charts/standard-objects/analytics-query-filter.workspace-entity';
import { ChartWorkspaceEntity } from 'src/modules/charts/standard-objects/chart.workspace-entity';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.analyticsQuery,
  namePlural: 'analyticsQueries',
  labelSingular: 'Analytics Query',
  labelPlural: 'Analytics Queries',
  description: 'A query for analytics',
  icon: 'IconDatabaseSearch',
})
@WorkspaceIsSystem()
export class AnalyticsQueryWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: ANALYTICS_QUERY_STANDARD_FIELD_IDS.chart,
    label: 'Chart',
    description: 'The chart this analytics query belongs to',
    icon: 'IconChartBar',
    type: RelationMetadataType.MANY_TO_ONE,
    inverseSideTarget: () => ChartWorkspaceEntity,
    inverseSideFieldKey: 'analyticsQueries',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  chart: Relation<ChartWorkspaceEntity> | null;

  @WorkspaceJoinColumn('chart')
  chartId: string | null;

  @WorkspaceField({
    standardId: ANALYTICS_QUERY_STANDARD_FIELD_IDS.measure,
    type: FieldMetadataType.TEXT,
    label: 'Measure',
    description: 'Aggregate function of the analytics query',
    icon: 'IconRulerMeasure',
  })
  measure: string;

  @WorkspaceField({
    standardId: ANALYTICS_QUERY_STANDARD_FIELD_IDS.sourceObjectNameSingular,
    type: FieldMetadataType.TEXT,
    label: 'Source object name (singular)',
    description: 'Singular name of the source object',
    icon: 'IconAbc',
  })
  sourceObjectNameSingular: string;

  @WorkspaceField({
    standardId: ANALYTICS_QUERY_STANDARD_FIELD_IDS.fieldPath,
    type: FieldMetadataType.TEXT,
    label: 'Field path',
    description: 'Dot-separated path to the source field.',
    icon: 'IconForms',
  })
  fieldPath: string;

  @WorkspaceRelation({
    standardId: ANALYTICS_QUERY_STANDARD_FIELD_IDS.analyticsQueryFilters,
    label: 'Analytics query filters',
    description: 'Filters of the analytics query',
    icon: 'IconFilter',
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => AnalyticsQueryFilterWorkspaceEntity,
    inverseSideFieldKey: 'analyticsQuery',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  analyticsQueryFilters: Relation<AnalyticsQueryFilterWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: ANALYTICS_QUERY_STANDARD_FIELD_IDS.groupBy,
    type: FieldMetadataType.TEXT,
    label: 'Group By',
    description: 'Group by clause for the analytics query',
    icon: 'IconStack2',
  })
  @WorkspaceIsNullable()
  groupBy: string;

  @WorkspaceField({
    standardId: ANALYTICS_QUERY_STANDARD_FIELD_IDS.result,
    type: FieldMetadataType.RAW_JSON,
    label: 'Query result',
    description: 'Result of the analytics query',
    icon: 'IconTable',
  })
  @WorkspaceIsNullable()
  analyticsQueryResult: object;

  @WorkspaceField({
    standardId: ANALYTICS_QUERY_STANDARD_FIELD_IDS.resultCreatedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Query result created at',
    description: 'Timestamp of when the analytics query was successfully run',
    icon: 'IconCalendarTime',
  })
  @WorkspaceIsNullable()
  analyticsQueryResultCreatedAt: Date;
}
