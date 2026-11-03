import { buildEventRealtimeChannel } from 'src/engine/metadata-modules/event-metadata/utils/build-event-realtime-channel.util';

describe('buildEventRealtimeChannel', () => {
  it('should namespace channels by workspace, event and scope', () => {
    expect(
      buildEventRealtimeChannel({
        workspaceId: 'workspace-1',
        eventMetadataId: 'event-1',
        scope: {
          kind: 'record',
          objectMetadataId: 'object-1',
          recordId: 'record-1',
        },
      }),
    ).toBe('appEvent:workspace-1:event-1:record:object-1:record-1');

    expect(
      buildEventRealtimeChannel({
        workspaceId: 'workspace-1',
        eventMetadataId: 'event-1',
        scope: { kind: 'visitor', anonymousId: 'visitor-1' },
      }),
    ).toBe('appEvent:workspace-1:event-1:visitor:visitor-1');
  });
});
