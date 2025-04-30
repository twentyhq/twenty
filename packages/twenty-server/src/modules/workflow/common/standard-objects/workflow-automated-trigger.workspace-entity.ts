import { msg } from '@lingui/core/macro';
import { Relation } from 'typeorm';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';

import { WorkflowWorkspaceEntity } from './workflow.workspace-entity';

export enum AutomatedTriggerType {
  DATABASE_EVENT = 'DATABASE_EVENT',
  CRON = 'CRON',
}

export type AutomatedTriggerSettings = {
  pattern?: string;
  eventName?: string;
};

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.workflowAutomatedTrigger,
  namePlural: 'workflowAutomatedTriggers',
  labelSingular: msg`WorkflowAutomatedTrigger`,
  labelPlural: msg`WorkflowAutomatedTriggers`,
  description: msg`A workflow automated trigger`,
  icon: STANDARD_OBJECT_ICONS.workflowAutomatedTrigger,
})
@WorkspaceIsSystem()
export class WorkflowAutomatedTriggerWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.SELECT,
    label: msg`Automated Trigger Type`,
    description: msg`The workflow automated trigger type`,
    options: [
      {
        value: AutomatedTriggerType.DATABASE_EVENT,
        label: 'Database Event',
        position: 0,
        color: 'green',
      },
      {
        value: AutomatedTriggerType.CRON,
        label: 'Cron',
        position: 1,
        color: 'blue',
      },
    ],
  })
  type: AutomatedTriggerType;

  @WorkspaceField({
    standardId: WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS.settings,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Settings`,
    description: msg`The workflow automated trigger settings`,
  })
  settings: AutomatedTriggerSettings;

  @WorkspaceRelation({
    standardId: WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS.workflow,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workflow`,
    description: msg`WorkflowAutomatedTrigger workflow`,
    icon: 'IconSettingsAutomation',
    inverseSideTarget: () => WorkflowWorkspaceEntity,
    inverseSideFieldKey: 'automatedTriggers',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  workflow: Relation<WorkflowWorkspaceEntity>;

  @WorkspaceJoinColumn('workflow')
  workflowId: string;
}
