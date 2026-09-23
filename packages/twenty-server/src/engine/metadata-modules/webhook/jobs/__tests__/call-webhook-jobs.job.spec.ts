import { Test } from '@nestjs/testing';
import { MetadataReadability } from 'twenty-shared/types';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { RecordSharingFeatureService } from 'src/engine/core-modules/record-share/services/record-sharing-feature.service';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { CallWebhookJobsJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs.job';
import { WebhookRateLimitService } from 'src/engine/metadata-modules/webhook/jobs/webhook-rate-limit.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('webhook mandatory visibility', () => {
  it.each([false, true])(
    'drops missing metadata and SYSTEM batches with sharing=%s',
    async (sharingEnabled) => {
      const add = jest.fn();
      const objectMetadata = {
        ...COMPANY_FLAT_OBJECT_MOCK,
        readability: MetadataReadability.SYSTEM,
      };
      const maps = {
        byUniversalIdentifier: {},
        universalIdentifierById: {},
        universalIdentifiersByApplicationId: {},
      };
      const getOrRecompute = jest.fn();
      const module = await Test.createTestingModule({
        providers: [
          CallWebhookJobsJob,
          RecordAccessPolicyService,
          {
            provide: getQueueToken(MessageQueue.webhookQueue),
            useValue: { add },
          },
          { provide: WorkspaceCacheService, useValue: { getOrRecompute } },
          { provide: WorkspaceOrmManager, useValue: {} },
          { provide: RecordShareStorageService, useValue: {} },
          {
            provide: RecordSharingFeatureService,
            useValue: { isRecordSharingEnabled: async () => sharingEnabled },
          },
          {
            provide: WebhookRateLimitService,
            useValue: {
              admitWebhookEventsWithinRateLimit: async ({
                webhookEvents,
              }: {
                webhookEvents: unknown[];
              }) => webhookEvents,
            },
          },
        ],
      }).compile();
      for (const flatObjectMetadataMaps of [
        maps,
        {
          ...maps,
          byUniversalIdentifier: {
            [objectMetadata.universalIdentifier]: objectMetadata,
          },
          universalIdentifierById: {
            [objectMetadata.id]: objectMetadata.universalIdentifier,
          },
        },
      ]) {
        getOrRecompute.mockResolvedValue({
          flatObjectMetadataMaps,
          flatWebhookMaps: {
            ...maps,
            byUniversalIdentifier: {
              webhook: { id: 'webhook', operations: ['company.created'] },
            },
          },
        });
        await module.get(CallWebhookJobsJob).handle({
          name: 'company.created',
          workspaceId: objectMetadata.workspaceId,
          objectMetadata,
          events: [
            {
              recordId: 'private-record',
              properties: { after: { id: 'private-record' } },
            },
          ],
        });
        expect(add).not.toHaveBeenCalled();
      }
      await module.close();
    },
  );
});
