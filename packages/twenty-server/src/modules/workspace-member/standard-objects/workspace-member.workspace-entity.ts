import { registerEnumType } from '@nestjs/graphql';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FullNameMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/full-name.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WORKSPACE_MEMBER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ActivityWorkspaceEntity } from 'src/modules/activity/standard-objects/activity.workspace-entity';
import { CommentWorkspaceEntity } from 'src/modules/activity/standard-objects/comment.workspace-entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadSubscriberWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread-subscriber.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';
import { AuditLogWorkspaceEntity } from 'src/modules/timeline/standard-objects/audit-log.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

export enum WorkspaceMemberDateFormatEnum {
  SYSTEM = 'SYSTEM',
  MONTH_FIRST = 'MONTH_FIRST',
  DAY_FIRST = 'DAY_FIRST',
  YEAR_FIRST = 'YEAR_FIRST',
}

export enum WorkspaceMemberTimeFormatEnum {
  SYSTEM = 'SYSTEM',
  HOUR_12 = 'HOUR_12',
  HOUR_24 = 'HOUR_24',
}

registerEnumType(WorkspaceMemberTimeFormatEnum, {
  name: 'WorkspaceMemberTimeFormatEnum',
  description: 'Formato de hora como Militar, Padrão ou sistema como padrão',
});

registerEnumType(WorkspaceMemberDateFormatEnum, {
  name: 'WorkspaceMemberDateFormatEnum',
  description:
    'Formato de data como Mês Primeiro, Dia Primeiro, Ano Primeiro ou sistema como padrão',
});

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.workspaceMember,
  namePlural: 'workspaceMembers',
  labelSingular: 'Membro do Workspace',
  labelPlural: 'Membros do Workspace',
  description: 'Um membro do workspace',
  icon: 'IconUserCircle',
  labelIdentifierStandardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class WorkspaceMemberWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.FULL_NAME,
    label: 'Nome',
    description: 'Nome do membro do workspace',
    icon: 'IconCircleUser',
  })
  name: FullNameMetadata;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.colorScheme,
    type: FieldMetadataType.TEXT,
    label: 'Esquema de Cores',
    description: 'Esquema de cores preferido',
    icon: 'IconColorSwatch',
    defaultValue: "'Light'",
  })
  colorScheme: string;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.locale,
    type: FieldMetadataType.TEXT,
    label: 'Idioma',
    description: 'Idioma preferido',
    icon: 'IconLanguage',
    defaultValue: "'pt-BR'",
  })
  locale: string;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.avatarUrl,
    type: FieldMetadataType.TEXT,
    label: 'URL do Avatar',
    description: 'Avatar do membro do workspace',
    icon: 'IconFileUpload',
  })
  avatarUrl: string;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.userEmail,
    type: FieldMetadataType.TEXT,
    label: 'Email do Usuário',
    description: 'Endereço de email do usuário relacionado',
    icon: 'IconMail',
  })
  userEmail: string;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.userId,
    type: FieldMetadataType.UUID,
    label: 'ID do Usuário',
    description: 'ID do usuário associado',
    icon: 'IconCircleUsers',
  })
  userId: string;

  // Relations
  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.authoredActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Atividades Criadas',
    description: 'Atividades criadas pelo membro do workspace',
    icon: 'IconCheckbox',
    inverseSideTarget: () => ActivityWorkspaceEntity,
    inverseSideFieldKey: 'author',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  authoredActivities: Relation<ActivityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.assignedActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Atividades Atribuídas',
    description: 'Atividades atribuídas ao membro do workspace',
    icon: 'IconCheckbox',
    inverseSideTarget: () => ActivityWorkspaceEntity,
    inverseSideFieldKey: 'assignee',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  assignedActivities: Relation<ActivityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.assignedTasks,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Tarefas Atribuídas',
    description: 'Tarefas atribuídas ao membro do workspace',
    icon: 'IconCheckbox',
    inverseSideTarget: () => TaskWorkspaceEntity,
    inverseSideFieldKey: 'assignee',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  assignedTasks: Relation<TaskWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.favorites,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Favoritos',
    description: 'Favoritos vinculados ao membro do workspace',
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.messageThreadSubscribers,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Assinantes de Mensagens',
    description: 'Assinantes de mensagens para este membro do workspace',
    icon: 'IconMessage',
    inverseSideTarget: () => MessageThreadSubscriberWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceGate({
    featureFlag: FeatureFlagKey.IsMessageThreadSubscriberEnabled,
  })
  messageThreadSubscribers: Relation<MessageThreadSubscriberWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.accountOwnerForCompanies,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Proprietário da Conta para Empresas',
    description: 'Proprietário da conta para empresas',
    icon: 'IconBriefcase',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForCompanies: Relation<CompanyWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.authoredAttachments,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Anexos Criados',
    description: 'Anexos criados pelo membro do workspace',
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    inverseSideFieldKey: 'author',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  authoredAttachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.authoredComments,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Comentários Criados',
    description: 'Comentários criados pelo membro do workspace',
    icon: 'IconComment',
    inverseSideTarget: () => CommentWorkspaceEntity,
    inverseSideFieldKey: 'author',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  authoredComments: Relation<CommentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.connectedAccounts,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Contas Conectadas',
    description: 'Contas conectadas',
    icon: 'IconAt',
    inverseSideTarget: () => ConnectedAccountWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  connectedAccounts: Relation<ConnectedAccountWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.messageParticipants,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Participantes de Mensagens',
    description: 'Participantes de mensagens',
    icon: 'IconUserCircle',
    inverseSideTarget: () => MessageParticipantWorkspaceEntity,
    inverseSideFieldKey: 'workspaceMember',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  messageParticipants: Relation<MessageParticipantWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.blocklist,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Blocklist',
    description: 'Identificadores da blocklist',
    icon: 'IconForbid2',
    inverseSideTarget: () => BlocklistWorkspaceEntity,
    inverseSideFieldKey: 'workspaceMember',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  blocklist: Relation<BlocklistWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.calendarEventParticipants,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Participantes de Eventos no Calendário',
    description: 'Participantes de eventos no calendário',
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarEventParticipantWorkspaceEntity,
    inverseSideFieldKey: 'workspaceMember',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  calendarEventParticipants: Relation<
    CalendarEventParticipantWorkspaceEntity[]
  >;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Eventos',
    description: 'Eventos vinculados ao membro do workspace',
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.auditLogs,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Logs de Auditoria',
    description: 'Logs de auditoria vinculados ao membro do workspace',
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => AuditLogWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  auditLogs: Relation<AuditLogWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.timeZone,
    type: FieldMetadataType.TEXT,
    label: 'Fuso Horário',
    defaultValue: "'system'",
    description: 'Fuso horário do usuário',
    icon: 'IconTimezone',
  })
  timeZone: string;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.dateFormat,
    type: FieldMetadataType.SELECT,
    label: 'Formato de Data',
    description: "Formato de data preferido do usuário",
    icon: 'IconCalendarEvent',
    options: [
      {
        value: WorkspaceMemberDateFormatEnum.SYSTEM,
        label: 'Sistema',
        position: 0,
        color: 'turquoise',
      },
      {
        value: WorkspaceMemberDateFormatEnum.MONTH_FIRST,
        label: 'Mês Primeiro',
        position: 1,
        color: 'red',
      },
      {
        value: WorkspaceMemberDateFormatEnum.DAY_FIRST,
        label: 'Dia Primeiro',
        position: 2,
        color: 'purple',
      },
      {
        value: WorkspaceMemberDateFormatEnum.YEAR_FIRST,
        label: 'Ano Primeiro',
        position: 3,
        color: 'sky',
      },
    ],
    defaultValue: `'${WorkspaceMemberDateFormatEnum.SYSTEM}'`,
  })
  dateFormat: string;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.timeFormat,
    type: FieldMetadataType.SELECT,
    label: 'Formato de Hora',
    description: "Formato de hora preferido do usuário",
    icon: 'IconClock2',
    options: [
      {
        value: WorkspaceMemberTimeFormatEnum.SYSTEM,
        label: 'Sistema',
        position: 0,
        color: 'sky',
      },
      {
        value: WorkspaceMemberTimeFormatEnum.HOUR_24,
        label: '24HRS',
        position: 1,
        color: 'red',
      },
      {
        value: WorkspaceMemberTimeFormatEnum.HOUR_12,
        label: '12HRS',
        position: 2,
        color: 'purple',
      },
    ],
    defaultValue: `'${WorkspaceMemberTimeFormatEnum.SYSTEM}'`,
  })
  timeFormat: string;
}
