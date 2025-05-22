import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { CurrencyMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
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
  labelSingular: msg`Opportunity`,
  labelPlural: msg`Opportunities`,
  description: msg`An opportunity`,
  icon: STANDARD_OBJECT_ICONS.opportunity,
  shortcut: 'O',
  labelIdentifierStandardId: OPPORTUNITY_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class OpportunityWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The opportunity name`,
    icon: 'IconTargetArrow',
  })
  name: string;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.closeDate,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Close date`,
    description: msg`Opportunity close date`,
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  closeDate: Date | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.stage,
    type: FieldMetadataType.SELECT,
    label: msg`Stage`,
    description: msg`Opportunity stage`,
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
    label: msg`Position`,
    description: msg`Opportunity record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.pointOfContact,
    type: RelationType.MANY_TO_ONE,
    label: msg`Point of Contact`,
    description: msg`Opportunity point of contact`,
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
    type: RelationType.MANY_TO_ONE,
    label: msg`Company`,
    description: msg`Opportunity company`,
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
    type: RelationType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the opportunity`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.taskTargets,
    type: RelationType.ONE_TO_MANY,
    label: msg`Tasks`,
    description: msg`Tasks tied to the opportunity`,
    icon: 'IconCheckbox',
    inverseSideTarget: () => TaskTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  taskTargets: Relation<TaskTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.noteTargets,
    type: RelationType.ONE_TO_MANY,
    label: msg`Notes`,
    description: msg`Notes tied to the opportunity`,
    icon: 'IconNotes',
    inverseSideTarget: () => NoteTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  noteTargets: Relation<NoteTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.attachments,
    type: RelationType.ONE_TO_MANY,
    label: msg`Attachments`,
    description: msg`Attachments linked to the opportunity.`,
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the opportunity.`,
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

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
  searchVector: any;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.produto,
    type: FieldMetadataType.TEXT,
    label: msg`Produto`,
    description: msg`Opportunity product`,
    icon: 'IconPackage',
  })
  @WorkspaceIsNullable()
  produto: string | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.valorBruto,
    type: FieldMetadataType.CURRENCY,
    label: msg`Valor Bruto`,
    description: msg`Opportunity gross value`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  valorBruto: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.valorLiquido,
    type: FieldMetadataType.CURRENCY,
    label: msg`Valor Liquido`,
    description: msg`Opportunity net value`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  valorLiquido: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.prazo,
    type: FieldMetadataType.TEXT,
    label: msg`Prazo`,
    description: msg`Opportunity term (e.g., 84 months)`,
    icon: 'IconCalendarStats',
  })
  @WorkspaceIsNullable()
  prazo: string | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.parcela,
    type: FieldMetadataType.CURRENCY,
    label: msg`Parcela`,
    description: msg`Opportunity installment amount in BRL`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  parcela: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.totalEmprestimo,
    type: FieldMetadataType.CURRENCY,
    label: msg`Total do empréstimo`,
    description: msg`Opportunity total loan amount in BRL`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  totalEmprestimo: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.ade,
    type: FieldMetadataType.TEXT,
    label: msg`ADE`,
    description: msg`Opportunity ADE`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  ade: string | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.promotora,
    type: FieldMetadataType.TEXT,
    label: msg`Promotora`,
    description: msg`Opportunity promoter`,
    icon: 'IconBuildingBank',
  })
  @WorkspaceIsNullable()
  promotora: string | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.percentual,
    type: FieldMetadataType.NUMBER,
    label: msg`Percentual`,
    description: msg`Opportunity percentage`,
    icon: 'IconPercent',
  })
  @WorkspaceIsNullable()
  percentual: number | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.comissao,
    type: FieldMetadataType.CURRENCY,
    label: msg`Comissão`,
    description: msg`Opportunity commission amount`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  comissao: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.statusOpportunity,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Opportunity status`,
    icon: 'IconStatusChange',
    options: [
      { value: 'OPEN', label: 'Open', position: 0, color: 'blue' },
      { value: 'WON', label: 'Won', position: 1, color: 'green' },
      { value: 'LOST', label: 'Lost', position: 2, color: 'red' },
    ],
    defaultValue: "'OPEN'",
  })
  @WorkspaceIsNullable()
  statusOpportunity: string | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.observacoesOpportunity,
    type: FieldMetadataType.TEXT,
    label: msg`Observações`,
    description: msg`Opportunity observations`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  observacoesOpportunity: string | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.pagoComissao,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Pago Comissão`,
    description: msg`Indicates if the commission has been paid`,
    icon: 'IconCurrencyReal',
    defaultValue: false,
  })
  pagoComissao: boolean;
}
