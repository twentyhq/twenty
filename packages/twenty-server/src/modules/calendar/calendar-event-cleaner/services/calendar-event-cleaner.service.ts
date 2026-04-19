import { Injectable, Logger } from '@nestjs/common';

import { Any, IsNull } from 'typeorm';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { deleteUsingPagination } from 'src/modules/messaging/message-cleaner/utils/delete-using-pagination.util';

@Injectable()
export class CalendarEventCleanerService {
  private readonly logger = new Logger(CalendarEventCleanerService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async deleteCalendarChannelEventASsociationsByChannelId({
    workspaceId,
    calendarChannelId,
  }: {
    workspaceId: string;
    calendarChannelId: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const calendarChannelEventASsociationRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          'calendarChannelEventASsociation',
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
            const aSsociations =
              await calendarChannelEventASsociationRepository.find(
                {
                  where: { calendarChannelId },
                  take: limit,
                  skip: offset,
                },
                transactionManager,
              );

            return aSsociations.map(({ id }) => id);
          },
          async (
            ids: string[],
            workspaceId: string,
            transactionManager?: WorkspaceEntityManager,
          ) => {
            this.logger.log(
              `WorkspaceId: ${workspaceId} Deleting ${ids.length} calendar channel event aSsociations for channel ${calendarChannelId}`,
            );
            await calendarChannelEventASsociationRepository.delete(
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
          const nonASsociatedCalendarEvents =
            await calendarEventRepository.find({
              where: {
                calendarChannelEventASsociations: {
                  id: IsNull(),
                },
              },
              take: limit,
              skip: offset,
            });

          return nonASsociatedCalendarEvents.map(({ id }) => id);
        },
        async (ids) => {
          await calendarEventRepository.delete({ id: Any(ids) });
        },
      );
    }, authContext);
  }
}
