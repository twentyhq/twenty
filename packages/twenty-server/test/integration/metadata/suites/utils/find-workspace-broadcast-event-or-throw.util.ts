import { type WorkspaceEventBroadcastSpy } from 'test/integration/metadata/suites/utils/spy-on-workspace-event-broadcast.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceBroadcastEvent } from 'src/engine/subscriptions/workspace-event-broadcaster/types/workspace-broadcast-event.type';

export const findWorkspaceBroadcastEventOrThrow = ({
  broadcastSpy,
  entityName,
  recordId,
  type,
}: {
  broadcastSpy: WorkspaceEventBroadcastSpy;
  entityName: string;
  recordId: string;
  type?: WorkspaceBroadcastEvent['type'];
}): WorkspaceBroadcastEvent => {
  const event = broadcastSpy.mock.calls
    .flatMap(([{ events }]) => events)
    .find(
      (broadcastEvent) =>
        broadcastEvent.entityName === entityName &&
        broadcastEvent.recordId === recordId &&
        (!isDefined(type) || broadcastEvent.type === type),
    );

  jestExpectToBeDefined(event);

  return event;
};
