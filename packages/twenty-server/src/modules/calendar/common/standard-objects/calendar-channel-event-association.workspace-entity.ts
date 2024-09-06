import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.calendarChannelEventAssociation,
  namePlural: 'calendarChannelEventAssociations',
  labelSingular: 'Associação de Evento do Canal de Calendário',
  labelPlural: 'Associações de Eventos do Canal de Calendário',
  description: 'Associações de Eventos do Canal de Calendário',
  icon: 'IconCalendar',
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class CalendarChannelEventAssociationWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId:
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.eventExternalId,
    type: FieldMetadataType.TEXT,
    label: 'ID externo do evento',
    description: 'ID externo do evento',
    icon: 'IconCalendar',
  })
  eventExternalId: string;

  @WorkspaceRelation({
    standardId:
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.calendarChannel,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'ID do canal',
    description: 'ID do canal',
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarChannelWorkspaceEntity,
    inverseSideFieldKey: 'calendarChannelEventAssociations',
  })
  calendarChannel: Relation<CalendarChannelWorkspaceEntity>;

  @WorkspaceJoinColumn('calendarChannel')
  calendarChannelId: string;

  @WorkspaceRelation({
    standardId:
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.calendarEvent,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'ID do evento',
    description: 'ID do evento',
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarEventWorkspaceEntity,
    inverseSideFieldKey: 'calendarChannelEventAssociations',
  })
  calendarEvent: Relation<CalendarEventWorkspaceEntity>;

  @WorkspaceJoinColumn('calendarEvent')
  calendarEventId: string;
}
