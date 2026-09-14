import { MessageParticipantRole } from 'twenty-shared/types';

import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { resolveAppMessageDirection } from 'src/engine/metadata-modules/message-channel/utils/resolve-app-message-direction.util';

const CHANNEL_HANDLE = 'urn:li:person:self';

describe('resolveAppMessageDirection', () => {
  it('is outgoing when the sender is the channel itself', () => {
    expect(
      resolveAppMessageDirection({
        channelHandle: CHANNEL_HANDLE,
        participants: [
          { role: MessageParticipantRole.FROM, handle: CHANNEL_HANDLE },
          { role: MessageParticipantRole.TO, handle: 'urn:li:person:ada' },
        ],
      }),
    ).toBe(MessageDirection.OUTGOING);
  });

  it('is incoming when someone else sent it', () => {
    expect(
      resolveAppMessageDirection({
        channelHandle: CHANNEL_HANDLE,
        participants: [
          { role: MessageParticipantRole.FROM, handle: 'urn:li:person:ada' },
          { role: MessageParticipantRole.TO, handle: CHANNEL_HANDLE },
        ],
      }),
    ).toBe(MessageDirection.INCOMING);
  });

  it('does not read direction off a recipient that matches the channel', () => {
    expect(
      resolveAppMessageDirection({
        channelHandle: CHANNEL_HANDLE,
        participants: [
          { role: MessageParticipantRole.TO, handle: CHANNEL_HANDLE },
          { role: MessageParticipantRole.FROM, handle: 'urn:li:person:ada' },
        ],
      }),
    ).toBe(MessageDirection.INCOMING);
  });

  // A provider that spells one account differently across its profile and
  // message payloads would otherwise mark everything the owner sent as
  // incoming — the same reason the email path normalises its handles.
  it('still recognises the channel owner when the casing differs', () => {
    expect(
      resolveAppMessageDirection({
        channelHandle: CHANNEL_HANDLE,
        participants: [
          {
            role: MessageParticipantRole.FROM,
            handle: CHANNEL_HANDLE.toUpperCase(),
          },
        ],
      }),
    ).toBe(MessageDirection.OUTGOING);
  });

  it('is unaffected by the casing of the stored channel handle', () => {
    expect(
      resolveAppMessageDirection({
        channelHandle: CHANNEL_HANDLE.toUpperCase(),
        participants: [
          { role: MessageParticipantRole.FROM, handle: CHANNEL_HANDLE },
        ],
      }),
    ).toBe(MessageDirection.OUTGOING);
  });
});
