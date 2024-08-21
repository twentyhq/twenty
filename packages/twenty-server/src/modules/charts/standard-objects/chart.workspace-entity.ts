import { DataExplorerQuery } from 'src/engine/core-modules/chart/types/chart-query';
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
    standardId: CHART_STANDARD_FIELD_IDS.query,
    type: FieldMetadataType.DATA_EXPLORER_QUERY,
    label: 'Query',
    description: 'Query',
    icon: 'IconForms',
  })
  @WorkspaceIsNullable()
  query: DataExplorerQuery;

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
