import { Logger } from '@nestjs/common';

import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';
import { CallWebhookJobsJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs.job';
import { type WebhookRateLimitService } from 'src/engine/metadata-modules/webhook/jobs/webhook-rate-limit.service';
import { type CallWebhookJobData } from 'src/engine/metadata-modules/webhook/types/webhook-job-data.type';
import { type PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { type RecordEventPermissionsReadService } from 'src/engine/permissions/record-event-permissions-read.service';
import { type RecordFieldPermissionsReadService } from 'src/engine/permissions/record-field-permissions-read.service';
import { type RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { DatabaseEventTriggerConditionService } from 'src/engine/workspace-event-emitter/services/database-event-trigger-condition.service';

const STAGE_FIELD = getFlatFieldMetadataMock({
  id: 'opportunity-stage-id',
  universalIdentifier: 'opportunity-stage',
  objectMetadataId: 'opportunity-id',
  type: FieldMetadataType.TEXT,
  name: 'stage',
});
const COMPANY_FIELD = getFlatFieldMetadataMock({
  id: 'opportunity-company-id',
  universalIdentifier: 'opportunity-company',
  objectMetadataId: 'opportunity-id',
  type: FieldMetadataType.RELATION,
  name: 'company',
  relationTargetObjectMetadataId: 'company-id',
  settings: { relationType: RelationType.MANY_TO_ONE },
} as Parameters<typeof getFlatFieldMetadataMock>[0]);
const EMPLOYEES_FIELD = getFlatFieldMetadataMock({
  id: 'company-employees-id',
  universalIdentifier: 'company-employees',
  objectMetadataId: 'company-id',
  type: FieldMetadataType.NUMBER,
  name: 'employees',
});

const OPPORTUNITY = getFlatObjectMetadataMock({
  id: 'opportunity-id',
  universalIdentifier: 'opportunity',
  nameSingular: 'opportunity',
  fieldIds: [STAGE_FIELD.id, COMPANY_FIELD.id],
});
const COMPANY = getFlatObjectMetadataMock({
  id: 'company-id',
  universalIdentifier: 'company',
  nameSingular: 'company',
  fieldIds: [EMPLOYEES_FIELD.id],
});

const flatFieldMetadataMaps = [
  STAGE_FIELD,
  COMPANY_FIELD,
  EMPLOYEES_FIELD,
].reduce(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  createEmptyFlatEntityMaps() as FlatEntityMaps<FlatFieldMetadata>,
);
const flatObjectMetadataMaps = [OPPORTUNITY, COMPANY].reduce(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  createEmptyFlatEntityMaps() as FlatEntityMaps<FlatObjectMetadata>,
);

const buildFlatWebhook = ({
  operations = ['opportunity.created'],
  condition = null,
}: {
  operations?: string[];
  condition?: string | null;
}): FlatWebhook => ({
  id: 'webhook-id',
  universalIdentifier: 'webhook-id',
  targetUrl: 'https://example.com/webhook',
  operations,
  description: null,
  condition,
  secret: 'secret',
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-identifier',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
});

const buildOpportunityCreatedEvent = (
  id: string,
  after: Record<string, unknown>,
): ObjectRecordEvent =>
  ({
    recordId: id,
    properties: { after: { id, ...after } },
  }) as ObjectRecordEvent;

const WON_EVENT = buildOpportunityCreatedEvent('won', {
  stage: 'WON',
  companyId: 'big',
});
const LOST_EVENT = buildOpportunityCreatedEvent('lost', {
  stage: 'LOST',
  companyId: 'small',
});

const buildJob = (webhook: FlatWebhook) => {
  const add = jest.fn();
  const find = jest.fn().mockResolvedValue([{ id: 'big', employees: 500 }]);
  const resolvePermissionsPrincipals = jest
    .fn()
    .mockResolvedValue({ workspaceId: 'workspace-id' });
  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatWebhookMaps: addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: webhook,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      }),
      flatRoleTargetMaps: {
        byUniversalIdentifier: {
          'role-target': { webhookId: webhook.id, roleId: 'role-id' },
        },
      },
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    }),
  } as unknown as WorkspaceCacheService;
  const databaseEventTriggerConditionService =
    new DatabaseEventTriggerConditionService(
      workspaceCacheService,
      {
        get: jest.fn().mockResolvedValue({ id: 'workspace-id' }),
      } as unknown as CoreEntityCacheService,
      {
        executeInWorkspaceContext: jest.fn((run: () => unknown) => run()),
        getRepositoryWithoutPermissionChecks: jest
          .fn()
          .mockReturnValue({ find }),
      } as unknown as WorkspaceOrmManager,
      {
        resolvePermissionsPrincipals,
      } as unknown as PrincipalPermissionsReadService,
      {
        findUnreadableFields: jest.fn().mockResolvedValue(new Set()),
        findFieldsHiddenOnMatchingRecords: jest.fn().mockResolvedValue([]),
      } as unknown as RecordFieldPermissionsReadService,
      {
        canAccessSomeRecords: jest.fn().mockResolvedValue(true),
        filterGrantedRecordIds: jest
          .fn()
          .mockImplementation(({ recordIds }) => new Set(recordIds)),
      } as unknown as RecordPermissionsReadService,
    );
  const filterMatchingEvents = jest.spyOn(
    databaseEventTriggerConditionService,
    'filterMatchingEvents',
  );

  const job = new CallWebhookJobsJob(
    { add } as unknown as MessageQueueService,
    workspaceCacheService,
    {
      filterReadableEvents: jest
        .fn()
        .mockImplementation(async ({ eventBatch }) => eventBatch.events),
    } as unknown as RecordEventPermissionsReadService,
    {
      admitWebhookEventsWithinRateLimit: jest
        .fn()
        .mockImplementation(async ({ webhookEvents }) => webhookEvents),
    } as unknown as WebhookRateLimitService,
    databaseEventTriggerConditionService,
  );

  const handleOpportunityCreated = (
    events: ObjectRecordEvent[] = [WON_EVENT, LOST_EVENT],
  ) =>
    job.handle({
      name: 'opportunity.created',
      workspaceId: 'workspace-id',
      objectMetadata: { id: OPPORTUNITY.id, nameSingular: 'opportunity' },
      events,
    });

  const findSentRecordIds = () =>
    add.mock.calls.flatMap(
      ([, webhookEvents]: [string, CallWebhookJobData[]]) =>
        webhookEvents.map(({ record }) => record.id),
    );

  return {
    find,
    resolvePermissionsPrincipals,
    filterMatchingEvents,
    handleOpportunityCreated,
    findSentRecordIds,
  };
};

describe('CallWebhookJobsJob', () => {
  it('sends every readable event when the webhook has no condition', async () => {
    const {
      handleOpportunityCreated,
      findSentRecordIds,
      filterMatchingEvents,
    } = buildJob(buildFlatWebhook({}));

    await handleOpportunityCreated();

    expect(findSentRecordIds()).toEqual(['won', 'lost']);
    expect(filterMatchingEvents).not.toHaveBeenCalled();
  });

  it('sends only the events that meet the condition', async () => {
    const { handleOpportunityCreated, findSentRecordIds } = buildJob(
      buildFlatWebhook({ condition: "stage == 'WON'" }),
    );

    await handleOpportunityCreated();

    expect(findSentRecordIds()).toEqual(['won']);
  });

  it('sends nothing when no event meets the condition', async () => {
    const { handleOpportunityCreated, findSentRecordIds } = buildJob(
      buildFlatWebhook({ condition: "stage == 'PROPOSAL'" }),
    );

    await handleOpportunityCreated();

    expect(findSentRecordIds()).toEqual([]);
  });

  it('reads related records as the webhook', async () => {
    const {
      handleOpportunityCreated,
      findSentRecordIds,
      find,
      resolvePermissionsPrincipals,
    } = buildJob(buildFlatWebhook({ condition: 'company.employees > 100' }));

    await handleOpportunityCreated();

    expect(findSentRecordIds()).toEqual(['won']);
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ select: ['id', 'employees'] }),
    );
    expect(resolvePermissionsPrincipals).toHaveBeenCalledWith({
      authContext: expect.objectContaining({
        type: 'webhook',
        webhook: expect.objectContaining({ id: 'webhook-id' }),
      }),
    });
  });

  it('logs once and sends nothing when a wildcard object lacks a condition field', async () => {
    const { handleOpportunityCreated, findSentRecordIds } = buildJob(
      buildFlatWebhook({ operations: ['*.created'], condition: 'amount > 5' }),
    );
    const warn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);

    await handleOpportunityCreated();

    expect(findSentRecordIds()).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Condition of webhook webhook-id'),
    );
  });
});
