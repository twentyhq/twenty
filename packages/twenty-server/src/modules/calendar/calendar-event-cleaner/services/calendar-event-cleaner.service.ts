import { Injectable } from '@nestjs/common';

import { Any, IsNull } from 'typeorm';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { deleteUsingPagination } from 'src/modules/messaging/message-cleaner/utils/delete-using-pagination.util';

@Injectable()
export class CalendarEventCleanerService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  public async cleanWorkspaceCalendarEvents(workspaceId: string) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
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
      },
    );
  }
}
