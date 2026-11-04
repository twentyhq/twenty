import { MessageParticipantRole } from 'twenty-shared/types';

import { buildAppMessageReplyRecipients } from 'src/engine/metadata-modules/message-channel/utils/build-app-message-reply-recipients.util';

const buildParticipant = (
  overrides: Partial<
    Parameters<typeof buildAppMessageReplyRecipients>[0]['participants'][0]
  > = {},
) => ({
  messageId: 'message-latest',
  handle: 'urn:li:person:ada',
  displayName: 'Ada Lovelace',
  personId: null,
  workspaceMemberId: null,
  role: MessageParticipantRole.FROM,
  ...overrides,
});

describe('buildAppMessageReplyRecipients', () => {
  it('leaves out the channel handle, whatever its case', () => {
    expect(
      buildAppMessageReplyRecipients({
        participants: [
          buildParticipant({ handle: 'URN:LI:PERSON:JANE' }),
          buildParticipant(),
        ],
        channelHandle: 'urn:li:person:jane',
      }),
    ).toEqual([
      {
        handle: 'urn:li:person:ada',
        displayName: 'Ada Lovelace',
        personId: undefined,
        workspaceMemberId: undefined,
      },
    ]);
  });

  it('leaves out blind copied participants', () => {
    expect(
      buildAppMessageReplyRecipients({
        participants: [
          buildParticipant({
            handle: 'urn:li:person:grace',
            role: MessageParticipantRole.BCC,
          }),
          buildParticipant({ role: MessageParticipantRole.CC }),
        ],
        channelHandle: 'urn:li:person:jane',
      }),
    ).toEqual([
      {
        handle: 'urn:li:person:ada',
        displayName: 'Ada Lovelace',
        personId: undefined,
        workspaceMemberId: undefined,
      },
    ]);
  });

  it('keeps one recipient per handle with the newest values first', () => {
    expect(
      buildAppMessageReplyRecipients({
        participants: [
          buildParticipant({ displayName: 'Ada L.', personId: 'person-new' }),
          buildParticipant({
            messageId: 'message-older',
            personId: 'person-old',
          }),
        ],
        channelHandle: 'urn:li:person:jane',
      }),
    ).toEqual([
      {
        handle: 'urn:li:person:ada',
        displayName: 'Ada L.',
        personId: 'person-new',
        workspaceMemberId: undefined,
      },
    ]);
  });

  it('fills a name or link the newest row omits from an older one', () => {
    expect(
      buildAppMessageReplyRecipients({
        participants: [
          buildParticipant({ displayName: '' }),
          buildParticipant({
            messageId: 'message-older',
            personId: 'person-a',
            workspaceMemberId: 'member-a',
          }),
        ],
        channelHandle: 'urn:li:person:jane',
      }),
    ).toEqual([
      {
        handle: 'urn:li:person:ada',
        displayName: 'Ada Lovelace',
        personId: 'person-a',
        workspaceMemberId: 'member-a',
      },
    ]);
  });

  it('skips participants without a handle', () => {
    expect(
      buildAppMessageReplyRecipients({
        participants: [buildParticipant({ handle: null })],
        channelHandle: 'urn:li:person:jane',
      }),
    ).toEqual([]);
  });

  it('replies only to the latest message participants, not to someone who left the conversation', () => {
    expect(
      buildAppMessageReplyRecipients({
        participants: [
          buildParticipant({ role: MessageParticipantRole.FROM }),
          buildParticipant({
            handle: 'urn:li:person:jane',
            role: MessageParticipantRole.TO,
          }),
          buildParticipant({
            messageId: 'message-older',
            handle: 'urn:li:person:grace',
            displayName: 'Grace Hopper',
            role: MessageParticipantRole.TO,
          }),
          buildParticipant({
            messageId: 'message-older',
            personId: 'person-a',
            role: MessageParticipantRole.TO,
          }),
        ],
        channelHandle: 'urn:li:person:jane',
      }),
    ).toEqual([
      {
        handle: 'urn:li:person:ada',
        displayName: 'Ada Lovelace',
        personId: 'person-a',
        workspaceMemberId: undefined,
      },
    ]);
  });

  it('takes recipients from an older message when the latest has only the channel itself', () => {
    expect(
      buildAppMessageReplyRecipients({
        participants: [
          buildParticipant({ handle: 'urn:li:person:jane' }),
          buildParticipant({ messageId: 'message-older' }),
        ],
        channelHandle: 'urn:li:person:jane',
      }),
    ).toEqual([
      {
        handle: 'urn:li:person:ada',
        displayName: 'Ada Lovelace',
        personId: undefined,
        workspaceMemberId: undefined,
      },
    ]);
  });
});
