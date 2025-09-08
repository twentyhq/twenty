import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { DASHBOARD_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.dashboard,
  namePlural: 'dashboards',
  labelSingular: msg`Dashboard`,
  labelPlural: msg`Dashboards`,
  description: msg`A dashboard`,
  icon: STANDARD_OBJECT_ICONS.dashboard,
  labelIdentifierStandardId: DASHBOARD_STANDARD_FIELD_IDS.title,
})
@WorkspaceGate({
  featureFlag: FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED,
})
export class DashboardWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: DASHBOARD_STANDARD_FIELD_IDS.title,
    type: FieldMetadataType.TEXT,
    label: msg`Title`,
    description: msg`Dashboard title`,
    icon: 'IconNotes',
  })
  title: string;

  @WorkspaceField({
    standardId: DASHBOARD_STANDARD_FIELD_IDS.pageLayoutId,
    type: FieldMetadataType.UUID,
    label: msg`Page Layout ID`,
    description: msg`Dashboard page layout`,
    icon: 'IconLayout',
  })
  @WorkspaceIsNullable()
  @WorkspaceIsFieldUIReadOnly()
  pageLayoutId: string | null;

  @WorkspaceRelation({
    standardId: DASHBOARD_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline activities linked to the dashboard`,
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
}
