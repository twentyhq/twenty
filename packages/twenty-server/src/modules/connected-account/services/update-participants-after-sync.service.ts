import { Injectable } from '@nestjs/common';

import { CalendarEventParticipantService } from 'src/modules/calendar/services/calendar-event-participant/calendar-event-participant.service';
import { MessageParticipantService } from 'src/modules/messaging/services/message-participant/message-participant.service';

@Injectable()
export class UpdateParticipantsAfterSyncService {
  constructor(
    private readonly messageParticipantService: MessageParticipantService,
    private readonly calendarEventParticipantService: CalendarEventParticipantService,
  ) {}

  async updateParticipantsAfterSync(
    participants: { id: string; handle: string }[],
    workspaceId: string,
  ) {
    await this.messageParticipantService.updateMessageParticipantsAfterPeopleCreation(
      participants,
      workspaceId,
    );

    await this.calendarEventParticipantService.updateCalendarEventParticipantsAfterContactCreation(
      participants,
      workspaceId,
    );
  }
}
