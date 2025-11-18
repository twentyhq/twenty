import { msg } from '@lingui/core/macro';
import { FieldMetadataType, RelationOnDeleteAction } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { createBaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { WorkspaceDynamicRelation } from 'src/engine/twenty-orm/decorators/workspace-dynamic-relation.decorator';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { FAVORITE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object.constant';
import { createDeterministicUuid } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';
import { FavoriteFolderWorkspaceEntity } from 'src/modules/favorite-folder/standard-objects/favorite-folder.workspace-entity';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  universalIdentifier: STANDARD_OBJECT_IDS.favorite,

  namePlural: 'favorites',
  labelSingular: msg`Favorite`,
  labelPlural: msg`Favorites`,
  description: msg`A favorite that can be accessed from the left menu`,
  icon: STANDARD_OBJECT_ICONS.favorite,
})
@WorkspaceIsSystem()
export class FavoriteWorkspaceEntity extends createBaseWorkspaceEntity({
  id: STANDARD_OBJECTS.favorite.fields.id.universalIdentifier,
  createdAt: STANDARD_OBJECTS.favorite.fields.createdAt.universalIdentifier,
  updatedAt: STANDARD_OBJECTS.favorite.fields.updatedAt.universalIdentifier,
  deletedAt: STANDARD_OBJECTS.favorite.fields.deletedAt.universalIdentifier,
}) {
  @WorkspaceField({
    universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.NUMBER,
    label: msg`Position`,
    description: msg`Favorite position`,
    icon: 'IconList',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  // Relations
  @WorkspaceRelation({
    universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.forWorkspaceMember,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workspace Member`,
    description: msg`Favorite workspace member`,
    icon: 'IconCircleUser',
    inverseSideFieldKey: 'favorites',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  forWorkspaceMember: Relation<WorkspaceMemberWorkspaceEntity>;

  @WorkspaceJoinColumn({
    relationPropertyKey: 'forWorkspaceMember',
    universalIdentifier: '36ed0eb0-2f88-508d-a11e-9260355c600c',
  })
  forWorkspaceMemberId: string;

  @WorkspaceRelation({
    universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.person,
    type: RelationType.MANY_TO_ONE,
    label: msg`Person`,
    description: msg`Favorite person`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'favorites',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  person: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceJoinColumn({
    relationPropertyKey: 'person',
    universalIdentifier: 'ba35569f-fe72-50e1-900c-b30d05791c05',
  })
  personId: string;

  @WorkspaceRelation({
    universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.company,
    type: RelationType.MANY_TO_ONE,
    label: msg`Company`,
    description: msg`Favorite company`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'favorites',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn({
    relationPropertyKey: 'company',
    universalIdentifier: '6ccff7cf-66a9-5df5-97f7-bc62ff3d4692',
  })
  companyId: string;

  @WorkspaceRelation({
    universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.favoriteFolder,
    type: RelationType.MANY_TO_ONE,
    label: msg`Favorite Folder`,
    description: msg`The folder this favorite belongs to`,
    icon: 'IconFolder',
    inverseSideTarget: () => FavoriteFolderWorkspaceEntity,
    inverseSideFieldKey: 'favorites',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  favoriteFolder: Relation<FavoriteFolderWorkspaceEntity> | null;

  @WorkspaceJoinColumn({
    relationPropertyKey: 'favoriteFolder',
    universalIdentifier: '4f836e9c-34d0-585a-8a11-19107ea30991',
  })
  favoriteFolderId: string;

  @WorkspaceRelation({
    universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.opportunity,
    type: RelationType.MANY_TO_ONE,
    label: msg`Opportunity`,
    description: msg`Favorite opportunity`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => OpportunityWorkspaceEntity,
    inverseSideFieldKey: 'favorites',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  opportunity: Relation<OpportunityWorkspaceEntity> | null;

  @WorkspaceJoinColumn({
    relationPropertyKey: 'opportunity',
    universalIdentifier: '41d6a9e5-1449-5bbd-ab7b-31909dac63cc',
  })
  opportunityId: string;

  @WorkspaceRelation({
    universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.workflow,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workflow`,
    description: msg`Favorite workflow`,
    icon: 'IconSettingsAutomation',
    inverseSideTarget: () => WorkflowWorkspaceEntity,
    inverseSideFieldKey: 'favorites',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  workflow: Relation<WorkflowWorkspaceEntity> | null;

  @WorkspaceJoinColumn({
    relationPropertyKey: 'workflow',
    universalIdentifier: '9fb5981c-a9b3-5ccb-a815-0eb9293c92c1',
  })
  workflowId: string;

  @WorkspaceRelation({
    universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.workflowVersion,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workflow`,
    description: msg`Favorite workflow version`,
    icon: 'IconSettingsAutomation',
    inverseSideTarget: () => WorkflowVersionWorkspaceEntity,
    inverseSideFieldKey: 'favorites',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  workflowVersion: Relation<WorkflowVersionWorkspaceEntity> | null;

  @WorkspaceJoinColumn({
    relationPropertyKey: 'workflowVersion',
    universalIdentifier: '3ecf4d57-c7a5-5b4b-a70c-77a30636fa98',
  })
  workflowVersionId: string;

  @WorkspaceRelation({
    universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.workflowRun,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workflow`,
    description: msg`Favorite workflow run`,
    icon: 'IconSettingsAutomation',
    inverseSideTarget: () => WorkflowRunWorkspaceEntity,
    inverseSideFieldKey: 'favorites',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  workflowRun: Relation<WorkflowRunWorkspaceEntity> | null;

  @WorkspaceJoinColumn({
    relationPropertyKey: 'workflowRun',
    universalIdentifier: '3944a212-2e0d-5c5f-b4d7-124fc72e6ae4',
  })
  workflowRunId: string;

  @WorkspaceRelation({
    universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.task,
    type: RelationType.MANY_TO_ONE,
    label: msg`Task`,
    description: msg`Favorite task`,
    icon: 'IconCheckbox',
    inverseSideTarget: () => TaskWorkspaceEntity,
    inverseSideFieldKey: 'favorites',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  task: Relation<TaskWorkspaceEntity> | null;

  @WorkspaceJoinColumn({
    relationPropertyKey: 'task',
    universalIdentifier: '519dadc5-4e25-57f0-a297-947160ebd1b7',
  })
  taskId: string;

  @WorkspaceRelation({
    universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.note,
    type: RelationType.MANY_TO_ONE,
    label: msg`Note`,
    description: msg`Favorite note`,
    icon: 'IconNotes',
    inverseSideTarget: () => NoteWorkspaceEntity,
    inverseSideFieldKey: 'favorites',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  note: Relation<NoteWorkspaceEntity> | null;

  @WorkspaceJoinColumn({
    relationPropertyKey: 'note',
    universalIdentifier: '61b6abcd-a1c0-5c34-9263-7bb7568bb50f',
  })
  noteId: string;

  @WorkspaceRelation({
    universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.dashboard,
    type: RelationType.MANY_TO_ONE,
    label: msg`Dashboard`,
    description: msg`Favorite dashboard`,
    icon: 'IconLayoutDashboard',
    inverseSideTarget: () => DashboardWorkspaceEntity,
    inverseSideFieldKey: 'favorites',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  dashboard: Relation<DashboardWorkspaceEntity> | null;

  @WorkspaceJoinColumn({
    relationPropertyKey: 'dashboard',
    universalIdentifier: '746a84bb-fd5a-5c40-8bf4-488941b22a3a',
  })
  dashboardId: string;

  @WorkspaceField({
    universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.view,
    type: FieldMetadataType.UUID,
    label: msg`ViewId`,
    description: msg`ViewId`,
    icon: 'IconView',
  })
  @WorkspaceIsNullable()
  viewId: string;

  @WorkspaceDynamicRelation({
    type: RelationType.MANY_TO_ONE,
    argsFactory: (oppositeObjectMetadata) => ({
      standardId: FAVORITE_STANDARD_FIELD_IDS.custom,
      name: oppositeObjectMetadata.nameSingular,
      label: oppositeObjectMetadata.labelSingular,
      description: `Favorite ${oppositeObjectMetadata.labelSingular}`,
      joinColumn: `${oppositeObjectMetadata.nameSingular}Id`,
      icon: 'IconHeart',
      universalIdentifier: createDeterministicUuid([
        STANDARD_OBJECTS.favorite.universalIdentifier,
        oppositeObjectMetadata.universalIdentifier,
      ]),
    }),
    inverseSideTarget: () => CustomWorkspaceEntity,
    inverseSideFieldKey: 'favorites',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  custom: Relation<CustomWorkspaceEntity>;
}
