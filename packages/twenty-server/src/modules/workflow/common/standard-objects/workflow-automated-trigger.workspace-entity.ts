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
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';

import { WorkflowWorkspaceEntity } from './workflow.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.workflowAutomatedTrigger,
  namePlural: 'workflowAutomatedTriggers',
  labelSingular: msg`WorkflowAutomatedTrigger`,
  labelPlural: msg`WorkflowAutomatedTriggers`,
  description: msg`A workflow automated trigger`,
  icon: STANDARD_OBJECT_ICONS.workspaceAutomatedTrigger,
})
@WorkspaceIsSystem()
export class WorkflowAutomatedTriggerWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS.databaseEventName,
    type: FieldMetadataType.TEXT,
    label: msg`Database Event Name`,
    description: msg`The workflow database event name`,
  })
  @WorkspaceIsNullable()
  databaseEventName: string | null;

  @WorkspaceField({
    standardId: WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS.cronPattern,
    type: FieldMetadataType.TEXT,
    label: msg`Cron Pattern`,
    description: msg`The workflow cron pattern`,
  })
  @WorkspaceIsNullable()
  cronPattern: string | null;

  @WorkspaceRelation({
    standardId: WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS.workflow,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workflow`,
    description: msg`WorkflowAutoTrigger workflow`,
    icon: 'IconSettingsAutomation',
    inverseSideTarget: () => WorkflowWorkspaceEntity,
    inverseSideFieldKey: 'automatedTriggers',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  workflow: Relation<WorkflowWorkspaceEntity>;

  @WorkspaceJoinColumn('workflow')
  workflowId: string;
}
