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
          await calendarEventRepository.delete({ id: Any(ids) });
        },
      );
    }, authContext);
  }
}
