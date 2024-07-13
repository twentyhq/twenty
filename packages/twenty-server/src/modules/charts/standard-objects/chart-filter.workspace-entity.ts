import { Relation } from 'typeorm';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  ANALYTICS_QUERY_FILTER_STANDARD_FIELD_IDS,
  ANALYTICS_QUERY_FILTER_STANDARD_FIELD_IDS as Chart_FILTER_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { ChartWorkspaceEntity } from 'src/modules/charts/standard-objects/chart.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.analyticsQueryFilter,
  namePlural: 'chartFilters',
  labelSingular: 'Chart filter',
  labelPlural: 'Chart filters',
  description: 'A filter for a chart',
  icon: 'IconFilter',
})
@WorkspaceIsSystem()
export class ChartFilterWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: ANALYTICS_QUERY_FILTER_STANDARD_FIELD_IDS.chart,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Chart',
    description: 'Filter field',
    icon: 'IconDatabaseSearch',
    inverseSideTarget: () => ChartWorkspaceEntity,
    inverseSideFieldKey: 'chartFilters',
  })
  chart: Relation<ChartWorkspaceEntity>;

  @WorkspaceJoinColumn('chart')
  chartId: string;

  @WorkspaceField({
    standardId: Chart_FILTER_STANDARD_FIELD_IDS.field,
    type: FieldMetadataType.TEXT,
    label: 'Field',
    description: 'Filter field',
    icon: 'IconForms',
  })
  field: string;

  @WorkspaceField({
    standardId: Chart_FILTER_STANDARD_FIELD_IDS.operator,
    type: FieldMetadataType.TEXT,
    label: 'Operator',
    description: 'Filter operator',
    icon: 'IconMathFunction',
  })
  operator: string;

  @WorkspaceField({
    standardId: Chart_FILTER_STANDARD_FIELD_IDS.value,
    type: FieldMetadataType.TEXT,
    label: 'Value',
    description: 'Filter value',
    icon: 'IconInputSearch',
  })
  @WorkspaceIsNullable()
  value: string;
}
