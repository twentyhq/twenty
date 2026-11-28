import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { StartAppChannelConversationInput } from 'src/engine/metadata-modules/message-channel/dtos/start-app-channel-conversation.input';

const validationErrors = (text: unknown) =>
  validate(
    plainToInstance(StartAppChannelConversationInput, {
      messageChannelId: '55555555-5555-4555-8555-555555555555',
      personId: '66666666-6666-4666-8666-666666666666',
      idempotencyKey: '77777777-7777-4777-8777-777777777777',
      text,
    }),
  );

describe('StartAppChannelConversationInput text', () => {
  it('accepts a message with content', async () => {
    expect(await validationErrors('  Hello Ada  ')).toHaveLength(0);
  });

  it.each(['', '   ', '\n\t '])('rejects blank text %j', async (text) => {
    expect(await validationErrors(text)).not.toHaveLength(0);
  });
});
