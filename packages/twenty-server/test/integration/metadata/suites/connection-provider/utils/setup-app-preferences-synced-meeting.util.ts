import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  CalendarChannelSyncStage,
  CalendarChannelVisibility,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';

export const setupAppPreferencesSyncedMeeting = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}) => {
  const channelId = uuidv4();
  const eventId = uuidv4();
  const associationId = uuidv4();

  await globalThis.testDataSource.query(
    `INSERT INTO core."calendarChannel"
       (id, handle, "workspaceId", "connectedAccountId", "syncStage", visibility, "syncCursor")
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      channelId,
      'synthetic@apple.dev',
      SEED_APPLE_WORKSPACE_ID,
      connectedAccountId,
      CalendarChannelSyncStage.PENDING_CONFIGURATION,
      CalendarChannelVisibility.SHARE_EVERYTHING,
      'stored-sync-cursor',
    ],
  );
  const { errors } = await createOneOperation({
    objectMetadataSingularName: 'calendarEvent',
    input: { id: eventId, title: 'Stored app meeting' },
  });

  expect(errors).toBeUndefined();

  const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
    'WorkspaceOrmManager',
  );

  // Sync associations are internal records and cannot be written by the public API.
  await workspaceOrmManager.executeInWorkspaceContext(
    () =>
      workspaceOrmManager
        .getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
          'calendarChannelEventAssociation',
          { shouldBypassPermissionChecks: true },
        )
        .insert({
          id: associationId,
          calendarEventId: eventId,
          calendarChannelId: channelId,
          eventExternalId: 'stored-app-meeting',
        }),
    buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
  );

  return { channelId, eventId, associationId };
};
