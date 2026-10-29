import { chunkWebhookEventsByApplication } from 'src/engine/metadata-modules/webhook/utils/chunk-webhook-events-by-application.util';

const webhooks = [
  { id: 'webhook-a', applicationUniversalIdentifier: 'application-a' },
  { id: 'webhook-a-bis', applicationUniversalIdentifier: 'application-a' },
  { id: 'webhook-b', applicationUniversalIdentifier: 'application-b' },
];

const buildWebhookEvents = (webhookId: string, count: number) =>
  Array.from({ length: count }, (_, index) => ({
    webhookId,
    eventIndex: index,
  }));

describe('chunkWebhookEventsByApplication', () => {
  it('never mixes webhooks of different owners in one chunk', () => {
    const chunks = chunkWebhookEventsByApplication({
      webhookEvents: [
        ...buildWebhookEvents('webhook-a', 2),
        ...buildWebhookEvents('webhook-b', 2),
        ...buildWebhookEvents('webhook-a-bis', 1),
      ],
      webhooks,
      chunkSize: 20,
    });

    expect(chunks).toEqual([
      {
        applicationUniversalIdentifier: 'application-a',
        webhookEvents: [
          { webhookId: 'webhook-a', eventIndex: 0 },
          { webhookId: 'webhook-a', eventIndex: 1 },
          { webhookId: 'webhook-a-bis', eventIndex: 0 },
        ],
      },
      {
        applicationUniversalIdentifier: 'application-b',
        webhookEvents: [
          { webhookId: 'webhook-b', eventIndex: 0 },
          { webhookId: 'webhook-b', eventIndex: 1 },
        ],
      },
    ]);
  });

  it("chunks each owner's events on its own", () => {
    const chunks = chunkWebhookEventsByApplication({
      webhookEvents: [
        ...buildWebhookEvents('webhook-a', 3),
        ...buildWebhookEvents('webhook-b', 1),
      ],
      webhooks,
      chunkSize: 2,
    });

    expect(
      chunks.map(({ applicationUniversalIdentifier, webhookEvents }) => [
        applicationUniversalIdentifier,
        webhookEvents.length,
      ]),
    ).toEqual([
      ['application-a', 2],
      ['application-a', 1],
      ['application-b', 1],
    ]);
  });
});
