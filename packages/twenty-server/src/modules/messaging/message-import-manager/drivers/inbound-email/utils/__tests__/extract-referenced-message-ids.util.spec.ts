import { extractReferencedMessageIds } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/utils/extract-referenced-message-ids.util';

describe('extractReferencedMessageIds', () => {
  it('should list References ids in order followed by In-Reply-To, without duplicates', () => {
    expect(
      extractReferencedMessageIds([
        { name: 'message-id', value: '<reply@outlook.com>' },
        {
          name: 'in-reply-to',
          value: '<parent@eu-central-1.amazonses.com>',
        },
        {
          name: 'references',
          value: '<token@twenty.com>\r\n <parent@eu-central-1.amazonses.com>',
        },
      ]),
    ).toEqual(['<token@twenty.com>', '<parent@eu-central-1.amazonses.com>']);
  });

  it('should return nothing for a message that replies to nothing', () => {
    expect(
      extractReferencedMessageIds([
        { name: 'message-id', value: '<new@mail.gmail.com>' },
      ]),
    ).toEqual([]);
  });
});
