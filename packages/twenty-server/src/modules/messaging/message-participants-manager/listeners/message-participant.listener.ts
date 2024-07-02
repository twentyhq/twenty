import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { TimelineActivityRepository } from 'src/modules/timeline/repositiories/timeline-activity.repository';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';

@Injectable()
export class MessageParticipantListener {
  constructor(
    @InjectObjectMetadataRepository(TimelineActivityWorkspaceEntity)
    private readonly timelineActivityRepository: TimelineActivityRepository,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  @OnEvent('messageParticipant.matched')
  public async handleMessageParticipantMatched(payload: {
    workspaceId: string;
    workspaceMemberId: string;
    messageParticipants: MessageParticipantWorkspaceEntity[];
  }): Promise<void> {
    const messageParticipants = payload.messageParticipants ?? [];

    // TODO: move to a job?

    const dataSourceSchema = this.workspaceDataSourceService.getSchemaName(
      payload.workspaceId,
    );

    const messageObjectMetadata =
      await this.objectMetadataRepository.findOneOrFail({
        where: {
          nameSingular: 'message',
          workspaceId: payload.workspaceId,
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
        workspaceMemberId: payload.workspaceMemberId,
        workspaceId: payload.workspaceId,
        linkedObjectMetadataId: messageObjectMetadata.id,
        linkedRecordId: participant.messageId,
        linkedRecordCachedName: '',
      })),
      payload.workspaceId,
    );
  }
}
