import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { AddressMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/address.composite-type';
import { CurrencyMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { LinksMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsDeprecated } from 'src/engine/twenty-orm/decorators/workspace-is-deprecated.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { COMPANY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ActivityTargetWorkspaceEntity } from 'src/modules/activity/standard-objects/activity-target.workspace-entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.company,
  namePlural: 'companies',
  labelSingular: 'Empresa',
  labelPlural: 'Empresas',
  description: 'Uma empresa',
  icon: 'IconBuildingSkyscraper',
  labelIdentifierStandardId: COMPANY_STANDARD_FIELD_IDS.name,
  softDelete: true,
})
export class CompanyWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Nome',
    description: 'O nome da empresa',
    icon: 'IconBuildingSkyscraper',
  })
  name: string;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.domainName,
    type: FieldMetadataType.LINKS,
    label: 'Nome de Domínio',
    description:
      'A URL do site da empresa. Usamos esta URL para buscar o ícone da empresa',
    icon: 'IconLink',
  })
  domainName?: LinksMetadata;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.employees,
    type: FieldMetadataType.NUMBER,
    label: 'Funcionários',
    description: 'Número de funcionários na empresa',
    icon: 'IconUsers',
  })
  @WorkspaceIsNullable()
  employees: number | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.linkedinLink,
    type: FieldMetadataType.LINKS,
    label: 'Linkedin',
    description: 'A conta da empresa no Linkedin',
    icon: 'IconBrandLinkedin',
  })
  @WorkspaceIsNullable()
  linkedinLink: LinksMetadata | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.xLink,
    type: FieldMetadataType.LINKS,
    label: 'X',
    description: 'A conta da empresa no Twitter/X',
    icon: 'IconBrandX',
  })
  @WorkspaceIsNullable()
  xLink: LinksMetadata | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
    type: FieldMetadataType.CURRENCY,
    label: 'ARR',
    description:
      'Receita Recorrente Anual: A receita anual real ou estimada da empresa',
    icon: 'IconMoneybag',
  })
  @WorkspaceIsNullable()
  annualRecurringRevenue: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.address,
    type: FieldMetadataType.ADDRESS,
    label: 'Endereço',
    description: 'Endereço da empresa',
    icon: 'IconMap',
  })
  @WorkspaceIsNullable()
  address: AddressMetadata;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.idealCustomerProfile,
    type: FieldMetadataType.BOOLEAN,
    label: 'ICP',
    description:
      'Perfil de Cliente Ideal: Indica se a empresa é o cliente mais adequado e valioso para você',
    icon: 'IconTarget',
    defaultValue: false,
  })
  idealCustomerProfile: boolean;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Posição',
    description: 'Posição do registro da empresa',
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.createdBy,
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

  // Relations
  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.people,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Pessoas',
    description: 'Pessoas vinculadas à empresa.',
    icon: 'IconUsers',
    inverseSideTarget: () => PersonWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  people: Relation<PersonWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.accountOwner,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Responsável pela Conta',
    description:
      'Membro da sua equipe responsável por gerenciar a conta da empresa',
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForCompanies',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.activityTargets,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Atividades',
    description: 'Atividades vinculadas à empresa',
    icon: 'IconCheckbox',
    inverseSideTarget: () => ActivityTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  activityTargets: Relation<ActivityTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.taskTargets,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Tarefas',
    description: 'Tarefas vinculadas à empresa',
    icon: 'IconCheckbox',
    inverseSideTarget: () => TaskTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  taskTargets: Relation<TaskTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.noteTargets,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Notas',
    description: 'Notas vinculadas à empresa',
    icon: 'IconNotes',
    inverseSideTarget: () => NoteTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  noteTargets: Relation<NoteTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.opportunities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Oportunidades',
    description: 'Oportunidades vinculadas à empresa.',
    icon: 'IconTargetArrow',
    inverseSideTarget: () => OpportunityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  opportunities: Relation<OpportunityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.favorites,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Favoritos',
    description: 'Favoritos vinculados à empresa',
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.attachments,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Anexos',
    description: 'Anexos vinculados à empresa',
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: COMPANY_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Atividades da Linha do Tempo',
    description: 'Atividades da Linha do Tempo vinculadas à empresa',
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: COMPANY_STANDARD_FIELD_IDS.address_deprecated,
    type: FieldMetadataType.TEXT,
    label: 'Endereço (obsoleto) ',
    description:
      'Endereço da empresa - obsoleto em favor do novo campo de endereço',
    icon: 'IconMap',
  })
  @WorkspaceIsDeprecated()
  @WorkspaceIsNullable()
  addressOld: string;
}
