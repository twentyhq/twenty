import { MessageParticipantRole } from 'twenty-shared/types';

import { buildReplyToParticipants } from 'src/modules/messaging/message-import-manager/utils/build-reply-to-participants.util';

describe('buildReplyToParticipants', () => {
  it('exposes every Reply-To address as a REPLY_TO participant so relayed messages link to the real contacts', () => {
    const participants = buildReplyToParticipants(
      [
        { address: 'jane@acme.com', name: 'Jane' },
        { address: 'sales@acme.com' },
      ],
      { address: 'wordpress@forms.example', name: 'Contact form' },
    );

    expect(participants).toEqual([
      {
        role: MessageParticipantRole.REPLY_TO,
        handle: 'jane@acme.com',
        displayName: 'Jane',
      },
      {
        role: MessageParticipantRole.REPLY_TO,
        handle: 'sales@acme.com',
        displayName: '',
      },
    ]);
  });

  it('skips the Reply-To entry that merely echoes the sender, regardless of casing', () => {
    const participants = buildReplyToParticipants(
      [{ address: 'WordPress@Forms.Example' }, { address: 'jane@acme.com' }],
      { address: 'wordpress@forms.example' },
    );

    expect(participants).toEqual([
      {
        role: MessageParticipantRole.REPLY_TO,
        handle: 'jane@acme.com',
        displayName: '',
      },
    ]);
  });
});
