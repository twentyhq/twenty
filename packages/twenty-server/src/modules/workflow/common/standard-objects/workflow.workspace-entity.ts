import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WORKFLOW_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ActivityTargetWorkspaceEntity } from 'src/modules/activity/standard-objects/activity-target.workspace-entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowEventListenerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-event-listener.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.workflow,
  namePlural: 'workflows',
  labelSingular: 'Workflow',
  labelPlural: 'Workflows',
  description: 'A workflow',
  icon: 'IconSettingsAutomation',
  labelIdentifierStandardId: WORKFLOW_STANDARD_FIELD_IDS.name,
})
@WorkspaceGate({
  featureFlag: FeatureFlagKey.IsWorkflowEnabled,
})
export class WorkflowWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WORKFLOW_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'The workflow name',
    icon: 'IconSettingsAutomation',
  })
  name: string;

  @WorkspaceField({
    standardId: WORKFLOW_STANDARD_FIELD_IDS.publishedVersionId,
    type: FieldMetadataType.TEXT,
    label: 'Published Version Id',
    description: 'The workflow published version id',
    icon: 'IconVersions',
  })
  @WorkspaceIsNullable()
  publishedVersionId: string | null;

  @WorkspaceField({
    standardId: WORKFLOW_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Position',
    description: 'Workflow record position',
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  // Relations
  @WorkspaceRelation({
    standardId: WORKFLOW_STANDARD_FIELD_IDS.versions,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Versions',
    description: 'Workflow versions linked to the workflow.',
    icon: 'IconVersions',
    inverseSideTarget: () => WorkflowVersionWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  versions: Relation<WorkflowVersionWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKFLOW_STANDARD_FIELD_IDS.eventListeners,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Event Listeners',
    description: 'Workflow event listeners linked to the workflow.',
    icon: 'IconVersions',
    inverseSideTarget: () => WorkflowEventListenerWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  eventListeners: Relation<WorkflowEventListenerWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKFLOW_STANDARD_FIELD_IDS.activityTargets,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Activities',
    description: 'Activities tied to the contact',
    icon: 'IconCheckbox',
    inverseSideTarget: () => ActivityTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  activityTargets: Relation<ActivityTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKFLOW_STANDARD_FIELD_IDS.favorites,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Favorites',
    description: 'Favorites linked to the contact',
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKFLOW_STANDARD_FIELD_IDS.attachments,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Attachments',
    description: 'Attachments linked to the contact.',
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKFLOW_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Events',
    description: 'Events linked to the workflow',
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
}
