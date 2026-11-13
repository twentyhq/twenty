import { randomUUID } from 'node:crypto';

import { buildCreatedMetadataEventBatch } from 'test/integration/metadata/suites/utils/build-created-metadata-event-batch.util';
import { findWorkspaceBroadcastEventOrThrow } from 'test/integration/metadata/suites/utils/find-workspace-broadcast-event-or-throw.util';
import {
  spyOnWorkspaceEventBroadcast,
  type WorkspaceEventBroadcastSpy,
} from 'test/integration/metadata/suites/utils/spy-on-workspace-event-broadcast.util';
import { createOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-view-filter-group.util';
import { createOneViewOnObject } from 'test/integration/metadata/suites/view/utils/create-one-view-on-object.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { findViewOwnership } from 'test/integration/metadata/suites/view/utils/find-view-ownership.util';
import { updateOneView } from 'test/integration/metadata/suites/view/utils/update-one-view.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  ViewFilterGroupLogicalOperator,
  ViewVisibility,
} from 'twenty-shared/types';

import { type MetadataEventEmitter } from 'src/engine/subscriptions/metadata-event/metadata-event-emitter';
import { type MetadataEventPublisher } from 'src/engine/subscriptions/metadata-event/metadata-event-publisher';

describe('unlisted view broadcast recipients (integration)', () => {
  let publisher: MetadataEventPublisher;
  let emitter: MetadataEventEmitter;
  let broadcastSpy: WorkspaceEventBroadcastSpy;
  let unlistedViewId: string;
  let workspaceViewId: string;
  let creatorUserWorkspaceId: string | null;

  const renameViewAndFindRecipients = async ({
    viewId,
    token,
  }: {
    viewId: string;
    token: string;
  }) => {
    await updateOneView({
      viewId,
      input: { id: viewId, name: `Renamed ${randomUUID()}` },
      gqlFields: 'id',
      expectToFail: false,
      token,
    });
    await emitter.drain();

    return findWorkspaceBroadcastEventOrThrow({
      broadcastSpy,
      entityName: 'view',
      recordId: viewId,
    }).recipientUserWorkspaceIds;
  };

  const createViewFilterGroupAndFindRecipients = async ({
    viewId,
    token,
  }: {
    viewId: string;
    token: string;
  }) => {
    const { data } = await createOneViewFilterGroup({
      expectToFail: false,
      gqlFields: 'id',
      token,
      input: {
        viewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
        positionInViewFilterGroup: 0,
      },
    });

    await emitter.drain();

    return findWorkspaceBroadcastEventOrThrow({
      broadcastSpy,
      entityName: 'viewFilterGroup',
      recordId: data.createViewFilterGroup.id,
    }).recipientUserWorkspaceIds;
  };

  const publishAndFindRecipients = async (
    batchInput: Parameters<typeof buildCreatedMetadataEventBatch>[0],
  ) => {
    await publisher.publish(buildCreatedMetadataEventBatch(batchInput));

    return findWorkspaceBroadcastEventOrThrow({
      broadcastSpy,
      entityName: batchInput.metadataName,
      recordId: batchInput.record.id,
    }).recipientUserWorkspaceIds;
  };

  beforeAll(async () => {
    publisher = getAppProviderByClassName('MetadataEventPublisher');
    emitter = getAppProviderByClassName('MetadataEventEmitter');

    unlistedViewId = await createOneViewOnObject({
      objectNameSingular: 'company',
      input: {
        name: 'Guest private broadcast companies',
        visibility: ViewVisibility.UNLISTED,
      },
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
    });
    workspaceViewId = await createOneViewOnObject({
      objectNameSingular: 'company',
      input: {
        name: 'Workspace broadcast companies',
        visibility: ViewVisibility.WORKSPACE,
      },
    });
    ({ createdByUserWorkspaceId: creatorUserWorkspaceId } =
      await findViewOwnership(unlistedViewId));

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
    for (const viewId of [unlistedViewId, workspaceViewId]) {
      await destroyOneView({ viewId });
    }

    await emitter.drain();
  });

  it('should send an unlisted view and its children to the creator only', async () => {
    const token = APPLE_PHIL_GUEST_ACCESS_TOKEN;

    expect(creatorUserWorkspaceId).not.toBeNull();
    expect(
      await renameViewAndFindRecipients({ viewId: unlistedViewId, token }),
    ).toEqual([creatorUserWorkspaceId]);
    expect(
      await createViewFilterGroupAndFindRecipients({
        viewId: unlistedViewId,
        token,
      }),
    ).toEqual([creatorUserWorkspaceId]);
  });

  it('should send a workspace view and its children to everyone', async () => {
    const token = APPLE_JANE_ADMIN_ACCESS_TOKEN;

    expect(
      await createViewFilterGroupAndFindRecipients({
        viewId: workspaceViewId,
        token,
      }),
    ).toBeUndefined();
    expect(
      await renameViewAndFindRecipients({ viewId: workspaceViewId, token }),
    ).toBeUndefined();
  });

  it('should send an unlisted view without a creator to nobody', async () => {
    expect(
      await publishAndFindRecipients({
        metadataName: 'view',
        record: {
          id: randomUUID(),
          visibility: ViewVisibility.UNLISTED,
          createdByUserWorkspaceId: null,
        },
      }),
    ).toEqual([]);
  });

  it('should send a child whose parent view is missing to nobody', async () => {
    expect(
      await publishAndFindRecipients({
        metadataName: 'viewSort',
        record: { id: randomUUID(), viewId: randomUUID() },
      }),
    ).toEqual([]);
  });
});
