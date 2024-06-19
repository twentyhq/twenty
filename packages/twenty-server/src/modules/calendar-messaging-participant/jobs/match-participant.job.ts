import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { CalendarEventParticipantService } from 'src/modules/calendar/services/calendar-event-participant/calendar-event-participant.service';
import { MessagingMessageParticipantService } from 'src/modules/messaging/common/services/messaging-message-participant.service';

export type MatchParticipantJobData = {
  workspaceId: string;
  email: string;
  personId?: string;
  workspaceMemberId?: string;
};

@Processor(MessageQueue.messagingQueue)
export class MatchParticipantJob {
  constructor(
    private readonly messageParticipantService: MessagingMessageParticipantService,
    private readonly calendarEventParticipantService: CalendarEventParticipantService,
  ) {}

  @Process(MatchParticipantJob.name)
  async handle(data: MatchParticipantJobData): Promise<void> {
    const { workspaceId, email, personId, workspaceMemberId } = data;

    await this.messageParticipantService.matchMessageParticipants(
      workspaceId,
      email,
      personId,
      workspaceMemberId,
    );

    await this.calendarEventParticipantService.matchCalendarEventParticipants(
      workspaceId,
      email,
      personId,
      workspaceMemberId,
    );
  }
}
