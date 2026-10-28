import { Test } from '@nestjs/testing';

import { FieldMetadataType, type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WORKSPACE_CUSTOM_APPLICATION_ROLE_UNIVERSAL_IDENTIFIER } from 'src/engine/core-modules/application/constants/workspace-custom-application-role.constant';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { CallWebhookJobsJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs.job';
import { WebhookRateLimitService } from 'src/engine/metadata-modules/webhook/jobs/webhook-rate-limit.service';
import { type CallWebhookJobData } from 'src/engine/metadata-modules/webhook/types/webhook-job-data.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';
const OBJECT_METADATA_ID = 'invoice-object-id';
const OTHER_APPLICATION_ID = 'stripe-application-id';
const CUSTOM_APPLICATION_ID = 'custom-application-id';
const CUSTOM_APPLICATION_ROLE_ID = 'custom-application-role-id';

const FULL_ACCESS: ObjectPermissions = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const buildInvoice = (overrides: Partial<FlatObjectMetadata> = {}) =>
  getFlatObjectMetadataMock({
    id: OBJECT_METADATA_ID,
    universalIdentifier: OBJECT_METADATA_ID,
    nameSingular: 'invoice',
    workspaceId: WORKSPACE_ID,
    applicationId: OTHER_APPLICATION_ID,
    ...overrides,
  });

const flatFieldMetadataMaps = [
  getFlatFieldMetadataMock({
    id: 'name-field-id',
    universalIdentifier: 'name-field-id',
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.TEXT,
    name: 'name',
    applicationId: OTHER_APPLICATION_ID,
  }),
  getFlatFieldMetadataMock({
    id: 'secret-field-id',
    universalIdentifier: 'secret-field-id',
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.TEXT,
    name: 'secret',
    applicationId: OTHER_APPLICATION_ID,
    disabledFieldPermissionActions: ['canReadFieldValue'],
  }),
].reduce(
  (maps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps: maps }),
  createEmptyFlatEntityMaps(),
);

describe('CallWebhookJobsJob', () => {
  const add = jest.fn();
  const getOrRecompute = jest.fn();
  let job: CallWebhookJobsJob;

  const mockCache = (invoice: FlatObjectMetadata | undefined) =>
    getOrRecompute.mockResolvedValue({
      flatWebhookMaps: {
        ...createEmptyFlatEntityMaps(),
        byUniversalIdentifier: {
          webhook: {
            id: 'webhook',
            targetUrl: 'https://example.com',
            operations: ['invoice.created'],
          },
        },
      },
      flatObjectMetadataMaps: isDefined(invoice)
        ? addFlatEntityToFlatEntityMapsOrThrow({
            flatEntity: invoice,
            flatEntityMaps: createEmptyFlatEntityMaps(),
          })
        : createEmptyFlatEntityMaps(),
      flatFieldMetadataMaps,
      flatFieldMetadataMapsOrm: flatFieldMetadataMaps,
      flatApplicationMaps: {
        byId: {
          [CUSTOM_APPLICATION_ID]: {
            id: CUSTOM_APPLICATION_ID,
            defaultRoleId: CUSTOM_APPLICATION_ROLE_ID,
            deletedAt: null,
          },
        },
      },
      flatRoleMaps: {
        byUniversalIdentifier: {
          [WORKSPACE_CUSTOM_APPLICATION_ROLE_UNIVERSAL_IDENTIFIER]: {
            id: CUSTOM_APPLICATION_ROLE_ID,
            applicationId: CUSTOM_APPLICATION_ID,
          },
        },
      },
      rolesPermissions: {
        [CUSTOM_APPLICATION_ROLE_ID]: { [OBJECT_METADATA_ID]: FULL_ACCESS },
      },
      roleIdsWithAllRecordsAccess: [CUSTOM_APPLICATION_ROLE_ID],
      flatRowLevelPermissionPredicateMaps: createEmptyFlatEntityMaps(),
      flatRowLevelPermissionPredicateGroupMaps: createEmptyFlatEntityMaps(),
      featureFlagsMap: {},
    });

  const handleCreatedInvoice = () =>
    job.handle({
      name: 'invoice.created',
      workspaceId: WORKSPACE_ID,
      objectMetadata: { id: OBJECT_METADATA_ID, nameSingular: 'invoice' },
      events: [
        {
          recordId: 'record-1',
          properties: {
            after: { id: 'record-1', name: 'Acme', secret: 'hidden' },
          },
        },
      ],
    });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        CallWebhookJobsJob,
        RecordAccessPolicyService,
        {
          provide: getQueueToken(MessageQueue.webhookQueue),
          useValue: { add },
        },
        { provide: WorkspaceCacheService, useValue: { getOrRecompute } },
        {
          provide: RecordShareStorageService,
          useValue: { findByRecordIds: async () => [] },
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

    job = module.get(CallWebhookJobsJob);
  });

  it('should drop batches whose object metadata is missing', async () => {
    mockCache(undefined);

    await handleCreatedInvoice();

    expect(add).not.toHaveBeenCalled();
  });

  it('should send the record without the fields whose read is disabled', async () => {
    mockCache(buildInvoice());

    await handleCreatedInvoice();

    const [[, webhookEvents]] = add.mock.calls as [
      [string, CallWebhookJobData[]],
    ];

    expect(webhookEvents.map(({ record }) => record)).toEqual([
      { id: 'record-1', name: 'Acme' },
    ]);
  });

  it('should not send records of an object whose read another application disabled', async () => {
    mockCache(
      buildInvoice({
        disabledObjectPermissionActions: ['canReadObjectRecords'],
      }),
    );

    await handleCreatedInvoice();

    expect(add).not.toHaveBeenCalled();
  });
});
