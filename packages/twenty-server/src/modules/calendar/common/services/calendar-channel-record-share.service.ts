import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { MoreThan, Repository } from 'typeorm';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarChannelRecordShareSource } from 'src/modules/calendar/common/types/calendar-channel-record-share-source.type';
import { buildCalendarEventRecordSharesToInsert } from 'src/modules/calendar/common/utils/build-calendar-event-record-shares-to-insert.util';
import { ConnectedAccountOwnerService } from 'src/modules/connected-account/services/connected-account-owner.service';

const CALENDAR_CHANNEL_RECORD_SHARE_BATCH_SIZE = 500;

@Injectable()
export class CalendarChannelRecordShareService {
  constructor(
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    private readonly connectedAccountOwnerService: ConnectedAccountOwnerService,
    private readonly recordShareService: RecordShareService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async buildSource({
    calendarChannel,
    connectedAccount,
    workspaceId,
  }: {
    calendarChannel: Pick<CalendarChannelEntity, 'id' | 'visibility'>;
    connectedAccount: Pick<ConnectedAccountEntity, 'userWorkspaceId'>;
    workspaceId: string;
  }): Promise<CalendarChannelRecordShareSource> {
    return {
      calendarChannelId: calendarChannel.id,
      visibility: calendarChannel.visibility,
      ownerWorkspaceMemberId:
        await this.connectedAccountOwnerService.findOwnerWorkspaceMemberId({
          userWorkspaceId: connectedAccount.userWorkspaceId,
          workspaceId,
        }),
    };
  }

  async rebuildRecordSharesForCalendarChannel({
    workspaceId,
    calendarChannelId,
  }: {
    workspaceId: string;
    calendarChannelId: string;
  }): Promise<void> {
    const calendarChannel = await this.calendarChannelRepository.findOne({
      where: { id: calendarChannelId, workspaceId },
      relations: { connectedAccount: true },
    });

    if (!isDefined(calendarChannel)) {
      await this.recordShareService.deleteBySourceId({
        workspaceId,
        sourceId: calendarChannelId,
      });

      return;
    }

    const source = await this.buildSource({
      calendarChannel,
      connectedAccount: calendarChannel.connectedAccount,
      workspaceId,
    });

    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            const calendarChannelEventAssociationRepository =
              transactionScope.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
                'calendarChannelEventAssociation',
                { shouldBypassPermissionChecks: true },
              );
            const { objectIdByNameSingular } =
              calendarChannelEventAssociationRepository.internalContext;

            await this.recordShareService.deleteBySourceId({
              workspaceId,
              sourceId: calendarChannelId,
              transactionScope,
            });

            let cursor: string | undefined;

            for (;;) {
              const associations =
                await calendarChannelEventAssociationRepository.find({
                  where: isDefined(cursor)
                    ? { calendarChannelId, id: MoreThan(cursor) }
                    : { calendarChannelId },
                  select: { id: true, calendarEventId: true },
                  order: { id: 'ASC' },
                  take: CALENDAR_CHANNEL_RECORD_SHARE_BATCH_SIZE,
                });

              if (associations.length === 0) {
                break;
              }

              cursor = associations[associations.length - 1].id;

              await this.recordShareService.insertMany({
                workspaceId,
                recordShares: buildCalendarEventRecordSharesToInsert({
                  calendarChannel: source,
                  calendarEventIds: associations.map(
                    (association) => association.calendarEventId,
                  ),
                  calendarEventObjectMetadataId:
                    objectIdByNameSingular.calendarEvent,
                }),
                transactionScope,
              });
            }
          },
        ),
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }
}
