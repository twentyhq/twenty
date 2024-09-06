import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { CurrencyMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIndex } from 'src/engine/twenty-orm/decorators/workspace-index.decorator';
import { WorkspaceIsDeprecated } from 'src/engine/twenty-orm/decorators/workspace-is-deprecated.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { OPPORTUNITY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ActivityTargetWorkspaceEntity } from 'src/modules/activity/standard-objects/activity-target.workspace-entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.opportunity,
  namePlural: 'opportunities',
  labelSingular: 'Oportunidade',
  labelPlural: 'Oportunidades',
  description: 'Uma oportunidade',
  icon: 'IconTargetArrow',
  labelIdentifierStandardId: OPPORTUNITY_STANDARD_FIELD_IDS.name,
  softDelete: true,
})
@WorkspaceIsNotAuditLogged()
export class OpportunityWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Nome',
    description: 'O nome da oportunidade',
    icon: 'IconTargetArrow',
  })
  name: string;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.amount,
    type: FieldMetadataType.CURRENCY,
    label: 'Valor',
    description: 'Valor da oportunidade',
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  amount: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.closeDate,
    type: FieldMetadataType.DATE_TIME,
    label: 'Data de Fechamento',
    description: 'Data de fechamento da oportunidade',
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  closeDate: Date | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.stage,
    type: FieldMetadataType.SELECT,
    label: 'Etapa',
    description: 'Etapa da oportunidade',
    icon: 'IconProgressCheck',
    options: [
      { value: 'NEW', label: 'Novo', position: 0, color: 'red' },
      { value: 'SCREENING', label: 'Triagem', position: 1, color: 'purple' },
      { value: 'MEETING', label: 'Reunião', position: 2, color: 'sky' },
      {
        value: 'PROPOSAL',
        label: 'Proposta',
        position: 3,
        color: 'turquoise',
      },
      { value: 'CUSTOMER', label: 'Cliente', position: 4, color: 'yellow' },
    ],
    defaultValue: "'NEW'",
  })
  @WorkspaceIndex()
  stage: string;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Posição',
    description: 'Posição do registro da oportunidade',
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: 'Criado por',
    icon: 'IconCreativeCommonsSa',
    description: 'O criador do registro',
    defaultValue: {
      source: `'${FieldActorSource.MANUAL}'`,
      name: "''",
    },
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.pointOfContact,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Ponto de Contato',
    description: 'Ponto de contato da oportunidade',
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
    label: 'Empresa',
    description: 'Empresa da oportunidade',
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
    label: 'Favoritos',
    description: 'Favoritos vinculados à oportunidade',
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.activityTargets,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Atividades',
    description: 'Atividades vinculadas à oportunidade',
    icon: 'IconCheckbox',
    inverseSideTarget: () => ActivityTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  activityTargets: Relation<ActivityTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.taskTargets,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Tarefas',
    description: 'Tarefas vinculadas à oportunidade',
    icon: 'IconCheckbox',
    inverseSideTarget: () => TaskTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  taskTargets: Relation<TaskTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.noteTargets,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Notas',
    description: 'Notas vinculadas à oportunidade',
    icon: 'IconNotes',
    inverseSideTarget: () => NoteTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  noteTargets: Relation<NoteTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.attachments,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Anexos',
    description: 'Anexos vinculados à oportunidade',
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Atividades da Linha do Tempo',
    description: 'Atividades da linha do tempo vinculadas à oportunidade.',
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: OPPORTUNITY_STANDARD_FIELD_IDS.probabilityDeprecated,
    type: FieldMetadataType.TEXT,
    label: 'Probabilidade',
    description: 'Probabilidade da oportunidade',
    icon: 'IconProgressCheck',
    defaultValue: "'0'",
  })
  @WorkspaceIsDeprecated()
  probability: string;
}
