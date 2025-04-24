import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
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
  labelSingular: msg`WorkflowEventListener`,
  labelPlural: msg`WorkflowEventListeners`,
  description: msg`A workflow event listener`,
  icon: STANDARD_OBJECT_ICONS.workflowEventListener,
  labelIdentifierStandardId:
    WORKFLOW_EVENT_LISTENER_STANDARD_FIELD_IDS.eventName,
})
@WorkspaceIsSystem()
export class WorkflowEventListenerWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WORKFLOW_EVENT_LISTENER_STANDARD_FIELD_IDS.eventName,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The workflow event listener name`,
  })
  eventName: string;

  // Relations
  @WorkspaceRelation({
    standardId: WORKFLOW_EVENT_LISTENER_STANDARD_FIELD_IDS.workflow,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workflow`,
    description: msg`WorkflowEventListener workflow`,
    icon: 'IconSettingsAutomation',
    inverseSideTarget: () => WorkflowWorkspaceEntity,
    inverseSideFieldKey: 'eventListeners',
  })
  @WorkspaceIsNullable()
  workflow: Relation<WorkflowWorkspaceEntity>;

  @WorkspaceJoinColumn('workflow')
  workflowId: string;
}
