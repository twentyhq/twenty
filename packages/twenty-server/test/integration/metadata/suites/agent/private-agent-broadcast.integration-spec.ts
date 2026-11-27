import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { updateOneAgent } from 'test/integration/metadata/suites/agent/utils/update-one-agent.util';
import { findWorkspaceBroadcastEventOrThrow } from 'test/integration/metadata/suites/utils/find-workspace-broadcast-event-or-throw.util';
import {
  spyOnWorkspaceEventBroadcast,
  type WorkspaceEventBroadcastSpy,
} from 'test/integration/metadata/suites/utils/spy-on-workspace-event-broadcast.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type MetadataEventEmitter } from 'src/engine/subscriptions/metadata-event/metadata-event-emitter';

describe('private agent broadcast (integration)', () => {
  let emitter: MetadataEventEmitter;
  let broadcastSpy: WorkspaceEventBroadcastSpy;
  let agentId: string;

  beforeAll(async () => {
    emitter = getAppProviderByClassName('MetadataEventEmitter');

    const { data } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Shared agent made private',
        prompt: 'Shared agent prompt',
        modelId: TEST_AI_MODEL_ID,
        responseFormat: { type: 'text' as const },
        isPrivate: false,
      },
      gqlFields: 'id',
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    agentId = data.createOneAgent.id;

    await emitter.drain();
  });

  beforeEach(() => {
    broadcastSpy = spyOnWorkspaceEventBroadcast();
  });

  afterEach(async () => {
    await emitter.drain();
    broadcastSpy.mockRestore();
  });

  afterAll(async () => {
    await deleteOneAgent({
      expectToFail: false,
      input: { id: agentId },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    await emitter.drain();
  });

  it('sends a delete to everyone but the owner when a shared agent becomes private', async () => {
    await updateOneAgent({
      expectToFail: false,
      input: { id: agentId, isPrivate: true },
      gqlFields: 'id',
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });
    await emitter.drain();

    const ownerUserWorkspaceIds = findWorkspaceBroadcastEventOrThrow({
      broadcastSpy,
      entityName: 'agent',
      recordId: agentId,
      type: 'updated',
    }).recipientUserWorkspaceIds;
    const deletedEvent = findWorkspaceBroadcastEventOrThrow({
      broadcastSpy,
      entityName: 'agent',
      recordId: agentId,
      type: 'deleted',
    });

    expect(ownerUserWorkspaceIds).toHaveLength(1);
    expect(deletedEvent.recipientUserWorkspaceIds).toBeUndefined();
    expect(deletedEvent.excludedUserWorkspaceIds).toEqual(
      ownerUserWorkspaceIds,
    );
  });
});
