import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
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
import { WORKFLOW_VERSION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

export enum WorkflowTriggerType {
  DATABASE_EVENT = 'DATABASE_EVENT',
}

export enum WorkflowActionType {
  CODE = 'CODE',
}

export const MAX_RETRIES_ON_FAILURE = 3;

export type WorkflowCodeSettingsType = {
  serverlessFunctionId: string;
};

export type WorkflowSettingsType = {
  errorHandlingOptions: {
    retryOnFailure: {
      value: boolean;
    };
    continueOnFailure: {
      value: boolean;
    };
  };
} & WorkflowCodeSettingsType;

export type WorkflowAction = {
  name: string;
  displayName: string;
  type: WorkflowActionType;
  valid: boolean;
  settings: WorkflowSettingsType;
  nextAction?: WorkflowAction;
};

export type WorkflowDatabaseEventTrigger = {
  type: WorkflowTriggerType.DATABASE_EVENT;
  input?: object;
  settings: {
    eventName: string;
    triggerName: string;
  };
  nextAction?: WorkflowAction;
};

export type WorkflowTrigger = WorkflowDatabaseEventTrigger;

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.workflowVersion,
  namePlural: 'workflowVersions',
  labelSingular: 'WorkflowVersion',
  labelPlural: 'WorkflowVersions',
  description: 'A workflow version',
  icon: 'IconVersions',
  labelIdentifierStandardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.name,
})
@WorkspaceGate({
  featureFlag: FeatureFlagKey.IsWorkflowEnabled,
})
@WorkspaceIsSystem()
export class WorkflowVersionWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'The workflow version name',
    icon: 'IconVersions',
  })
  name: string;

  @WorkspaceField({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.trigger,
    type: FieldMetadataType.RAW_JSON,
    label: 'Version trigger',
    description: 'Json object to provide trigger',
    icon: 'IconPlayerPlay',
  })
  @WorkspaceIsNullable()
  trigger: WorkflowTrigger | null;

  // Relations
  @WorkspaceRelation({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.workflow,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Workflow',
    description: 'WorkflowVersion workflow',
    icon: 'IconSettingsAutomation',
    inverseSideTarget: () => WorkflowWorkspaceEntity,
    inverseSideFieldKey: 'versions',
  })
  @WorkspaceIsNullable()
  workflow: Relation<WorkflowWorkspaceEntity>;

  @WorkspaceJoinColumn('workflow')
  workflowId: string;
}
