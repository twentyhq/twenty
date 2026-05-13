import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Any, In, IsNull, Repository } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { deleteUsingPagination } from 'src/modules/messaging/message-cleaner/utils/delete-using-pagination.util';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

@Injectable()
export class CalendarEventCleanerService {
  private readonly logger = new Logger(CalendarEventCleanerService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  private async resolveCalendarEventObjectMetadataId(
    workspaceId: string,
  ): Promise<string | null> {
    const calendarEventObjectMetadata =
      await this.objectMetadataRepository.findOne({
        where: { nameSingular: 'calendarEvent', workspaceId },
      });

    return calendarEventObjectMetadata?.id ?? null;
  }

  // Mirrors the cleanup added in commit 6e8c901a0c for messages/threads.
  // When a calendarEvent is hard-deleted, any timelineActivity row that
  // references it via (linkedObjectMetadataId=calendarEvent, linkedRecordId)
  // becomes an orphan and the frontend's EventCardCalendarEvent shows
  // "Error loading record". Sweep them in the same transaction as the
  // calendarEvent delete.
  private async deleteTimelineActivitiesForLinkedCalendarEvents({
    workspaceId,
    linkedObjectMetadataId,
    linkedRecordIds,
  }: {
    workspaceId: string;
    linkedObjectMetadataId: string | null;
    linkedRecordIds: string[];
  }) {
    if (!linkedObjectMetadataId || linkedRecordIds.length === 0) {
      return;
    }

    const timelineActivityRepository =
      await this.globalWorkspaceOrmManager.getRepository<TimelineActivityWorkspaceEntity>(
        workspaceId,
        'timelineActivity',
        { shouldBypassPermissionChecks: true },
      );

    await timelineActivityRepository.delete({
      linkedObjectMetadataId,
      linkedRecordId: In(linkedRecordIds),
    });
  }

  async deleteCalendarChannelEventAssociationsByChannelId({
    workspaceId,
    calendarChannelId,
  }: {
    workspaceId: string;
    calendarChannelId: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const calendarChannelEventAssociationRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          'calendarChannelEventAssociation',
        );

      const workspaceDataSource =
        await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

      await workspaceDataSource.transaction(async (manager) => {
        const transactionManager = manager as WorkspaceEntityManager;

        await deleteUsingPagination(
          workspaceId,
          500,
          async (
            limit: number,
            offset: number,
            _workspaceId: string,
            transactionManager?: WorkspaceEntityManager,
          ) => {
            const associations =
              await calendarChannelEventAssociationRepository.find(
                {
                  where: { calendarChannelId },
                  take: limit,
                  skip: offset,
                },
                transactionManager,
              );

            return associations.map(({ id }) => id);
          },
          async (
            ids: string[],
            workspaceId: string,
            transactionManager?: WorkspaceEntityManager,
          ) => {
            this.logger.log(
              `WorkspaceId: ${workspaceId} Deleting ${ids.length} calendar channel event associations for channel ${calendarChannelId}`,
            );
            await calendarChannelEventAssociationRepository.delete(
              ids,
              transactionManager,
            );
          },
          transactionManager,
        );
      });
    }, authContext);
  }

  public async cleanWorkspaceCalendarEvents(workspaceId: string) {
    const authContext = buildSystemAuthContext(workspaceId);

    const calendarEventObjectMetadataId =
      await this.resolveCalendarEventObjectMetadataId(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const calendarEventRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          'calendarEvent',
        );

      await deleteUsingPagination(
        workspaceId,
        500,
        async (limit, offset) => {
          const nonAssociatedCalendarEvents =
            await calendarEventRepository.find({
              where: {
                calendarChannelEventAssociations: {
                  id: IsNull(),
                },
              },
              take: limit,
              skip: offset,
            });

          return nonAssociatedCalendarEvents.map(({ id }) => id);
        },
        async (ids) => {
          await this.deleteTimelineActivitiesForLinkedCalendarEvents({
            workspaceId,
            linkedObjectMetadataId: calendarEventObjectMetadataId,
            linkedRecordIds: ids,
          });

          await calendarEventRepository.delete({ id: Any(ids) });
        },
      );
    }, authContext);
  }
}
