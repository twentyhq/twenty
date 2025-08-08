import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { TimelineActivityRepository } from 'src/modules/timeline/repositories/timeline-activity.repository';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

@Injectable()
export class CalendarEventParticipantListener {
  constructor(
    @InjectObjectMetadataRepository(TimelineActivityWorkspaceEntity)
    private readonly timelineActivityRepository: TimelineActivityRepository,
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  @OnCustomBatchEvent('calendarEventParticipant_matched')
  public async handleCalendarEventParticipantMatchedEvent(
    batchEvent: WorkspaceEventBatch<{
      workspaceMemberId: string;
      participants: CalendarEventParticipantWorkspaceEntity[];
    }>,
  ): Promise<void> {
    const calendarEventObjectMetadata =
      await this.objectMetadataRepository.findOneOrFail({
        where: {
          nameSingular: 'calendarEvent',
          workspaceId: batchEvent.workspaceId,
        },
      });

    const timelineActivityPayloads = batchEvent.events.flatMap((event) => {
      const calendarEventParticipants = event.participants ?? [];

      const calendarEventParticipantsWithPersonId =
        calendarEventParticipants.filter((participant) =>
          isDefined(participant.personId),
        );

      if (calendarEventParticipantsWithPersonId.length === 0) {
        return;
      }

      return calendarEventParticipantsWithPersonId
        .map((participant) => {
          if (!isDefined(participant.personId)) {
            return;
          }

          return {
            name: 'message.linked',
            properties: {},
            objectSingularName: 'person',
            recordId: participant.personId,
            workspaceMemberId: event.workspaceMemberId,
            linkedObjectMetadataId: calendarEventObjectMetadata.id,
            linkedRecordId: participant.calendarEventId,
            linkedRecordCachedName: '',
          };
        })
        .filter(isDefined);
    });

    await this.timelineActivityRepository.upsertTimelineActivities({
      objectSingularName: 'person',
      workspaceId: batchEvent.workspaceId,
      payloads: timelineActivityPayloads.filter(isDefined),
    });
  }
}
