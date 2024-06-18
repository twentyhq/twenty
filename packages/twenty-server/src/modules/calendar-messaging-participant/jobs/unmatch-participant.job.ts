import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { CalendarEventParticipantService } from 'src/modules/calendar/services/calendar-event-participant/calendar-event-participant.service';
import { MessagingMessageParticipantService } from 'src/modules/messaging/common/services/messaging-message-participant.service';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';

export type UnmatchParticipantJobData = {
  workspaceId: string;
  email: string;
  personId?: string;
  workspaceMemberId?: string;
};

@Processor(MessageQueue.messagingQueue)
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
