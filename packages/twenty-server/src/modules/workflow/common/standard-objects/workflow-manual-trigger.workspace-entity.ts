import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationOnDeleteAction } from 'twenty-shared/types';
import { Relation } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WORKFLOW_MANUAL_TRIGGER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { ManualTriggerSettings } from 'src/modules/workflow/workflow-trigger/manual-trigger/constants/manual-trigger-settings';

import { WorkflowVersionWorkspaceEntity } from './workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from './workflow.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.workflowManualTrigger,
  namePlural: 'workflowManualTriggers',
  labelSingular: msg`Workflow Manual Trigger`,
  labelPlural: msg`Workflow Manual Triggers`,
  description: msg`A workflow manual trigger`,
  icon: STANDARD_OBJECT_ICONS.workflowManualTrigger,
})
@WorkspaceIsSystem()
export class WorkflowManualTriggerWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: WORKFLOW_MANUAL_TRIGGER_STANDARD_FIELD_IDS.workflowVersion,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workflow Version`,
    description: msg`The workflow version this manual trigger belongs to`,
    icon: 'IconVersions',
    inverseSideTarget: () => WorkflowVersionWorkspaceEntity,
    inverseSideFieldKey:
      'manualTriggers' as keyof WorkflowVersionWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  workflowVersion: Relation<WorkflowVersionWorkspaceEntity>;

  @WorkspaceJoinColumn('workflowVersion')
  workflowVersionId: string;

  @WorkspaceRelation({
    standardId: WORKFLOW_MANUAL_TRIGGER_STANDARD_FIELD_IDS.workflow,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workflow`,
    description: msg`The workflow this manual trigger belongs to`,
    icon: 'IconSettingsAutomation',
    inverseSideTarget: () => WorkflowWorkspaceEntity,
    inverseSideFieldKey: 'manualTriggers' as keyof WorkflowWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  workflow: Relation<WorkflowWorkspaceEntity>;

  @WorkspaceJoinColumn('workflow')
  workflowId: string;

  @WorkspaceField({
    standardId: WORKFLOW_MANUAL_TRIGGER_STANDARD_FIELD_IDS.workflowName,
    type: FieldMetadataType.TEXT,
    label: msg`Workflow Name`,
    description: msg`The name of the workflow this manual trigger belongs to`,
    icon: 'IconSettingsAutomation',
  })
  @WorkspaceIsFieldUIReadOnly()
  workflowName: string;

  @WorkspaceField({
    standardId: WORKFLOW_MANUAL_TRIGGER_STANDARD_FIELD_IDS.settings,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Settings`,
    description: msg`Manual trigger settings (icon, isPinned, availability, outputSchema)`,
  })
  @WorkspaceIsFieldUIReadOnly()
  settings: ManualTriggerSettings;
}
