import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationOnDeleteAction } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { type FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WORKFLOW_VERSION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import {
  type FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export enum WorkflowVersionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
  ARCHIVED = 'ARCHIVED',
}

const WorkflowVersionStatusOptions: FieldMetadataComplexOption[] = [
  {
    value: WorkflowVersionStatus.DRAFT,
    label: 'Draft',
    position: 0,
    color: 'yellow',
  },
  {
    value: WorkflowVersionStatus.ACTIVE,
    label: 'Active',
    position: 1,
    color: 'green',
  },
  {
    value: WorkflowVersionStatus.DEACTIVATED,
    label: 'Deactivated',
    position: 2,
    color: 'orange',
  },
  {
    value: WorkflowVersionStatus.ARCHIVED,
    label: 'Archived',
    position: 3,
    color: 'gray',
  },
];

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_WORKFLOW_VERSIONS: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.workflowVersion,

  namePlural: 'workflowVersions',
  labelSingular: msg`Workflow Version`,
  labelPlural: msg`Workflow Versions`,
  description: msg`A workflow version`,
  icon: STANDARD_OBJECT_ICONS.workflowVersion,
  labelIdentifierStandardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSystem()
export class WorkflowVersionWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The workflow version name`,
    icon: 'IconSettingsAutomation',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  name: string | null;

  @WorkspaceField({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.trigger,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Version trigger`,
    description: msg`Json object to provide trigger`,
    icon: 'IconSettingsAutomation',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  trigger: WorkflowTrigger | null;

  @WorkspaceField({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.steps,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Version steps`,
    description: msg`Json object to provide steps`,
    icon: 'IconSettingsAutomation',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  steps: WorkflowAction[] | null;

  @WorkspaceField({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Version status`,
    description: msg`The workflow version status`,
    icon: 'IconStatusChange',
    options: WorkflowVersionStatusOptions,
    defaultValue: "'DRAFT'",
  })
  @WorkspaceIsFieldUIReadOnly()
  status: WorkflowVersionStatus;

  @WorkspaceField({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Workflow version position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_WORKFLOW_VERSIONS,
    ),
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;

  // Relations
  @WorkspaceRelation({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.workflow,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workflow`,
    description: msg`WorkflowVersion workflow`,
    icon: 'IconSettingsAutomation',
    inverseSideTarget: () => WorkflowWorkspaceEntity,
    inverseSideFieldKey: 'versions',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  workflow: Relation<WorkflowWorkspaceEntity>;

  @WorkspaceJoinColumn('workflow')
  workflowId: string;

  @WorkspaceRelation({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.runs,
    type: RelationType.ONE_TO_MANY,
    label: msg`Runs`,
    description: msg`Workflow runs linked to the version.`,
    icon: 'IconRun',
    inverseSideTarget: () => WorkflowRunWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  runs: Relation<WorkflowRunWorkspaceEntity>;

  @WorkspaceRelation({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.favorites,
    type: RelationType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the workflow version`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline activities linked to the version`,
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    inverseSideFieldKey: 'targetWorkflowVersion',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
}
