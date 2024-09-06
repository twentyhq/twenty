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
import { CALENDAR_CHANNEL_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export enum CalendarChannelVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING',
}

export enum CalendarChannelSyncStatus {
  NOT_SYNCED = 'NOT_SYNCED',
  ONGOING = 'ONGOING',
  ACTIVE = 'ACTIVE',
  FAILED_INSUFFICIENT_PERMISSIONS = 'FAILED_INSUFFICIENT_PERMISSIONS',
  FAILED_UNKNOWN = 'FAILED_UNKNOWN',
}

export enum CalendarChannelSyncStage {
  FULL_CALENDAR_EVENT_LIST_FETCH_PENDING = 'FULL_CALENDAR_EVENT_LIST_FETCH_PENDING',
  PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING = 'PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING',
  CALENDAR_EVENT_LIST_FETCH_ONGOING = 'CALENDAR_EVENT_LIST_FETCH_ONGOING',
  CALENDAR_EVENTS_IMPORT_PENDING = 'CALENDAR_EVENTS_IMPORT_PENDING',
  CALENDAR_EVENTS_IMPORT_ONGOING = 'CALENDAR_EVENTS_IMPORT_ONGOING',
  FAILED = 'FAILED',
}

export enum CalendarChannelContactAutoCreationPolicy {
  AS_PARTICIPANT_AND_ORGANIZER = 'AS_PARTICIPANT_AND_ORGANIZER',
  AS_PARTICIPANT = 'AS_PARTICIPANT',
  AS_ORGANIZER = 'AS_ORGANIZER',
  NONE = 'NONE',
}

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.calendarChannel,
  namePlural: 'calendarChannels',
  labelSingular: 'Canal de Calendário',
  labelPlural: 'Canais de Calendário',
  description: 'Canais de Calendário',
  icon: 'IconCalendar',
  labelIdentifierStandardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.handle,
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class CalendarChannelWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: 'Identificador',
    description: 'Identificador',
    icon: 'IconAt',
  })
  handle: string;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStatus,
    type: FieldMetadataType.SELECT,
    label: 'Status de Sincronização',
    description: 'Status de Sincronização',
    icon: 'IconStatusChange',
    options: [
      {
        value: CalendarChannelSyncStatus.ONGOING,
        label: 'Em Andamento',
        position: 1,
        color: 'yellow',
      },
      {
        value: CalendarChannelSyncStatus.NOT_SYNCED,
        label: 'Não Sincronizado',
        position: 2,
        color: 'blue',
      },
      {
        value: CalendarChannelSyncStatus.ACTIVE,
        label: 'Ativo',
        position: 3,
        color: 'green',
      },
      {
        value: CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
        label: 'Falha por Permissões Insuficientes',
        position: 4,
        color: 'red',
      },
      {
        value: CalendarChannelSyncStatus.FAILED_UNKNOWN,
        label: 'Falha Desconhecida',
        position: 5,
        color: 'red',
      },
    ],
  })
  @WorkspaceIsNullable()
  syncStatus: CalendarChannelSyncStatus | null;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStage,
    type: FieldMetadataType.SELECT,
    label: 'Estágio de Sincronização',
    description: 'Estágio de Sincronização',
    icon: 'IconStatusChange',
    options: [
      {
        value: CalendarChannelSyncStage.FULL_CALENDAR_EVENT_LIST_FETCH_PENDING,
        label: 'Aguardando Busca Completa de Eventos',
        position: 0,
        color: 'blue',
      },
      {
        value:
          CalendarChannelSyncStage.PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING,
        label: 'Aguardando Busca Parcial de Eventos',
        position: 1,
        color: 'blue',
      },
      {
        value: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
        label: 'Busca de Eventos em Andamento',
        position: 2,
        color: 'orange',
      },
      {
        value: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
        label: 'Aguardando Importação de Eventos',
        position: 3,
        color: 'blue',
      },
      {
        value: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_ONGOING,
        label: 'Importação de Eventos em Andamento',
        position: 4,
        color: 'orange',
      },
      {
        value: CalendarChannelSyncStage.FAILED,
        label: 'Falhou',
        position: 5,
        color: 'red',
      },
    ],
    defaultValue: `'${CalendarChannelSyncStage.FULL_CALENDAR_EVENT_LIST_FETCH_PENDING}'`,
  })
  syncStage: CalendarChannelSyncStage;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.visibility,
    type: FieldMetadataType.SELECT,
    label: 'Visibilidade',
    description: 'Visibilidade',
    icon: 'IconEyeglass',
    options: [
      {
        value: CalendarChannelVisibility.METADATA,
        label: 'Metadados',
        position: 0,
        color: 'green',
      },
      {
        value: CalendarChannelVisibility.SHARE_EVERYTHING,
        label: 'Compartilhar Tudo',
        position: 1,
        color: 'orange',
      },
    ],
    defaultValue: `'${CalendarChannelVisibility.SHARE_EVERYTHING}'`,
  })
  visibility: string;

  @WorkspaceField({
    standardId:
      CALENDAR_CHANNEL_STANDARD_FIELD_IDS.isContactAutoCreationEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: 'Criação Automática de Contato Ativada',
    description: 'Criação Automática de Contato Ativada',
    icon: 'IconUserCircle',
    defaultValue: true,
  })
  isContactAutoCreationEnabled: boolean;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.contactAutoCreationPolicy,
    type: FieldMetadataType.SELECT,
    label: 'Política de Criação Automática de Contato',
    description:
      'Crie automaticamente registros para pessoas com as quais você participou de um evento.',
    icon: 'IconUserCircle',
    options: [
      {
        value:
          CalendarChannelContactAutoCreationPolicy.AS_PARTICIPANT_AND_ORGANIZER,
        label: 'Como Participante e Organizador',
        color: 'green',
        position: 0,
      },
      {
        value: CalendarChannelContactAutoCreationPolicy.AS_PARTICIPANT,
        label: 'Como Participante',
        color: 'orange',
        position: 1,
      },
      {
        value: CalendarChannelContactAutoCreationPolicy.AS_ORGANIZER,
        label: 'Como Organizador',
        color: 'blue',
        position: 2,
      },
      {
        value: CalendarChannelContactAutoCreationPolicy.NONE,
        label: 'Nenhum',
        color: 'red',
        position: 3,
      },
    ],
    defaultValue: `'${CalendarChannelContactAutoCreationPolicy.AS_PARTICIPANT_AND_ORGANIZER}'`,
  })
  contactAutoCreationPolicy: CalendarChannelContactAutoCreationPolicy;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.isSyncEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: 'Sincronização Ativada',
    description: 'Sincronização Ativada',
    icon: 'IconRefresh',
    defaultValue: true,
  })
  isSyncEnabled: boolean;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncCursor,
    type: FieldMetadataType.TEXT,
    label: 'Cursor de Sincronização',
    description:
      'Cursor de Sincronização. Usado para sincronizar eventos do provedor de calendário',
    icon: 'IconReload',
  })
  syncCursor: string;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStageStartedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Estágio de Sincronização Iniciado em',
    description: 'Estágio de Sincronização Iniciado em',
    icon: 'IconHistory',
  })
  @WorkspaceIsNullable()
  syncStageStartedAt: string | null;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.throttleFailureCount,
    type: FieldMetadataType.NUMBER,
    label: 'Contagem de Falhas por Limitação',
    description: 'Contagem de Falhas por Limitação',
    icon: 'IconX',
    defaultValue: 0,
  })
  throttleFailureCount: number;

  @WorkspaceRelation({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.connectedAccount,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Conta Conectada',
    description: 'Conta Conectada',
    icon: 'IconUserCircle',
    inverseSideTarget: () => ConnectedAccountWorkspaceEntity,
    inverseSideFieldKey: 'calendarChannels',
  })
  connectedAccount: Relation<ConnectedAccountWorkspaceEntity>;

  @WorkspaceJoinColumn('connectedAccount')
  connectedAccountId: string;

  @WorkspaceRelation({
    standardId:
      CALENDAR_CHANNEL_STANDARD_FIELD_IDS.calendarChannelEventAssociations,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Associações de Eventos do Canal de Calendário',
    description: 'Associações de Eventos do Canal de Calendário',
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarChannelEventAssociationWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  calendarChannelEventAssociations: Relation<
    CalendarChannelEventAssociationWorkspaceEntity[]
  >;
}
