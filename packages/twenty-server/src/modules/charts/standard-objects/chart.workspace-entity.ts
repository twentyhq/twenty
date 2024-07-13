import { Relation } from 'typeorm';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { CHART_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { ChartFilterWorkspaceEntity } from 'src/modules/charts/standard-objects/chart-filter.workspace-entity';

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
    standardId: CHART_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'Chart name',
    icon: 'IconNotes',
  })
  name: string;

  @WorkspaceField({
    standardId: CHART_STANDARD_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: 'Description',
    description: 'Chart description',
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  description: string;

  @WorkspaceField({
    standardId: CHART_STANDARD_FIELD_IDS.measure,
    type: FieldMetadataType.TEXT,
    label: 'Measure',
    description: 'Aggregate function of the chart',
    icon: 'IconRulerMeasure',
  })
  measure: string;

  @WorkspaceField({
    standardId: CHART_STANDARD_FIELD_IDS.sourceObjectNameSingular,
    type: FieldMetadataType.TEXT,
    label: 'Source object name (singular)',
    description: 'Singular name of the source object',
    icon: 'IconAbc',
  })
  sourceObjectNameSingular: string;

  @WorkspaceField({
    standardId: CHART_STANDARD_FIELD_IDS.fieldPath,
    type: FieldMetadataType.TEXT,
    label: 'Field path',
    description: 'Dot-separated path to the source field.',
    icon: 'IconForms',
  })
  fieldPath: string;

  @WorkspaceRelation({
    standardId: CHART_STANDARD_FIELD_IDS.chartFilters,
    label: 'Chart filters',
    description: 'Filters of the chart',
    icon: 'IconFilter',
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => ChartFilterWorkspaceEntity,
    inverseSideFieldKey: 'chart',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  chartFilters: Relation<ChartFilterWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: CHART_STANDARD_FIELD_IDS.groupBy,
    type: FieldMetadataType.TEXT,
    label: 'Group By',
    description: 'Group by clause for the chart',
    icon: 'IconStack2',
  })
  @WorkspaceIsNullable()
  groupBy: string;

  @WorkspaceField({
    standardId: CHART_STANDARD_FIELD_IDS.result,
    type: FieldMetadataType.RAW_JSON,
    label: 'Query result',
    description: 'Result of the chart',
    icon: 'IconTable',
  })
  @WorkspaceIsNullable()
  analyticsQueryResult: object;

  @WorkspaceField({
    standardId: CHART_STANDARD_FIELD_IDS.resultCreatedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Query result created at',
    description: 'Timestamp of when the chart was successfully run',
    icon: 'IconCalendarTime',
  })
  @WorkspaceIsNullable()
  analyticsQueryResultCreatedAt: Date;

  @WorkspaceField({
    standardId: CHART_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Position',
    description: 'Chart record position',
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;
}
