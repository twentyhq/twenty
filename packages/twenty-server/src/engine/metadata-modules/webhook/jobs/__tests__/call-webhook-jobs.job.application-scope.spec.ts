import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { CallWebhookJobsJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs.job';

const buildWebhook = (id: string, applicationUniversalIdentifier: string) => ({
  id,
  applicationUniversalIdentifier,
  targetUrl: `https://example.com/${id}`,
  secret: 'secret',
  operations: ['company.created'],
});

describe('CallWebhookJobsJob application scope', () => {
  it("scopes each delivery job to its webhook's owning application", async () => {
    const objectMetadata = COMPANY_FLAT_OBJECT_MOCK;
    const add = jest.fn().mockResolvedValue(undefined);
    const job = new CallWebhookJobsJob(
      { add } as never,
      {
        getOrRecompute: jest.fn().mockResolvedValue({
          flatObjectMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
            flatEntity: objectMetadata,
            flatEntityMaps: createEmptyFlatEntityMaps(),
          }),
          flatWebhookMaps: {
            byUniversalIdentifier: {
              'webhook-a': buildWebhook('webhook-a', 'application-a'),
              'webhook-b': buildWebhook('webhook-b', 'application-b'),
            },
          },
        }),
      } as never,
      {
        buildEventRecordAccessGate: () => ({
          resolveAdmittedRecordIds: async () =>
            new Set(['record-1', 'record-2']),
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
      name: 'company.created',
      workspaceId: objectMetadata.workspaceId,
      objectMetadata,
      events: ['record-1', 'record-2'].map((recordId) => ({
        recordId,
        properties: { after: { id: recordId } },
      })),
    } as never);

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
          workspaceId: objectMetadata.workspaceId,
          applicationUniversalIdentifier: 'application-a',
        },
      },
      {
        webhookIds: ['webhook-b'],
        options: {
          retryLimit: 3,
          workspaceId: objectMetadata.workspaceId,
          applicationUniversalIdentifier: 'application-b',
        },
      },
    ]);
  });
});
