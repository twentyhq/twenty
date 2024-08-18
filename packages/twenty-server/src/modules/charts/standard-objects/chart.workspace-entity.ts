import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { CHART_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export enum ChartQueryMeasure {
  AVERAGE = 'AVERAGE',
  SUM = 'SUM',
  MIN = 'MIN',
  MAX = 'MAX',
  COUNT = 'COUNT',
}

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.chart,
  namePlural: 'charts',
  labelSingular: 'Chart',
  labelPlural: 'Charts',
  description: 'A chart for data visualization',
  icon: 'IconChartBar',
  labelIdentifierStandardId: CHART_STANDARD_FIELD_IDS.name,
  softDelete: true,
})
@WorkspaceGate({
  featureFlag: FeatureFlagKey.IsChartsEnabled,
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
    type: FieldMetadataType.SELECT,
    label: 'Measure',
    description: 'Aggregate function of the chart',
    icon: 'IconRulerMeasure',
    options: [
      {
        value: ChartQueryMeasure.AVERAGE,
        label: 'Average',
        position: 0,
        color: 'blue',
      },
      {
        value: ChartQueryMeasure.SUM,
        label: 'Sum',
        position: 1,
        color: 'green',
      },
      {
        value: ChartQueryMeasure.MIN,
        label: 'Minimum',
        position: 2,
        color: 'orange',
      },
      {
        value: ChartQueryMeasure.MAX,
        label: 'Maximum',
        position: 3,
        color: 'red',
      },
      {
        value: ChartQueryMeasure.COUNT,
        label: 'Count',
        position: 4,
        color: 'purple',
      },
    ],
    defaultValue: `'${ChartQueryMeasure.COUNT}'`,
  })
  measure: ChartQueryMeasure;

  @WorkspaceField({
    standardId: CHART_STANDARD_FIELD_IDS.sourceObjectNameSingular,
    type: FieldMetadataType.TEXT,
    label: 'Source object name (singular)',
    description: 'Singular name of the source object',
    icon: 'IconAbc',
  })
  sourceObjectNameSingular: string;

  @WorkspaceField({
    standardId: CHART_STANDARD_FIELD_IDS.target,
    type: FieldMetadataType.FIELD_PATH,
    label: 'Target',
    description: 'Path from source object to the target field.',
    icon: 'IconForms',
  })
  @WorkspaceIsNullable()
  target: string[];

  @WorkspaceField({
    standardId: CHART_STANDARD_FIELD_IDS.groupBy,
    type: FieldMetadataType.FIELD_PATH,
    label: 'Group By',
    description: 'Group by clause for the chart',
    icon: 'IconStack2',
  })
  @WorkspaceIsNullable()
  groupBy: string[];

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
