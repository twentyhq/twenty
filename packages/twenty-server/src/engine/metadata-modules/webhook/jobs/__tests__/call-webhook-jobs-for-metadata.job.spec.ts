import { CallWebhookJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook.job';
import { CallWebhookJobsForMetadataJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs-for-metadata.job';

const WORKSPACE_ID = 'workspace-id';

const buildWebhook = (id: string, applicationUniversalIdentifier: string) => ({
  id,
  applicationUniversalIdentifier,
  targetUrl: `https://example.com/${id}`,
  secret: 'secret',
  operations: ['metadata.*.*'],
});

describe('CallWebhookJobsForMetadataJob', () => {
  it("scopes each delivery job to its webhook's owning application", async () => {
    const add = jest.fn().mockResolvedValue(undefined);
    const job = new CallWebhookJobsForMetadataJob(
      { add } as never,
      {
        getOrRecompute: jest.fn().mockResolvedValue({
          flatWebhookMaps: {
            byUniversalIdentifier: {
              'webhook-a': buildWebhook('webhook-a', 'application-a'),
              'webhook-b': buildWebhook('webhook-b', 'application-b'),
            },
          },
        }),
      } as never,
      {
        admitWebhookEventsWithinRateLimit: async ({
          webhookEvents,
        }: {
          webhookEvents: unknown[];
        }) => webhookEvents,
      } as never,
    );

    await job.handle({
      name: 'metadata.objectMetadata.created',
      workspaceId: WORKSPACE_ID,
      metadataName: 'objectMetadata',
      type: 'created',
      events: [{ type: 'created' }, { type: 'created' }],
    } as never);

    expect(add).toHaveBeenCalledTimes(2);
    expect(
      add.mock.calls.map(([, webhookEvents, options]) => ({
        webhookIds: [
          ...new Set(
            (webhookEvents as { webhookId: string }[]).map(
              ({ webhookId }) => webhookId,
            ),
          ),
        ],
        options,
      })),
    ).toEqual([
      {
        webhookIds: ['webhook-a'],
        options: {
          retryLimit: 3,
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: 'application-a',
        },
      },
      {
        webhookIds: ['webhook-b'],
        options: {
          retryLimit: 3,
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: 'application-b',
        },
      },
    ]);
    expect(
      add.mock.calls.every(([jobName]) => jobName === CallWebhookJob.name),
    ).toBe(true);
  });
});
