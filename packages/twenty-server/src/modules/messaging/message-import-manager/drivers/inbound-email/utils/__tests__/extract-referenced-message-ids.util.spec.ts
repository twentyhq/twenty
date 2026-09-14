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

  it('should keep only the thread root and the most recent ids of a very long chain', () => {
    const chainIds = Array.from(
      { length: 500 },
      (_, index) => `<chain-${index}@mail.example.com>`,
    );

    const referencedMessageIds = extractReferencedMessageIds([
      { name: 'references', value: chainIds.join(' ') },
      { name: 'in-reply-to', value: '<parent@mail.example.com>' },
    ]);

    expect(referencedMessageIds).toHaveLength(20);
    expect(referencedMessageIds[0]).toBe('<chain-0@mail.example.com>');
    expect(referencedMessageIds[19]).toBe('<parent@mail.example.com>');
  });

  it('should ignore an id longer than an email header line allows', () => {
    expect(
      extractReferencedMessageIds([
        { name: 'references', value: `<${'a'.repeat(2000)}@mail.example.com>` },
      ]),
    ).toEqual([]);
  });

  it('should return nothing for a message that replies to nothing', () => {
    expect(
      extractReferencedMessageIds([
        { name: 'message-id', value: '<new@mail.gmail.com>' },
      ]),
    ).toEqual([]);
  });
});
