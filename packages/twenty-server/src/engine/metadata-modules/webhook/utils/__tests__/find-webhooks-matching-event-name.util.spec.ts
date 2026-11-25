import { type FlatWebhookMaps } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook-maps.type';
import { findWebhooksMatchingEventName } from 'src/engine/metadata-modules/webhook/utils/find-webhooks-matching-event-name.util';

const buildFlatWebhookMaps = (
  operationsByWebhookId: Record<string, string[]>,
): FlatWebhookMaps => ({
  universalIdentifierById: {},
  universalIdentifiersByApplicationId: {},
  byUniversalIdentifier: Object.fromEntries(
    Object.entries(operationsByWebhookId).map(([webhookId, operations]) => [
      webhookId,
      {
        id: webhookId,
        universalIdentifier: webhookId,
        targetUrl: 'https://example.com/webhook',
        operations,
        description: null,
        secret: 'secret',
        workspaceId: 'workspace-id',
        applicationId: 'application-id',
        applicationUniversalIdentifier: 'application-universal-identifier',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        deletedAt: null,
      },
    ]),
  ),
});

const findMatchingWebhookIds = (
  operationsByWebhookId: Record<string, string[]>,
  eventName: string,
) =>
  findWebhooksMatchingEventName({
    flatWebhookMaps: buildFlatWebhookMaps(operationsByWebhookId),
    eventName,
  }).map((webhook) => webhook.id);

describe('findWebhooksMatchingEventName', () => {
  it('matches exact and wildcard operations but not other objects or operations', () => {
    expect(
      findMatchingWebhookIds(
        {
          exact: ['person.created'],
          anyObject: ['*.created'],
          anyOperation: ['person.*'],
          everything: ['*.*'],
          otherObject: ['company.created'],
          otherOperation: ['person.updated'],
        },
        'person.created',
      ),
    ).toEqual(['exact', 'anyObject', 'anyOperation', 'everything']);
  });

  it('only matches workflowRun.updated webhooks subscribed to it explicitly', () => {
    expect(
      findMatchingWebhookIds(
        {
          exact: ['workflowRun.updated'],
          everything: ['*.*'],
          anyObject: ['*.updated'],
        },
        'workflowRun.updated',
      ),
    ).toEqual(['exact']);
  });

  it('returns nothing when the workspace has no webhooks', () => {
    expect(findMatchingWebhookIds({}, 'person.created')).toEqual([]);
  });
});
