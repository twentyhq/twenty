import { type gmail_v1 as gmailV1 } from 'googleapis';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { parseAndFormatGmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-and-format-gmail-message.util';

const connectedAccount = {
  handle: 'me@example.com',
  handleAliases: null,
};

const buildMessage = (
  headers: { name: string; value: string }[],
  overrides: Partial<gmailV1.Schema$Message> = {},
): gmailV1.Schema$Message => ({
  id: 'msg-1',
  threadId: 'thread-1',
  historyId: '42',
  internalDate: '1700000000000',
  labelIds: [],
  payload: {
    headers,
    mimeType: 'text/plain',
    body: { data: Buffer.from('hello').toString('base64'), size: 5 },
  },
  ...overrides,
});

describe('parseAndFormatGmailMessage', () => {
  it('should emit one participant per recipient in a multi-address `To` header', () => {
    // Regression: prior implementation kept only the first parsed address.
    const result = parseAndFormatGmailMessage(
      buildMessage([
        { name: 'From', value: 'sender@example.com' },
        {
          name: 'To',
          value: 'alice@example.com, bob@example.com, carol@example.com',
        },
        { name: 'Message-ID', value: '<abc@example.com>' },
      ]),
      connectedAccount,
    );

    const toHandles = result?.participants
      .filter((p) => p.role === 'TO')
      .map((p) => p.handle);

    expect(toHandles).toEqual([
      'alice@example.com',
      'bob@example.com',
      'carol@example.com',
    ]);
  });

  it('should fall back to `Delivered-To` when `To` header is absent', () => {
    const result = parseAndFormatGmailMessage(
      buildMessage([
        { name: 'From', value: 'sender@example.com' },
        { name: 'Delivered-To', value: 'me@example.com' },
        { name: 'Message-ID', value: '<abc@example.com>' },
      ]),
      connectedAccount,
    );

    const toParticipants = result?.participants.filter((p) => p.role === 'TO');

    expect(toParticipants).toEqual([
      { role: 'TO', handle: 'me@example.com', displayName: '' },
    ]);
  });

  it('should preserve the display name on the FROM participant', () => {
    const result = parseAndFormatGmailMessage(
      buildMessage([
        { name: 'From', value: '"Doe, John" <john.doe@example.com>' },
        { name: 'To', value: 'me@example.com' },
        { name: 'Message-ID', value: '<abc@example.com>' },
      ]),
      connectedAccount,
    );

    const fromParticipant = result?.participants.find((p) => p.role === 'FROM');

    expect(fromParticipant).toEqual({
      role: 'FROM',
      handle: 'john.doe@example.com',
      displayName: 'Doe, John',
    });
  });

  it('should mark messages from the connected account as OUTGOING', () => {
    const result = parseAndFormatGmailMessage(
      buildMessage([
        { name: 'From', value: 'me@example.com' },
        { name: 'To', value: 'alice@example.com' },
        { name: 'Message-ID', value: '<abc@example.com>' },
      ]),
      connectedAccount,
    );

    expect(result?.direction).toBe(MessageDirection.OUTGOING);
  });

  it('should keep the body of an entirely-quoted forwarded message instead of emptying it', () => {
    // Regression: planer stripped the whole forwarded body, persisting text=''.
    const forwardedBody =
      '> quoted line one\n> quoted line two\n> quoted line three';

    const result = parseAndFormatGmailMessage(
      buildMessage(
        [
          { name: 'From', value: 'sender@example.com' },
          { name: 'To', value: 'me@example.com' },
          { name: 'Message-ID', value: '<abc@example.com>' },
        ],
        {
          payload: {
            headers: [
              { name: 'From', value: 'sender@example.com' },
              { name: 'To', value: 'me@example.com' },
              { name: 'Message-ID', value: '<abc@example.com>' },
            ],
            mimeType: 'text/plain',
            body: {
              data: Buffer.from(forwardedBody).toString('base64'),
              size: forwardedBody.length,
            },
          },
        },
      ),
      connectedAccount,
    );

    expect(result?.text).toBe(forwardedBody);
  });

  it('should return null when required headers (`From`, `Message-ID`) are missing', () => {
    const result = parseAndFormatGmailMessage(
      buildMessage([{ name: 'To', value: 'alice@example.com' }]),
      connectedAccount,
    );

    expect(result).toBeNull();
  });

  it('should return null when no recipients are present', () => {
    const result = parseAndFormatGmailMessage(
      buildMessage([
        { name: 'From', value: 'sender@example.com' },
        { name: 'Message-ID', value: '<abc@example.com>' },
      ]),
      connectedAccount,
    );

    expect(result).toBeNull();
  });
});
