import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-event-participant.workspace-entity';
import { TimelineActivityRepository } from 'src/modules/timeline/repositiories/timeline-activity.repository';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';

@Injectable()
export class CalendarEventParticipantListener {
  constructor(
    @InjectObjectMetadataRepository(TimelineActivityWorkspaceEntity)
    private readonly timelineActivityRepository: TimelineActivityRepository,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  @OnEvent('calendarEventParticipant.matched')
  public async handleCalendarEventParticipantMatchedEvent(payload: {
    workspaceId: string;
    userId: string;
    calendarEventParticipants: ObjectRecord<CalendarEventParticipantWorkspaceEntity>[];
  }): Promise<void> {
    const calendarEventParticipants = payload.calendarEventParticipants ?? [];

    // TODO: move to a job?

    const dataSourceSchema = this.workspaceDataSourceService.getSchemaName(
      payload.workspaceId,
    );

    const calendarEventObjectMetadata =
      await this.objectMetadataRepository.findOneOrFail({
        where: {
          nameSingular: 'calendarEvent',
          workspaceId: payload.workspaceId,
        },
      });

    const calendarEventParticipantsWithPersonId =
      calendarEventParticipants.filter((participant) => participant.personId);

    if (calendarEventParticipantsWithPersonId.length === 0) {
      return;
    }

    await this.timelineActivityRepository.insertTimelineActivitiesForObject(
      'person',
      calendarEventParticipantsWithPersonId.map((participant) => ({
        dataSourceSchema,
        name: 'calendarEvent.linked',
        properties: null,
        objectName: 'calendarEvent',
        recordId: participant.personId,
        workspaceMemberId: payload.userId,
        workspaceId: payload.workspaceId,
        linkedObjectMetadataId: calendarEventObjectMetadata.id,
        linkedRecordId: participant.calendarEventId,
        linkedRecordCachedName: '',
      })),
      payload.workspaceId,
    );
  }
}
