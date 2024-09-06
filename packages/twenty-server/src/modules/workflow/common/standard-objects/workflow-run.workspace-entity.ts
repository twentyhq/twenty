import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WORKFLOW_RUN_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

export enum WorkflowRunStatus {
  NOT_STARTED = 'NOT_STARTED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.workflowRun,
  namePlural: 'workflowRuns',
  labelSingular: 'workflowRun',
  labelPlural: 'WorkflowRuns',
  description: 'Uma execução de workflow',
})
@WorkspaceGate({
  featureFlag: FeatureFlagKey.IsWorkflowEnabled,
})
@WorkspaceIsSystem()
export class WorkflowRunWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.startedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Execução do workflow iniciada em',
    description: 'Execução do workflow iniciada em',
    icon: 'IconHistory',
  })
  @WorkspaceIsNullable()
  startedAt: string | null;

  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.endedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Execução do workflow finalizada em',
    description: 'Execução do workflow finalizada em',
    icon: 'IconHistory',
  })
  @WorkspaceIsNullable()
  endedAt: string | null;

  @WorkspaceField({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: 'Status da execução do workflow',
    description: 'Status da execução do workflow',
    icon: 'IconHistory',
    options: [
      {
        value: WorkflowRunStatus.NOT_STARTED,
        label: 'Não iniciado',
        position: 0,
        color: 'grey',
      },
      {
        value: WorkflowRunStatus.RUNNING,
        label: 'Em execução',
        position: 1,
        color: 'yellow',
      },
      {
        value: WorkflowRunStatus.COMPLETED,
        label: 'Concluído',
        position: 2,
        color: 'green',
      },
      {
        value: WorkflowRunStatus.FAILED,
        label: 'Falhou',
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
    label: 'Criado por',
    icon: 'IconCreativeCommonsSa',
    description: 'O criador do registro',
    defaultValue: {
      source: `'${FieldActorSource.MANUAL}'`,
      name: "''",
    },
  })
  createdBy: ActorMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.workflowVersion,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Versão do Workflow',
    description: 'Versão do workflow vinculada à execução.',
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
    description: 'Workflow vinculado à execução.',
    icon: 'IconSettingsAutomation',
    inverseSideTarget: () => WorkflowWorkspaceEntity,
    inverseSideFieldKey: 'runs',
  })
  workflow: Relation<WorkflowWorkspaceEntity>;

  @WorkspaceJoinColumn('workflow')
  workflowId: string;
}
