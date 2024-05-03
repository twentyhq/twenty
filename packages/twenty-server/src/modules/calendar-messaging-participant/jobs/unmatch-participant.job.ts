import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { CalendarEventParticipantService } from 'src/modules/calendar/services/calendar-event-participant/calendar-event-participant.service';
import { MessageParticipantService } from 'src/modules/messaging/services/message-participant/message-participant.service';

export type UnmatchParticipantJobData = {
  workspaceId: string;
  email: string;
  personId?: string;
  workspaceMemberId?: string;
};

@Injectable()
export class UnmatchParticipantJob
  implements MessageQueueJob<UnmatchParticipantJobData>
{
  constructor(
    private readonly messageParticipantService: MessageParticipantService,
    private readonly calendarEventParticipantService: CalendarEventParticipantService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  async handle(data: UnmatchParticipantJobData): Promise<void> {
    const { workspaceId, email, personId, workspaceMemberId } = data;

    await this.messageParticipantService.unmatchMessageParticipants(
      workspaceId,
      email,
      personId,
      workspaceMemberId,
    );

    await this.calendarEventParticipantService.unmatchCalendarEventParticipants(
      workspaceId,
      email,
      personId,
      workspaceMemberId,
    );
  }
}
