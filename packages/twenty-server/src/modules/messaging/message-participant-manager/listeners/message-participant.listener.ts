import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { TimelineActivityRepository } from 'src/modules/timeline/repositories/timeline-activity.repository';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

@Injectable()
export class MessageParticipantListener {
  constructor(
    @InjectObjectMetadataRepository(TimelineActivityWorkspaceEntity)
    private readonly timelineActivityRepository: TimelineActivityRepository,
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  @OnCustomBatchEvent('messageParticipant_matched')
  public async handleMessageParticipantMatched(
    batchEvent: WorkspaceEventBatch<{
      workspaceMemberId: string;
      participants: MessageParticipantWorkspaceEntity[];
    }>,
  ): Promise<void> {
    // TODO: Refactor to insertTimelineActivitiesForObject once
    for (const eventPayload of batchEvent.events) {
      const messageParticipants = eventPayload.participants ?? [];

      // TODO: move to a job?

      const dataSourceSchema = getWorkspaceSchemaName(batchEvent.workspaceId);

      const messageObjectMetadata =
        await this.objectMetadataRepository.findOneOrFail({
          where: {
            nameSingular: 'message',
            workspaceId: batchEvent.workspaceId,
          },
        });

      const messageParticipantsWithPersonId = messageParticipants.filter(
        (participant) => participant.personId,
      );

      if (messageParticipantsWithPersonId.length === 0) {
        return;
      }

      await this.timelineActivityRepository.insertTimelineActivitiesForObject(
        'person',
        messageParticipantsWithPersonId.map((participant) => ({
          dataSourceSchema,
          name: 'message.linked',
          properties: null,
          objectName: 'message',
          recordId: participant.personId,
          workspaceMemberId: eventPayload.workspaceMemberId,
          workspaceId: batchEvent.workspaceId,
          linkedObjectMetadataId: messageObjectMetadata.id,
          linkedRecordId: participant.messageId,
          linkedRecordCachedName: '',
        })),
        batchEvent.workspaceId,
      );
    }
  }
}
