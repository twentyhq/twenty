import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { groupBy } from 'lodash';

import { WorkspacePreQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/interfaces/workspace-pre-query-hook.interface';
import { FindManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import { CalendarChannelEventAssociationObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.object-metadata';
import { CalendarChannelEventAssociationRepository } from 'src/modules/calendar/repositories/calendar-channel-event-association.repository';
import { CalendarChannelObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel.object-metadata';
import { CalendarChannelRepository } from 'src/modules/calendar/repositories/calendar-channel.repository';

@Injectable()
export class CalendarEventFindManyPreQueryHook
  implements WorkspacePreQueryHook
{
  constructor(
    @InjectObjectMetadataRepository(
      CalendarChannelEventAssociationObjectMetadata,
    )
    private readonly calendarChannelEventAssociationRepository: CalendarChannelEventAssociationRepository,
    @InjectObjectMetadataRepository(CalendarChannelObjectMetadata)
    private readonly calendarChannelRepository: CalendarChannelRepository,
    @InjectObjectMetadataRepository(ConnectedAccountObjectMetadata)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(WorkspaceMemberObjectMetadata)
    private readonly workspaceMemberService: WorkspaceMemberRepository,
  ) {}

  async execute(
    userId: string,
    workspaceId: string,
    payload: FindManyResolverArgs,
  ): Promise<void> {
    if (!payload?.filter?.calendarEventId?.eq) {
      throw new BadRequestException('calendarEventId filter is required');
    }

    const calendarChannelCalendarEventAssociations =
      await this.calendarChannelEventAssociationRepository.getByCalendarEventIds(
        payload?.filter?.calendarEventId?.eq,
        workspaceId,
      );

    if (calendarChannelCalendarEventAssociations.length === 0) {
      throw new NotFoundException();
    }

    await this.canAccessCalendarEvent(
      userId,
      workspaceId,
      calendarChannelCalendarEventAssociations,
    );
  }

  private async canAccessCalendarEvent(
    userId: string,
    workspaceId: string,
    calendarChannelCalendarEventAssociations: any[],
  ) {
    const calendarChannels = await this.calendarChannelRepository.getByIds(
      calendarChannelCalendarEventAssociations.map(
        (association) => association.calendarChannelId,
      ),
      workspaceId,
    );

    const calendarChannelsGroupByVisibility = groupBy(
      calendarChannels,
      (channel) => channel.visibility,
    );

    if (calendarChannelsGroupByVisibility.share_everything) {
      return;
    }

    const currentWorkspaceMember =
      await this.workspaceMemberService.getByIdOrFail(userId, workspaceId);

    const calendarChannelsConnectedAccounts =
      await this.connectedAccountRepository.getByIds(
        calendarChannels.map((channel) => channel.connectedAccountId),
        workspaceId,
      );

    const calendarChannelsWorkspaceMemberIds =
      calendarChannelsConnectedAccounts.map(
        (connectedAccount) => connectedAccount.accountOwnerId,
      );

    if (
      calendarChannelsWorkspaceMemberIds.includes(currentWorkspaceMember.id)
    ) {
      return;
    }

    throw new ForbiddenException();
  }
}
