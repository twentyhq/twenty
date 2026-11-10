import { ViewVisibility } from 'twenty-shared/types';

import { buildViewFamilyBroadcastEvents } from 'src/engine/subscriptions/view-family-event/utils/build-view-family-broadcast-events.util';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';

const SHARED_VIEW = {
  id: 'view-id',
  visibility: ViewVisibility.WORKSPACE,
  ownerUserWorkspaceId: null,
};

const ALICE_PRIVATE_VIEW = {
  id: 'view-id',
  visibility: ViewVisibility.UNLISTED,
  ownerUserWorkspaceId: 'alice',
};

const BOB_PRIVATE_VIEW = {
  ...ALICE_PRIVATE_VIEW,
  ownerUserWorkspaceId: 'bob',
};

const viewEvent = (event: Record<string, unknown>) =>
  ({
    metadataName: 'view',
    recordId: 'view-id',
    ...event,
  }) as never as MetadataEvent;

const updatedViewEvent = (
  before: Record<string, unknown>,
  after: Record<string, unknown>,
) =>
  viewEvent({
    type: 'updated',
    properties: { updatedFields: [], diff: {}, before, after },
  });

const buildForView = (event: MetadataEvent) =>
  buildViewFamilyBroadcastEvents({
    metadataName: 'view',
    events: [event],
    findParentView: () => undefined,
  });

describe('buildViewFamilyBroadcastEvents', () => {
  it('sends a shared view change to the whole workspace', () => {
    const [event] = buildForView(updatedViewEvent(SHARED_VIEW, SHARED_VIEW));

    expect(event.recipientUserWorkspaceIds).toBeUndefined();
    expect(event.excludedUserWorkspaceIds).toBeUndefined();
  });

  it('sends a private view change only to its owner', () => {
    const events = buildForView(
      updatedViewEvent(ALICE_PRIVATE_VIEW, ALICE_PRIVATE_VIEW),
    );

    expect(events).toHaveLength(1);
    expect(events[0].recipientUserWorkspaceIds).toEqual(['alice']);
  });

  it('sends a private view creation only to its owner', () => {
    const [event] = buildForView(
      viewEvent({ type: 'created', properties: { after: ALICE_PRIVATE_VIEW } }),
    );

    expect(event.recipientUserWorkspaceIds).toEqual(['alice']);
  });

  it('reaches nobody for a private view without an owner', () => {
    const [event] = buildForView(
      viewEvent({
        type: 'created',
        properties: {
          after: { ...ALICE_PRIVATE_VIEW, ownerUserWorkspaceId: null },
        },
      }),
    );

    expect(event.recipientUserWorkspaceIds).toEqual([]);
  });

  it('removes a view that became private from everyone but its owner, by id only', () => {
    const [updatedEvent, removalEvent] = buildForView(
      updatedViewEvent(SHARED_VIEW, ALICE_PRIVATE_VIEW),
    );

    expect(updatedEvent).toMatchObject({
      type: 'updated',
      recipientUserWorkspaceIds: ['alice'],
    });
    expect(removalEvent).toEqual({
      type: 'deleted',
      entityName: 'view',
      recordId: 'view-id',
      properties: {},
      excludedUserWorkspaceIds: ['alice'],
    });
  });

  it('sends a view that became shared to the whole workspace with no removal', () => {
    const events = buildForView(
      updatedViewEvent(ALICE_PRIVATE_VIEW, SHARED_VIEW),
    );

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: 'updated' });
    expect(events[0].recipientUserWorkspaceIds).toBeUndefined();
  });

  it('removes a private view from its former owner on transfer', () => {
    const [updatedEvent, removalEvent] = buildForView(
      updatedViewEvent(ALICE_PRIVATE_VIEW, BOB_PRIVATE_VIEW),
    );

    expect(updatedEvent.recipientUserWorkspaceIds).toEqual(['bob']);
    expect(removalEvent).toMatchObject({
      type: 'deleted',
      properties: {},
      recipientUserWorkspaceIds: ['alice'],
    });
  });

  it('targets child events by their parent view audience', () => {
    const [event] = buildViewFamilyBroadcastEvents({
      metadataName: 'viewField',
      events: [
        {
          metadataName: 'viewField',
          recordId: 'view-field-id',
          type: 'created',
          properties: { after: { id: 'view-field-id', viewId: 'view-id' } },
        } as never as MetadataEvent,
      ],
      findParentView: (viewId) =>
        viewId === 'view-id' ? ALICE_PRIVATE_VIEW : undefined,
    });

    expect(event.recipientUserWorkspaceIds).toEqual(['alice']);
  });

  it('reaches nobody for a child whose parent view is gone', () => {
    const [event] = buildViewFamilyBroadcastEvents({
      metadataName: 'viewSort',
      events: [
        {
          metadataName: 'viewSort',
          recordId: 'view-sort-id',
          type: 'deleted',
          properties: { before: { id: 'view-sort-id', viewId: 'gone' } },
        } as never as MetadataEvent,
      ],
      findParentView: () => undefined,
    });

    expect(event.recipientUserWorkspaceIds).toEqual([]);
  });
});
