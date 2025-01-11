import { FieldMetadataType } from 'twenty-shared';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { CurrencyMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsDeprecated } from 'src/engine/twenty-orm/decorators/workspace-is-deprecated.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { OPPORTUNITY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_OPPORTUNITY: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.opportunity,
  namePlural: 'opportunities',
  labelSingular: 'Opportunity',
  labelPlural: 'Opportunities',
  description: 'An opportunity',
  icon: STANDARD_OBJECT_ICONS.opportunity,
  shortcut: 'O',
  labelIdentifierStandardId: OPPORTUNITY_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsNotAuditLogged()
export class OpportunityWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'The opportunity name',
    icon: 'IconTargetArrow',
  })
  name: string;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.amount,
    type: FieldMetadataType.CURRENCY,
    label: 'Amount',
    description: 'Opportunity amount',
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  amount: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.closeDate,
    type: FieldMetadataType.DATE_TIME,
    label: 'Close date',
    description: 'Opportunity close date',
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  closeDate: Date | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.stage,
    type: FieldMetadataType.SELECT,
    label: 'Stage',
    description: 'Opportunity stage',
    icon: 'IconProgressCheck',
    options: [
      { value: 'NEW', label: 'New', position: 0, color: 'red' },
      { value: 'SCREENING', label: 'Screening', position: 1, color: 'purple' },
      { value: 'MEETING', label: 'Meeting', position: 2, color: 'sky' },
      {
        value: 'PROPOSAL',
        label: 'Proposal',
        position: 3,
        color: 'turquoise',
      },
      { value: 'CUSTOMER', label: 'Customer', position: 4, color: 'yellow' },
    ],
    defaultValue: "'NEW'",
  })
  @WorkspaceFieldIndex()
  stage: string;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Position',
    description: 'Opportunity record position',
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: 'Created by',
    icon: 'IconCreativeCommonsSa',
    description: 'The creator of the record',
    defaultValue: {
      source: `'${FieldActorSource.MANUAL}'`,
      name: "''",
    },
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.pointOfContact,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Point of Contact',
    description: 'Opportunity point of contact',
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'pointOfContactForOpportunities',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  pointOfContact: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceJoinColumn('pointOfContact')
  pointOfContactId: string | null;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.company,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Company',
    description: 'Opportunity company',
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'opportunities',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('company')
  companyId: string | null;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.favorites,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Favorites',
    description: 'Favorites linked to the opportunity',
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.taskTargets,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Tasks',
    description: 'Tasks tied to the opportunity',
    icon: 'IconCheckbox',
    inverseSideTarget: () => TaskTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  taskTargets: Relation<TaskTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.noteTargets,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Notes',
    description: 'Notes tied to the opportunity',
    icon: 'IconNotes',
    inverseSideTarget: () => NoteTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  noteTargets: Relation<NoteTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.attachments,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Attachments',
    description: 'Attachments linked to the opportunity',
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Timeline Activities',
    description: 'Timeline Activities linked to the opportunity.',
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.probabilityDeprecated,
    type: FieldMetadataType.TEXT,
    label: 'Probability',
    description: 'Opportunity probability',
    icon: 'IconProgressCheck',
    defaultValue: "'0'",
  })
  @WorkspaceIsDeprecated()
  probability: string;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_OPPORTUNITY,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  [SEARCH_VECTOR_FIELD.name]: any;
}
