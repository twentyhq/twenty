import { Scope } from '@nestjs/common';

import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessagingMessageParticipantService } from 'src/modules/messaging/common/services/messaging-message-participant.service';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';

export type UnmatchParticipantJobData = {
  workspaceId: string;
  email: string;
  personId?: string;
  workspaceMemberId?: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class UnmatchParticipantJob {
  constructor(
    private readonly messageParticipantService: MessagingMessageParticipantService,
    private readonly calendarEventParticipantService: CalendarEventParticipantService,
  ) {}

  @Process(UnmatchParticipantJob.name)
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
