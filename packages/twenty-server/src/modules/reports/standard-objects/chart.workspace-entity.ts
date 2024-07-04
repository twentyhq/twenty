import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { CHART_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { AnalyticsQueryWorkspaceEntity } from 'src/modules/reports/standard-objects/analytics-query.workspace-entity';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';

import { ReportWorkspaceEntity } from './report.workspace-entity';

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
    standardId: CHART_STANDARD_FIELD_IDS.report,
    label: 'Report',
    description: 'The report the chart belongs to',
    icon: 'IconReportAnalytics',
    type: RelationMetadataType.MANY_TO_ONE,
    inverseSideTarget: () => ReportWorkspaceEntity,
    inverseSideFieldKey: 'charts',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  report: Relation<ReportWorkspaceEntity>;

  @WorkspaceJoinColumn('report')
  reportId: string;

  @WorkspaceRelation({
    standardId: CHART_STANDARD_FIELD_IDS.analyticsQuery,
    label: 'Analytics query',
    description: 'Associated analytics query',
    icon: 'IconDatabaseSearch',
    type: RelationMetadataType.ONE_TO_ONE,
    inverseSideTarget: () => AnalyticsQueryWorkspaceEntity,
    inverseSideFieldKey: 'chart',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  analyticsQuery: Relation<AnalyticsQueryWorkspaceEntity>;

  @WorkspaceField({
    standardId: CHART_STANDARD_FIELD_IDS.analyticsQueryResult,
    type: FieldMetadataType.RAW_JSON,
    label: 'Analytics query result',
    description: 'Result of the analytics query',
    icon: 'IconTable',
  })
  @WorkspaceIsNullable()
  analyticsQueryResult: object;

  @WorkspaceField({
    standardId: CHART_STANDARD_FIELD_IDS.analyticsQueryResultCreatedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Analytics query result created at',
    description: 'Timestamp of when the analytics query was successfully run',
    icon: 'IconCalendarTime',
  })
  @WorkspaceIsNullable()
  analyticsQueryResultCreatedAt: Date;
}
