import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { TimelineActivityRepository } from 'src/modules/timeline/repositories/timeline-activity.repository';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

@Injectable()
export class MessageParticipantListener {
  constructor(
    @InjectObjectMetadataRepository(TimelineActivityWorkspaceEntity)
    private readonly timelineActivityRepository: TimelineActivityRepository,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @OnCustomBatchEvent('messageParticipant_matched')
  public async handleMessageParticipantMatched(
    batchEvent: CustomWorkspaceEventBatch<{
      workspaceMemberId: string;
      participants: MessageParticipantWorkspaceEntity[];
    }>,
  ): Promise<void> {
    if (!isDefined(batchEvent.workspaceId)) {
      return;
    }

    const messageObjectMetadata =
      await this.objectMetadataRepository.findOneOrFail({
        where: {
          nameSingular: 'message',
          workspaceId: batchEvent.workspaceId,
        },
      });

    const timelineActivityPayloads = batchEvent.events.flatMap((event) => {
      const messageParticipants = event.participants ?? [];

      const messageParticipantsWithPersonId = messageParticipants.filter(
        (participant) => isDefined(participant.personId),
      );

      if (messageParticipantsWithPersonId.length === 0) {
        return;
      }

      return messageParticipantsWithPersonId
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
            linkedObjectMetadataId: messageObjectMetadata.id,
            linkedRecordId: participant.messageId,
            linkedRecordCachedName: '',
          };
        })
        .filter(isDefined);
    });

    const isFeatureFlagTimelineActivityMigrated =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_TIMELINE_ACTIVITY_MIGRATED,
        batchEvent.workspaceId,
      );

    await this.timelineActivityRepository.upsertTimelineActivities({
      objectSingularName: 'person',
      workspaceId: batchEvent.workspaceId,
      payloads: timelineActivityPayloads.filter(isDefined),
      isFeatureFlagTimelineActivityMigrated,
    });
  }
}
