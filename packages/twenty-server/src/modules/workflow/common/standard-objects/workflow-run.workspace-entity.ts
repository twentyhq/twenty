import { FieldMetadataType } from 'twenty-shared';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
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
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WORKFLOW_RUN_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

export enum WorkflowRunStatus {
  NOT_STARTED = 'NOT_STARTED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

type StepRunOutput = {
  id: string;
  name: string;
  type: string;
  outputs: {
    attemptCount: number;
    result: object | undefined;
    error: string | undefined;
  }[];
};

export type WorkflowRunOutput = {
  steps: Record<string, StepRunOutput>;
  error?: string;
};

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.workflowRun,
  namePlural: 'workflowRuns',
  labelSingular: 'Workflow Run',
  labelPlural: 'Workflow Runs',
  description: 'A workflow run',
  labelIdentifierStandardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.name,
  icon: STANDARD_OBJECT_ICONS.workflowRun,
})
@WorkspaceGate({
  featureFlag: FeatureFlagKey.IsWorkflowEnabled,
})
export class WorkflowRunWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'Name of the workflow run',
    icon: 'IconSettingsAutomation',
  })
  name: string;

  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.startedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Workflow run started at',
    description: 'Workflow run started at',
    icon: 'IconHistory',
  })
  @WorkspaceIsNullable()
  startedAt: string | null;

  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.endedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Workflow run ended at',
    description: 'Workflow run ended at',
    icon: 'IconHistory',
  })
  @WorkspaceIsNullable()
  endedAt: string | null;

  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: 'Workflow run status',
    description: 'Workflow run status',
    icon: 'IconStatusChange',
    options: [
      {
        value: WorkflowRunStatus.NOT_STARTED,
        label: 'Not started',
        position: 0,
        color: 'gray',
      },
      {
        value: WorkflowRunStatus.RUNNING,
        label: 'Running',
        position: 1,
        color: 'yellow',
      },
      {
        value: WorkflowRunStatus.COMPLETED,
        label: 'Completed',
        position: 2,
        color: 'green',
      },
      {
        value: WorkflowRunStatus.FAILED,
        label: 'Failed',
        position: 3,
        color: 'red',
      },
    ],
    defaultValue: "'NOT_STARTED'",
  })
  status: WorkflowRunStatus;

  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: 'Executed by',
    icon: 'IconCreativeCommonsSa',
    description: 'The executor of the workflow',
    defaultValue: {
      source: `'${FieldActorSource.MANUAL}'`,
      name: "''",
    },
  })
  createdBy: ActorMetadata;

  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.output,
    type: FieldMetadataType.RAW_JSON,
    label: 'Output',
    description: 'Json object to provide output of the workflow run',
    icon: 'IconText',
  })
  @WorkspaceIsNullable()
  output: WorkflowRunOutput | null;

  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Position',
    description: 'Workflow run position',
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  // Relations
  @WorkspaceRelation({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.workflowVersion,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Workflow version',
    description: 'Workflow version linked to the run.',
    icon: 'IconVersions',
    inverseSideTarget: () => WorkflowVersionWorkspaceEntity,
    inverseSideFieldKey: 'runs',
  })
  workflowVersion: Relation<WorkflowVersionWorkspaceEntity>;

  @WorkspaceJoinColumn('workflowVersion')
  workflowVersionId: string;

  @WorkspaceRelation({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.workflow,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Workflow',
    description: 'Workflow linked to the run.',
    icon: 'IconSettingsAutomation',
    inverseSideTarget: () => WorkflowWorkspaceEntity,
    inverseSideFieldKey: 'runs',
  })
  workflow: Relation<WorkflowWorkspaceEntity>;

  @WorkspaceJoinColumn('workflow')
  workflowId: string;

  @WorkspaceRelation({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.favorites,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Favorites',
    description: 'Favorites linked to the workflow run',
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Timeline Activities',
    description: 'Timeline activities linked to the run',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
}
