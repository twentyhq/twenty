import { filterWebhooksMatchingEvent } from 'src/engine/metadata-modules/webhook/utils/filter-webhooks-matching-event.util';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

const buildFlatWebhookMaps = (
  webhooks: { universalIdentifier: string; operations: string[] }[],
) =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      webhooks.map((webhook) => [webhook.universalIdentifier, webhook]),
    ),
  }) as unknown as WorkspaceCacheDataMap['flatWebhookMaps'];

describe('filterWebhooksMatchingEvent', () => {
  it('returns the webhooks subscribed to the exact operation', () => {
    const webhooks = filterWebhooksMatchingEvent({
      flatWebhookMaps: buildFlatWebhookMaps([
        { universalIdentifier: 'exact', operations: ['company.updated'] },
        { universalIdentifier: 'other', operations: ['person.created'] },
      ]),
      nameSingular: 'company',
      operation: 'updated',
    });

    expect(webhooks.map((webhook) => webhook.universalIdentifier)).toEqual([
      'exact',
    ]);
  });

  it('returns the webhooks subscribed through a wildcard', () => {
    const webhooks = filterWebhooksMatchingEvent({
      flatWebhookMaps: buildFlatWebhookMaps([
        { universalIdentifier: 'everything', operations: ['*.*'] },
        { universalIdentifier: 'anyUpdate', operations: ['*.updated'] },
      ]),
      nameSingular: 'company',
      operation: 'updated',
    });

    expect(webhooks.map((webhook) => webhook.universalIdentifier)).toEqual([
      'everything',
      'anyUpdate',
    ]);
  });

  it('returns nothing when no webhook subscribes to the event', () => {
    expect(
      filterWebhooksMatchingEvent({
        flatWebhookMaps: buildFlatWebhookMaps([
          { universalIdentifier: 'other', operations: ['person.created'] },
        ]),
        nameSingular: 'company',
        operation: 'updated',
      }),
    ).toEqual([]);
  });

  it('ignores wildcard subscriptions for workflowRun.updated', () => {
    expect(
      filterWebhooksMatchingEvent({
        flatWebhookMaps: buildFlatWebhookMaps([
          { universalIdentifier: 'everything', operations: ['*.*'] },
        ]),
        nameSingular: 'workflowRun',
        operation: 'updated',
      }),
    ).toEqual([]);
  });
});
