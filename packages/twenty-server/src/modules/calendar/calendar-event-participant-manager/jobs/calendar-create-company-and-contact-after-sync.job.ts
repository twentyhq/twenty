import { Logger, Scope } from '@nestjs/common';

import { IsNull } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CreateCompanyAndContactService } from 'src/modules/contact-creation-manager/services/create-company-and-contact.service';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';

export type CalendarCreateCompanyAndContactAfterSyncJobData = {
  workspaceId: string;
  calendarChannelId: string;
};

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class CalendarCreateCompanyAndContactAfterSyncJob {
  private readonly logger = new Logger(
    CalendarCreateCompanyAndContactAfterSyncJob.name,
  );
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly createCompanyAndContactService: CreateCompanyAndContactService,
  ) {}

  @Process(CalendarCreateCompanyAndContactAfterSyncJob.name)
  async handle(
    data: CalendarCreateCompanyAndContactAfterSyncJobData,
  ): Promise<void> {
    this.logger.log(
      `create contacts and companies after sync for workspace ${data.workspaceId} and calendarChannel ${data.calendarChannelId}`,
    );
    const { workspaceId, calendarChannelId } = data;

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    const calendarChannel = await calendarChannelRepository.findOne({
      where: {
        id: calendarChannelId,
      },
      relations: ['connectedAccount.accountOwner'],
    });

    if (!calendarChannel) {
      throw new Error(
        `Calendar channel with id ${calendarChannelId} not found in workspace ${workspaceId}`,
      );
    }

    const { handle, isContactAutoCreationEnabled, connectedAccount } =
      calendarChannel;

    if (!isContactAutoCreationEnabled || !handle) {
      return;
    }

    if (!connectedAccount) {
      throw new Error(
        `Connected account not found in workspace ${workspaceId}`,
      );
    }

    const calendarEventParticipantRepository =
      await this.twentyORMManager.getRepository<CalendarEventParticipantWorkspaceEntity>(
        'calendarEventParticipant',
      );

    const calendarEventParticipantsWithoutPersonIdAndWorkspaceMemberId =
      await calendarEventParticipantRepository.find({
        where: {
          calendarEvent: {
            calendarChannelEventAssociations: {
              calendarChannelId,
            },
            calendarEventParticipants: {
              person: IsNull(),
              workspaceMember: IsNull(),
            },
          },
        },
        relations: [
          'calendarEvent.calendarChannelEventAssociations',
          'calendarEvent.calendarEventParticipants',
        ],
      });

    await this.createCompanyAndContactService.createCompaniesAndContactsAndUpdateParticipants(
      connectedAccount,
      calendarEventParticipantsWithoutPersonIdAndWorkspaceMemberId,
      workspaceId,
      FieldActorSource.CALENDAR,
    );

    this.logger.log(
      `create contacts and companies after sync for workspace ${data.workspaceId} and calendarChannel ${data.calendarChannelId} done`,
    );
  }
}
