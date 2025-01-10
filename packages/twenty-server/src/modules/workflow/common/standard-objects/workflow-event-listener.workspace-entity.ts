import { FieldMetadataType } from 'twenty-shared';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WORKFLOW_EVENT_LISTENER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.workflowEventListener,
  namePlural: 'workflowEventListeners',
  labelSingular: 'WorkflowEventListener',
  labelPlural: 'WorkflowEventListeners',
  description: 'A workflow event listener',
  icon: STANDARD_OBJECT_ICONS.workflowEventListener,
  labelIdentifierStandardId:
    WORKFLOW_EVENT_LISTENER_STANDARD_FIELD_IDS.eventName,
})
@WorkspaceGate({
  featureFlag: FeatureFlagKey.IsWorkflowEnabled,
})
@WorkspaceIsSystem()
export class WorkflowEventListenerWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WORKFLOW_EVENT_LISTENER_STANDARD_FIELD_IDS.eventName,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'The workflow event listener name',
  })
  eventName: string;

  // Relations
  @WorkspaceRelation({
    standardId: WORKFLOW_EVENT_LISTENER_STANDARD_FIELD_IDS.workflow,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Workflow',
    description: 'WorkflowEventListener workflow',
    icon: 'IconSettingsAutomation',
    inverseSideTarget: () => WorkflowWorkspaceEntity,
    inverseSideFieldKey: 'eventListeners',
  })
  @WorkspaceIsNullable()
  workflow: Relation<WorkflowWorkspaceEntity>;

  @WorkspaceJoinColumn('workflow')
  workflowId: string;
}
