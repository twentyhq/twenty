import { registerEnumType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import {
  ActorMetadata,
  FieldMetadataType,
  RelationOnDeleteAction,
} from 'twenty-shared/types';
import { type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WORKFLOW_RUN_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import {
  type FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export enum WorkflowRunStatus {
  NOT_STARTED = 'NOT_STARTED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ENQUEUED = 'ENQUEUED',
  STOPPING = 'STOPPING',
  STOPPED = 'STOPPED',
}

registerEnumType(WorkflowRunStatus, {
  name: 'WorkflowRunStatusEnum',
  description: 'Status of the workflow run',
});

export type StepOutput = {
  id: string;
  output: WorkflowActionOutput;
};

export type WorkflowRunOutput = {
  flow: {
    trigger: WorkflowTrigger;
    steps: WorkflowAction[];
  };
  stepsOutput?: Record<string, WorkflowActionOutput>;
  error?: string;
};

export type WorkflowRunState = {
  flow: {
    trigger: WorkflowTrigger;
    steps: WorkflowAction[];
  };
  stepInfos: WorkflowRunStepInfos;
  workflowRunError?: string;
};

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_WORKFLOW_RUNS: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.workflowRun,

  namePlural: 'workflowRuns',
  labelSingular: msg`Workflow Run`,
  labelPlural: msg`Workflow Runs`,
  description: msg`A workflow run`,
  labelIdentifierStandardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.name,
  icon: STANDARD_OBJECT_ICONS.workflowRun,
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class WorkflowRunWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Name of the workflow run`,
    icon: 'IconSettingsAutomation',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  name: string | null;

  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.enqueuedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Workflow run enqueued at`,
    description: msg`Workflow run enqueued at`,
    icon: 'IconHistory',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  enqueuedAt: Date | null;

  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.startedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Workflow run started at`,
    description: msg`Workflow run started at`,
    icon: 'IconHistory',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  startedAt: string | null;

  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.endedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Workflow run ended at`,
    description: msg`Workflow run ended at`,
    icon: 'IconHistory',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  endedAt: string | null;

  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Workflow run status`,
    description: msg`Workflow run status`,
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
      {
        value: WorkflowRunStatus.ENQUEUED,
        label: 'Enqueued',
        position: 4,
        color: 'blue',
      },
      {
        value: WorkflowRunStatus.STOPPING,
        label: 'Stopping',
        position: 5,
        color: 'orange',
      },
      {
        value: WorkflowRunStatus.STOPPED,
        label: 'Stopped',
        position: 6,
        color: 'gray',
      },
    ],
    defaultValue: "'NOT_STARTED'",
  })
  @WorkspaceIsFieldUIReadOnly()
  status: WorkflowRunStatus;

  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Executed by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The executor of the workflow`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;

  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.updatedBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Updated by`,
    icon: 'IconUserCircle',
    description: msg`The workspace member who last updated the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  updatedBy: ActorMetadata;

  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.state,
    type: FieldMetadataType.RAW_JSON,
    label: msg`State`,
    description: msg`State of the workflow run`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsFieldUIReadOnly()
  state: WorkflowRunState;

  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Workflow run position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_WORKFLOW_RUNS,
    ),
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;

  // Relations
  @WorkspaceRelation({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.workflowVersion,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workflow version`,
    description: msg`Workflow version linked to the run.`,
    icon: 'IconVersions',
    inverseSideTarget: () => WorkflowVersionWorkspaceEntity,
    inverseSideFieldKey: 'runs',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  workflowVersion: Relation<WorkflowVersionWorkspaceEntity>;

  @WorkspaceJoinColumn('workflowVersion')
  workflowVersionId: string;

  @WorkspaceRelation({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.workflow,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workflow`,
    description: msg`Workflow linked to the run.`,
    icon: 'IconSettingsAutomation',
    inverseSideTarget: () => WorkflowWorkspaceEntity,
    inverseSideFieldKey: 'runs',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  workflow: Relation<WorkflowWorkspaceEntity>;

  @WorkspaceJoinColumn('workflow')
  workflowId: string;

  @WorkspaceRelation({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.favorites,
    type: RelationType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the workflow run`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline activities linked to the run`,
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    inverseSideFieldKey: 'targetWorkflowRun',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
}
