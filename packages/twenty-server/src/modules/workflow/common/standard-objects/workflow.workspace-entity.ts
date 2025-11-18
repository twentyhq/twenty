import { msg } from '@lingui/core/macro';
import {
  ActorMetadata,
  FieldMetadataType,
  RelationOnDeleteAction,
} from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { type FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { createBaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WORKFLOW_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object.constant';
import {
  type FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkflowAutomatedTriggerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
}

const WorkflowStatusOptions: FieldMetadataComplexOption[] = [
  {
    value: WorkflowStatus.DRAFT,
    label: 'Draft',
    position: 0,
    color: 'yellow',
  },
  {
    value: WorkflowStatus.ACTIVE,
    label: 'Active',
    position: 1,
    color: 'green',
  },
  {
    value: WorkflowStatus.DEACTIVATED,
    label: 'Deactivated',
    position: 2,
    color: 'gray',
  },
];

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_WORKFLOWS: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  universalIdentifier: STANDARD_OBJECT_IDS.workflow,

  namePlural: 'workflows',
  labelSingular: msg`Workflow`,
  labelPlural: msg`Workflows`,
  description: msg`A workflow`,
  icon: STANDARD_OBJECT_ICONS.workflow,
  shortcut: 'W',
  labelIdentifierStandardId: WORKFLOW_STANDARD_FIELD_IDS.name,
})
export class WorkflowWorkspaceEntity extends createBaseWorkspaceEntity({
  id: STANDARD_OBJECTS.workflow.fields.id.universalIdentifier,
  createdAt: STANDARD_OBJECTS.workflow.fields.createdAt.universalIdentifier,
  updatedAt: STANDARD_OBJECTS.workflow.fields.updatedAt.universalIdentifier,
  deletedAt: STANDARD_OBJECTS.workflow.fields.deletedAt.universalIdentifier,
}) {
  @WorkspaceField({
    universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The workflow name`,
    icon: 'IconSettingsAutomation',
  })
  name: string;

  @WorkspaceField({
    universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.lastPublishedVersionId,
    type: FieldMetadataType.TEXT,
    label: msg`Last published Version Id`,
    description: msg`The workflow last published version id`,
    icon: 'IconVersions',
  })
  @WorkspaceIsNullable()
  @WorkspaceIsFieldUIReadOnly()
  lastPublishedVersionId: string | null;

  @WorkspaceField({
    universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.statuses,
    type: FieldMetadataType.MULTI_SELECT,
    label: msg`Statuses`,
    description: msg`The current statuses of the workflow versions`,
    icon: 'IconStatusChange',
    options: WorkflowStatusOptions,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsFieldUIReadOnly()
  statuses: WorkflowStatus[] | null;

  @WorkspaceField({
    universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Workflow record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_WORKFLOWS,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({
    indexType: IndexType.GIN,
    universalIdentifier: '20202020-a658-4030-bcef-2c2854feabba',
  })
  searchVector: string;

  // Relations
  @WorkspaceRelation({
    universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.versions,
    type: RelationType.ONE_TO_MANY,
    label: msg`Versions`,
    description: msg`Workflow versions linked to the workflow.`,
    icon: 'IconVersions',
    inverseSideTarget: () => WorkflowVersionWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  versions: Relation<WorkflowVersionWorkspaceEntity[]>;

  @WorkspaceRelation({
    universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.runs,
    type: RelationType.ONE_TO_MANY,
    label: msg`Runs`,
    description: msg`Workflow runs linked to the workflow.`,
    icon: 'IconRun',
    inverseSideTarget: () => WorkflowRunWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  runs: Relation<WorkflowRunWorkspaceEntity[]>;

  @WorkspaceRelation({
    universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.automatedTriggers,
    type: RelationType.ONE_TO_MANY,
    label: msg`Automated Triggers`,
    description: msg`Workflow automated triggers linked to the workflow.`,
    inverseSideTarget: () => WorkflowAutomatedTriggerWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  @WorkspaceIsFieldUIReadOnly()
  automatedTriggers: Relation<WorkflowAutomatedTriggerWorkspaceEntity[]>;

  @WorkspaceRelation({
    universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.favorites,
    type: RelationType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the workflow`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline activities linked to the workflow`,
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceRelation({
    universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.attachments,
    type: RelationType.ONE_TO_MANY,
    label: msg`Attachments`,
    description: msg`Attachments linked to the workflow`,
    icon: 'IconFileUpload',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceField({
    universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;
}
