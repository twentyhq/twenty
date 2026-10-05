import { buildOutboundThreadingHeaders } from 'src/modules/messaging/message-outbound-manager/utils/build-outbound-threading-headers.util';

describe('buildOutboundThreadingHeaders', () => {
  it('should carry only the thread token in References for a new conversation', () => {
    expect(
      buildOutboundThreadingHeaders({
        threadExternalId: '<token@acme.com>',
      }),
    ).toEqual([{ name: 'References', value: '<token@acme.com>' }]);
  });

  it('should keep the thread token first and end with the parent when replying', () => {
    expect(
      buildOutboundThreadingHeaders({
        threadExternalId: '<token@acme.com>',
        inReplyTo: '<customer-reply@mail.gmail.com>',
        references: [
          '<first-send@eu-central-1.amazonses.com>',
          '<customer-reply@mail.gmail.com>',
        ],
      }),
    ).toEqual([
      { name: 'In-Reply-To', value: '<customer-reply@mail.gmail.com>' },
      {
        name: 'References',
        value:
          '<token@acme.com> <first-send@eu-central-1.amazonses.com> <customer-reply@mail.gmail.com>',
      },
    ]);
  });

  it('should leave out stored ids that are not valid message ids', () => {
    expect(
      buildOutboundThreadingHeaders({
        threadExternalId: '010701a09b1e987b-03ce71c7-000000',
        inReplyTo: '<customer-reply@mail.gmail.com>',
      }),
    ).toEqual([
      { name: 'In-Reply-To', value: '<customer-reply@mail.gmail.com>' },
      { name: 'References', value: '<customer-reply@mail.gmail.com>' },
    ]);
  });

  it('should drop the oldest middle ids but keep the thread token and the parent when the chain is too long', () => {
    const middleIds = Array.from(
      { length: 30 },
      (_, index) => `<middle-${index}-aaaaaaaaaaaaaaaaaaaa@mail.example.com>`,
    );

    const [, referencesHeader] = buildOutboundThreadingHeaders({
      threadExternalId: '<token@acme.com>',
      inReplyTo: '<parent@mail.example.com>',
      references: [...middleIds, '<parent@mail.example.com>'],
    });

    const keptIds = referencesHeader.value.split(' ');

    expect(`References${referencesHeader.value}`.length).toBeLessThanOrEqual(
      996,
    );
    expect(keptIds[0]).toBe('<token@acme.com>');
    expect(keptIds[keptIds.length - 1]).toBe('<parent@mail.example.com>');
    expect(keptIds).not.toContain(middleIds[0]);
  });
});
