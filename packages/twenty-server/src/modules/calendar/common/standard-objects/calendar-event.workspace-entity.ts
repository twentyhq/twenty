import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { LinksMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';
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
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CALENDAR_EVENT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.calendarEvent,
  namePlural: 'calendarEvents',
  labelSingular: 'Evento de Calendário',
  labelPlural: 'Eventos de Calendário',
  description: 'Eventos de Calendário',
  icon: 'IconCalendar',
  labelIdentifierStandardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.title,
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class CalendarEventWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.title,
    type: FieldMetadataType.TEXT,
    label: 'Título',
    description: 'Título',
    icon: 'IconH1',
  })
  title: string;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.isCanceled,
    type: FieldMetadataType.BOOLEAN,
    label: 'Está Cancelado',
    description: 'Está Cancelado',
    icon: 'IconCalendarCancel',
    defaultValue: false,
  })
  isCanceled: boolean;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.isFullDay,
    type: FieldMetadataType.BOOLEAN,
    label: 'É Dia Inteiro',
    description: 'É Dia Inteiro',
    icon: 'Icon24Hours',
    defaultValue: false,
  })
  isFullDay: boolean;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.startsAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Data de Início',
    description: 'Data de Início',
    icon: 'IconCalendarClock',
  })
  @WorkspaceIsNullable()
  startsAt: string | null;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.endsAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Data de Término',
    description: 'Data de Término',
    icon: 'IconCalendarClock',
  })
  @WorkspaceIsNullable()
  endsAt: string | null;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.externalCreatedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Data e Hora de Criação',
    description: 'Data e Hora de Criação',
    icon: 'IconCalendarPlus',
  })
  @WorkspaceIsNullable()
  externalCreatedAt: string | null;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.externalUpdatedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Data e Hora de Atualização',
    description: 'Data e Hora de Atualização',
    icon: 'IconCalendarCog',
  })
  @WorkspaceIsNullable()
  externalUpdatedAt: string | null;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: 'Descrição',
    description: 'Descrição',
    icon: 'IconFileDescription',
  })
  description: string;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.location,
    type: FieldMetadataType.TEXT,
    label: 'Localização',
    description: 'Localização',
    icon: 'IconMapPin',
  })
  location: string;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.iCalUID,
    type: FieldMetadataType.TEXT,
    label: 'UID do iCal',
    description: 'UID do iCal',
    icon: 'IconKey',
  })
  iCalUID: string;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.conferenceSolution,
    type: FieldMetadataType.TEXT,
    label: 'Solução de Conferência',
    description: 'Solução de Conferência',
    icon: 'IconScreenShare',
  })
  conferenceSolution: string;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.conferenceLink,
    type: FieldMetadataType.LINKS,
    label: 'Link do Meet',
    description: 'Link do Meet',
    icon: 'IconLink',
  })
  @WorkspaceIsNullable()
  conferenceLink: LinksMetadata;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.recurringEventExternalId,
    type: FieldMetadataType.TEXT,
    label: 'ID do Evento Recorrente',
    description: 'ID do Evento Recorrente',
    icon: 'IconHistory',
  })
  recurringEventExternalId: string;

  @WorkspaceRelation({
    standardId:
      CALENDAR_EVENT_STANDARD_FIELD_IDS.calendarChannelEventAssociations,
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

  @WorkspaceRelation({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.calendarEventParticipants,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Participantes do Evento',
    description: 'Participantes do Evento',
    icon: 'IconUserCircle',
    inverseSideTarget: () => CalendarEventParticipantWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  calendarEventParticipants: Relation<
    CalendarEventParticipantWorkspaceEntity[]
  >;
}
