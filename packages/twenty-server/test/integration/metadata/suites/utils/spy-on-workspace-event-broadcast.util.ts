import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

export type WorkspaceEventBroadcastSpy = jest.SpiedFunction<
  WorkspaceEventBroadcaster['broadcast']
>;

export const spyOnWorkspaceEventBroadcast = (): WorkspaceEventBroadcastSpy =>
  jest
    .spyOn(
      getAppProviderByClassName<WorkspaceEventBroadcaster>(
        'WorkspaceEventBroadcaster',
      ),
      'broadcast',
    )
    .mockResolvedValue(undefined);
