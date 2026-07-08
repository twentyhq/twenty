import { MessageOutboundDriverException } from 'src/modules/messaging/message-outbound-manager/drivers/exceptions/message-outbound-driver.exception';
import { parseAppSendMessageResultOrThrow } from 'src/modules/messaging/message-outbound-manager/drivers/app/utils/parse-app-send-message-result-or-throw.util';

describe('parseAppSendMessageResultOrThrow', () => {
  it('returns a send message result with all fields when provided', () => {
    expect(
      parseAppSendMessageResultOrThrow({
        messageExternalId: 'wamid.123',
        threadExternalId: 'thread-1',
        headerMessageId: 'header-1',
      }),
    ).toEqual({
      messageExternalId: 'wamid.123',
      threadExternalId: 'thread-1',
      headerMessageId: 'header-1',
    });
  });

  it('falls back to messageExternalId as headerMessageId when absent', () => {
    expect(
      parseAppSendMessageResultOrThrow({ messageExternalId: 'wamid.123' }),
    ).toEqual({
      messageExternalId: 'wamid.123',
      threadExternalId: undefined,
      headerMessageId: 'wamid.123',
    });
  });

  it('throws when messageExternalId is missing or empty', () => {
    expect(() => parseAppSendMessageResultOrThrow(null)).toThrow(
      MessageOutboundDriverException,
    );
    expect(() =>
      parseAppSendMessageResultOrThrow({ messageExternalId: '' }),
    ).toThrow(MessageOutboundDriverException);
  });
});
