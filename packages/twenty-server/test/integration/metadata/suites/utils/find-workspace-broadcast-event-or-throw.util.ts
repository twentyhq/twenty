import { type WorkspaceEventBroadcastSpy } from 'test/integration/metadata/suites/utils/spy-on-workspace-event-broadcast.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { type WorkspaceBroadcastEvent } from 'src/engine/subscriptions/workspace-event-broadcaster/types/workspace-broadcast-event.type';

export const findWorkspaceBroadcastEventOrThrow = ({
  broadcastSpy,
  entityName,
  recordId,
}: {
  broadcastSpy: WorkspaceEventBroadcastSpy;
  entityName: string;
  recordId: string;
}): WorkspaceBroadcastEvent => {
  const event = broadcastSpy.mock.calls
    .flatMap(([{ events }]) => events)
    .find(
      (broadcastEvent) =>
        broadcastEvent.entityName === entityName &&
        broadcastEvent.recordId === recordId,
    );

  jestExpectToBeDefined(event);

  return event;
};
