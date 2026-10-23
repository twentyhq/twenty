import { buildAppMessageReplyRecipients } from 'src/engine/metadata-modules/message-channel/utils/build-app-message-reply-recipients.util';

const buildParticipant = (
  overrides: Partial<
    Parameters<typeof buildAppMessageReplyRecipients>[0]['participants'][0]
  > = {},
) => ({
  handle: 'urn:li:person:ada',
  displayName: 'Ada Lovelace',
  personId: null,
  workspaceMemberId: null,
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

  it('keeps one recipient per handle with the newest values first', () => {
    expect(
      buildAppMessageReplyRecipients({
        participants: [
          buildParticipant({ displayName: 'Ada L.', personId: 'person-new' }),
          buildParticipant({ personId: 'person-old' }),
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
});
