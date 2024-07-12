import { Relation } from 'typeorm';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ANALYTICS_QUERY_FILTER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { AnalyticsQueryWorkspaceEntity } from 'src/modules/charts/standard-objects/analytics-query.workspace-entity';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.analyticsQueryFilter,
  namePlural: 'analyticsQueryFilters',
  labelSingular: 'Analytics query filter',
  labelPlural: 'Analytics query filters',
  description: 'A filter for an analytics query',
  icon: 'IconFilter',
})
@WorkspaceIsSystem()
export class AnalyticsQueryFilterWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: ANALYTICS_QUERY_FILTER_STANDARD_FIELD_IDS.analyticsQuery,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Analytics query',
    description: 'Filter field',
    icon: 'IconDatabaseSearch',
    inverseSideTarget: () => AnalyticsQueryWorkspaceEntity,
    inverseSideFieldKey: 'analyticsQueryFilters',
  })
  analyticsQuery: Relation<AnalyticsQueryWorkspaceEntity>;

  @WorkspaceJoinColumn('analyticsQuery')
  analyticsQueryId: string;

  @WorkspaceField({
    standardId: ANALYTICS_QUERY_FILTER_STANDARD_FIELD_IDS.field,
    type: FieldMetadataType.TEXT,
    label: 'Field',
    description: 'Filter field',
    icon: 'IconForms',
  })
  field: string;

  @WorkspaceField({
    standardId: ANALYTICS_QUERY_FILTER_STANDARD_FIELD_IDS.operator,
    type: FieldMetadataType.TEXT,
    label: 'Operator',
    description: 'Filter operator',
    icon: 'IconMathFunction',
  })
  operator: string;

  @WorkspaceField({
    standardId: ANALYTICS_QUERY_FILTER_STANDARD_FIELD_IDS.value,
    type: FieldMetadataType.TEXT,
    label: 'Value',
    description: 'Filter value',
    icon: 'IconInputSearch',
  })
  @WorkspaceIsNullable()
  value: string;
}
