import { Relation } from 'typeorm';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { REPORT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { ChartWorkspaceEntity } from 'src/modules/reports/standard-objects/chart.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.report,
  namePlural: 'reports',
  labelSingular: 'Report',
  labelPlural: 'Reports',
  description: 'A report',
  icon: 'IconReportAnalytics',
})
@WorkspaceIsSystem()
export class ReportWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: REPORT_STANDARD_FIELD_IDS.title,
    type: FieldMetadataType.TEXT,
    label: 'Title',
    description: 'Report title',
    icon: 'IconNotes',
  })
  title: string;

  @WorkspaceRelation({
    standardId: REPORT_STANDARD_FIELD_IDS.charts,
    label: 'Charts',
    description: 'Report charts',
    icon: 'IconGraph',
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => ChartWorkspaceEntity,
    inverseSideFieldKey: 'report',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  charts: Relation<ChartWorkspaceEntity[]>;
}
