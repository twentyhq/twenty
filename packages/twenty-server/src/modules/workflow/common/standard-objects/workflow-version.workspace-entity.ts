import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WORKFLOW_VERSION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';


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

const TITLE_FIELD_NAME = 'title';
const BODY_V2_FIELD_NAME = 'bodyV2';

export const SEARCH_FIELDS_FOR_WORKFLOW_VERSIONS: FieldTypeAndNameMetadata[] = [
  { name: TITLE_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: BODY_V2_FIELD_NAME, type: FieldMetadataType.RICH_TEXT_V2 },
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
export class WorkflowVersionWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The workflow version name`,
    icon: 'IconSettingsAutomation',
  })
  name: string;

  @WorkspaceField({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.trigger,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Version trigger`,
    description: msg`Json object to provide trigger`,
    icon: 'IconSettingsAutomation',
  })
  @WorkspaceIsNullable()
  trigger: WorkflowTrigger | null;

  @WorkspaceField({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.steps,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Version steps`,
    description: msg`Json object to provide steps`,
    icon: 'IconSettingsAutomation',
  })
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
  status: WorkflowVersionStatus;

  @WorkspaceField({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Workflow version position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
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
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline activities linked to the version`,
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
}
