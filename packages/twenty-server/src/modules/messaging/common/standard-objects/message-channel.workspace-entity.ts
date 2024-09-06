import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MESSAGE_CHANNEL_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';

export enum MessageChannelSyncStatus {
  NOT_SYNCED = 'NOT_SYNCED',
  ONGOING = 'ONGOING',
  ACTIVE = 'ACTIVE',
  FAILED_INSUFFICIENT_PERMISSIONS = 'FAILED_INSUFFICIENT_PERMISSIONS',
  FAILED_UNKNOWN = 'FAILED_UNKNOWN',
}

export enum MessageChannelSyncStage {
  FULL_MESSAGE_LIST_FETCH_PENDING = 'FULL_MESSAGE_LIST_FETCH_PENDING',
  PARTIAL_MESSAGE_LIST_FETCH_PENDING = 'PARTIAL_MESSAGE_LIST_FETCH_PENDING',
  MESSAGE_LIST_FETCH_ONGOING = 'MESSAGE_LIST_FETCH_ONGOING',
  MESSAGES_IMPORT_PENDING = 'MESSAGES_IMPORT_PENDING',
  MESSAGES_IMPORT_ONGOING = 'MESSAGES_IMPORT_ONGOING',
  FAILED = 'FAILED',
}

export enum MessageChannelVisibility {
  METADATA = 'METADATA',
  SUBJECT = 'SUBJECT',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING',
}

export enum MessageChannelType {
  EMAIL = 'email',
  SMS = 'sms',
}

export enum MessageChannelContactAutoCreationPolicy {
  SENT_AND_RECEIVED = 'SENT_AND_RECEIVED',
  SENT = 'SENT',
  NONE = 'NONE',
}

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.messageChannel,
  namePlural: 'messageChannels',
  labelSingular: 'Canal de Mensagem',
  labelPlural: 'Canais de Mensagem',
  description: 'Canais de Mensagem',
  icon: 'IconMessage',
  labelIdentifierStandardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.handle,
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class MessageChannelWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.visibility,
    type: FieldMetadataType.SELECT,
    label: 'Visibilidade',
    description: 'Visibilidade',
    icon: 'IconEyeglass',
    options: [
      {
        value: MessageChannelVisibility.METADATA,
        label: 'Metadados',
        position: 0,
        color: 'green',
      },
      {
        value: MessageChannelVisibility.SUBJECT,
        label: 'Assunto',
        position: 1,
        color: 'blue',
      },
      {
        value: MessageChannelVisibility.SHARE_EVERYTHING,
        label: 'Compartilhar Tudo',
        position: 2,
        color: 'orange',
      },
    ],
    defaultValue: `'${MessageChannelVisibility.SHARE_EVERYTHING}'`,
  })
  visibility: string;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: 'Identificador',
    description: 'Identificador',
    icon: 'IconAt',
  })
  handle: string;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.SELECT,
    label: 'Tipo',
    description: 'Tipo de Canal',
    icon: 'IconMessage',
    options: [
      {
        value: MessageChannelType.EMAIL,
        label: 'Email',
        position: 0,
        color: 'green',
      },
      {
        value: MessageChannelType.SMS,
        label: 'SMS',
        position: 1,
        color: 'blue',
      },
    ],
    defaultValue: `'${MessageChannelType.EMAIL}'`,
  })
  type: string;

  // TODO: Deprecate this field and migrate data to contactAutoCreationFor
  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.isContactAutoCreationEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: 'Criação Automática de Contato Habilitada',
    description: 'Criação Automática de Contato Habilitada',
    icon: 'IconUserCircle',
    defaultValue: true,
  })
  isContactAutoCreationEnabled: boolean;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.contactAutoCreationPolicy,
    type: FieldMetadataType.SELECT,
    label: 'Política de Criação Automática de Contato',
    description:
      'Criar automaticamente registros de Pessoas ao receber ou enviar emails',
    icon: 'IconUserCircle',
    options: [
      {
        value: MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED,
        label: 'Enviados e Recebidos',
        position: 0,
        color: 'green',
      },
      {
        value: MessageChannelContactAutoCreationPolicy.SENT,
        label: 'Enviados',
        position: 1,
        color: 'blue',
      },
      {
        value: MessageChannelContactAutoCreationPolicy.NONE,
        label: 'Nenhum',
        position: 2,
        color: 'red',
      },
    ],
    defaultValue: `'${MessageChannelContactAutoCreationPolicy.SENT}'`,
  })
  contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.excludeNonProfessionalEmails,
    type: FieldMetadataType.BOOLEAN,
    label: 'Excluir Emails Não Profissionais',
    description: 'Excluir emails não profissionais',
    icon: 'IconBriefcase',
    defaultValue: true,
  })
  excludeNonProfessionalEmails: boolean;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.excludeGroupEmails,
    type: FieldMetadataType.BOOLEAN,
    label: 'Excluir Emails de Grupo',
    description: 'Excluir emails de grupo',
    icon: 'IconUsersGroup',
    defaultValue: true,
  })
  excludeGroupEmails: boolean;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.isSyncEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: 'Sincronização Habilitada',
    description: 'Sincronização Habilitada',
    icon: 'IconRefresh',
    defaultValue: true,
  })
  isSyncEnabled: boolean;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncCursor,
    type: FieldMetadataType.TEXT,
    label: 'Último Cursor de Sincronização',
    description: 'Último cursor de sincronização',
    icon: 'IconHistory',
  })
  syncCursor: string;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Última Data de Sincronização',
    description: 'Última data de sincronização',
    icon: 'IconHistory',
  })
  @WorkspaceIsNullable()
  syncedAt: string | null;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStatus,
    type: FieldMetadataType.SELECT,
    label: 'Status da Sincronização',
    description: 'Status da sincronização',
    icon: 'IconStatusChange',
    options: [
      {
        value: MessageChannelSyncStatus.ONGOING,
        label: 'Em Andamento',
        position: 1,
        color: 'yellow',
      },
      {
        value: MessageChannelSyncStatus.NOT_SYNCED,
        label: 'Não Sincronizado',
        position: 2,
        color: 'blue',
      },
      {
        value: MessageChannelSyncStatus.ACTIVE,
        label: 'Ativo',
        position: 3,
        color: 'green',
      },
      {
        value: MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
        label: 'Falha: Permissões Insuficientes',
        position: 4,
        color: 'red',
      },
      {
        value: MessageChannelSyncStatus.FAILED_UNKNOWN,
        label: 'Falha: Desconhecido',
        position: 5,
        color: 'red',
      },
    ],
  })
  @WorkspaceIsNullable()
  syncStatus: MessageChannelSyncStatus | null;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStage,
    type: FieldMetadataType.SELECT,
    label: 'Estágio de Sincronização',
    description: 'Estágio de sincronização',
    icon: 'IconStatusChange',
    options: [
      {
        value: MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
        label: 'Busca Completa da Lista de Mensagens Pendentes',
        position: 0,
        color: 'blue',
      },
      {
        value: MessageChannelSyncStage.PARTIAL_MESSAGE_LIST_FETCH_PENDING,
        label: 'Busca Parcial da Lista de Mensagens Pendentes',
        position: 1,
        color: 'blue',
      },
      {
        value: MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
        label: 'Busca da Lista de Mensagens Em Andamento',
        position: 2,
        color: 'orange',
      },
      {
        value: MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
        label: 'Importação de Mensagens Pendentes',
        position: 3,
        color: 'blue',
      },
      {
        value: MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
        label: 'Importação de Mensagens Em Andamento',
        position: 4,
        color: 'orange',
      },
      {
        value: MessageChannelSyncStage.FAILED,
        label: 'Falhou',
        position: 5,
        color: 'red',
      },
    ],
    defaultValue: `'${MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING}'`,
  })
  syncStage: MessageChannelSyncStage;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStageStartedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Estágio de Sincronização Iniciado Em',
    description: 'Estágio de sincronização iniciado em',
    icon: 'IconHistory',
  })
  @WorkspaceIsNullable()
  syncStageStartedAt: string | null;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.throttleFailureCount,
    type: FieldMetadataType.NUMBER,
    label: 'Contador de Falhas de Limitação',
    description: 'Contador de falhas de limitação',
    icon: 'IconX',
    defaultValue: 0,
  })
  throttleFailureCount: number;

  @WorkspaceRelation({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.connectedAccount,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Conta Conectada',
    description: 'Conta Conectada',
    icon: 'IconUserCircle',
    inverseSideTarget: () => ConnectedAccountWorkspaceEntity,
    inverseSideFieldKey: 'messageChannels',
  })
  connectedAccount: Relation<ConnectedAccountWorkspaceEntity>;

  @WorkspaceJoinColumn('connectedAccount')
  connectedAccountId: string;

  @WorkspaceRelation({
    standardId:
      MESSAGE_CHANNEL_STANDARD_FIELD_IDS.messageChannelMessageAssociations,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Associação de Canal de Mensagem',
    description: 'Mensagens do canal.',
    icon: 'IconMessage',
    inverseSideTarget: () => MessageChannelMessageAssociationWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  messageChannelMessageAssociations: Relation<
    MessageChannelMessageAssociationWorkspaceEntity[]
  >;
}
