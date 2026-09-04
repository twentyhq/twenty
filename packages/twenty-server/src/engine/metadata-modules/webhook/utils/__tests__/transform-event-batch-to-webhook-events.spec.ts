import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  MetadataReadability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import type { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { transformEventBatchToWebhookEvents } from 'src/engine/metadata-modules/webhook/utils/transform-event-batch-to-webhook-events';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordShare } from 'src/engine/record-share/types/record-share.type';

const mockObjectMetadata: FlatObjectMetadata = {
  id: 'id',
  nameSingular: 'nameSingular',
  namePlural: 'namePlural',
  workspaceId: 'workspaceId',
  labelSingular: 'Label Singular',
  labelPlural: 'Label Plural',
  isRemote: false,
  isActive: true,
  isSystem: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  universalIdentifier: 'id',
  fieldIds: [],
  indexMetadataIds: [],
  viewIds: [],
  applicationId: null,
} as unknown as FlatObjectMetadata;

describe('transformEventBatchToWebhookEvents', () => {
  it('should transform properly', () => {
    const workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent> = {
      workspaceId: 'workspaceId',
      objectMetadata: mockObjectMetadata,
      name: 'objectNameSingular.created',
      events: [
        {
          recordId: 'recordId-1',
          properties: {
            after: {
              id: 'id-1',
              nameSingular: 'nameSingular-1',
            },
          },
        },
        {
          recordId: 'recordId-2',
          properties: {
            before: {
              id: 'id-2',
              nameSingular: 'nameSingular-2',
            },
          },
        },
        {
          recordId: 'recordId-3',
          properties: {
            after: {
              id: 'id-3',
              nameSingular: 'nameSingular-3',
              secret: 'secret-3',
            },
            updatedFields: ['nameSingular'],
          },
        },
      ],
    };

    const webhooks = [
      {
        id: 'webhook-id',
        targetUrl: 'targetUrl',
        secret: 'secret',
      },
      {
        id: 'webhook-id-2',
        targetUrl: 'targetUrl-2',
        secret: 'secret-2',
      },
    ] as WebhookEntity[];

    const result = transformEventBatchToWebhookEvents({
      workspaceEventBatch,
      webhooks,
    });
    const expectedResultWithoutEventDate = [
      {
        targetUrl: 'targetUrl',
        eventName: 'objectNameSingular.created',
        objectMetadata: {
          id: mockObjectMetadata.id,
          nameSingular: mockObjectMetadata.nameSingular,
        },
        workspaceId: 'workspaceId',
        webhookId: 'webhook-id',
        record: {
          id: 'id-1',
          nameSingular: 'nameSingular-1',
        },
        secret: 'secret',
      },
      {
        targetUrl: 'targetUrl',
        eventName: 'objectNameSingular.created',
        objectMetadata: {
          id: mockObjectMetadata.id,
          nameSingular: mockObjectMetadata.nameSingular,
        },
        workspaceId: 'workspaceId',
        webhookId: 'webhook-id',
        record: {
          id: 'id-2',
          nameSingular: 'nameSingular-2',
        },
        secret: 'secret',
      },
      {
        targetUrl: 'targetUrl',
        eventName: 'objectNameSingular.created',
        objectMetadata: {
          id: mockObjectMetadata.id,
          nameSingular: mockObjectMetadata.nameSingular,
        },
        workspaceId: 'workspaceId',
        webhookId: 'webhook-id',
        record: {
          id: 'id-3',
          nameSingular: 'nameSingular-3',
          secret: 'secret-3',
        },
        updatedFields: ['nameSingular'],
        secret: 'secret',
      },
      {
        targetUrl: 'targetUrl-2',
        eventName: 'objectNameSingular.created',
        objectMetadata: {
          id: mockObjectMetadata.id,
          nameSingular: mockObjectMetadata.nameSingular,
        },
        workspaceId: 'workspaceId',
        webhookId: 'webhook-id-2',
        record: {
          id: 'id-1',
          nameSingular: 'nameSingular-1',
        },
        secret: 'secret-2',
      },
      {
        targetUrl: 'targetUrl-2',
        eventName: 'objectNameSingular.created',
        objectMetadata: {
          id: mockObjectMetadata.id,
          nameSingular: mockObjectMetadata.nameSingular,
        },
        workspaceId: 'workspaceId',
        webhookId: 'webhook-id-2',
        record: {
          id: 'id-2',
          nameSingular: 'nameSingular-2',
        },
        secret: 'secret-2',
      },
      {
        targetUrl: 'targetUrl-2',
        eventName: 'objectNameSingular.created',
        objectMetadata: {
          id: mockObjectMetadata.id,
          nameSingular: mockObjectMetadata.nameSingular,
        },
        workspaceId: 'workspaceId',
        webhookId: 'webhook-id-2',
        record: {
          id: 'id-3',
          nameSingular: 'nameSingular-3',
          secret: 'secret-3',
        },
        updatedFields: ['nameSingular'],
        secret: 'secret-2',
      },
    ];

    const resultWithoutEventDate = result.map((event) => {
      const { eventDate: _, ...eventWithoutEventDate } = event;

      return eventWithoutEventDate;
    });

    expect(resultWithoutEventDate).toEqual(expectedResultWithoutEventDate);
  });

  it('should sanitize records properly', () => {
    const workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent> = {
      workspaceId: 'workspaceId',
      objectMetadata: mockObjectMetadata,
      name: 'webhook.created',
      events: [
        {
          recordId: 'recordId-1',
          properties: {
            after: {
              id: 'id-1',
              targetUrl: 'targetUrl-1',
              secret: 'secret-1',
            },
          },
        },
      ],
    };

    const webhooks = [
      {
        id: 'webhook-id',
        targetUrl: 'targetUrl',
        secret: 'secret',
      },
    ] as WebhookEntity[];

    const result = transformEventBatchToWebhookEvents({
      workspaceEventBatch,
      webhooks,
    });

    const expectedResultWithoutEventDate = [
      {
        targetUrl: 'targetUrl',
        eventName: 'webhook.created',
        objectMetadata: {
          id: mockObjectMetadata.id,
          nameSingular: mockObjectMetadata.nameSingular,
        },
        workspaceId: 'workspaceId',
        webhookId: 'webhook-id',
        record: {
          id: 'id-1',
          targetUrl: 'targetUrl-1',
          // No secret
        },
        secret: 'secret',
      },
    ];

    const resultWithoutEventDate = result.map((event) => {
      const { eventDate: _, ...eventWithoutEventDate } = event;

      return eventWithoutEventDate;
    });

    expect(resultWithoutEventDate).toEqual(expectedResultWithoutEventDate);
  });

  it('should only keep events of a private object for records shared with everyone', () => {
    const workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent> = {
      workspaceId: 'workspaceId',
      objectMetadata: {
        ...mockObjectMetadata,
        readability: MetadataReadability.PRIVATE,
      },
      name: 'objectNameSingular.created',
      events: [
        {
          recordId: 'recordId-1',
          properties: {
            after: { id: 'recordId-1', nameSingular: 'nameSingular-1' },
          },
        },
        {
          recordId: 'recordId-2',
          properties: {
            after: { id: 'recordId-2', nameSingular: 'nameSingular-2' },
          },
        },
      ],
    };

    const webhooks = [
      {
        id: 'webhook-id',
        targetUrl: 'targetUrl',
        secret: 'secret',
      },
    ] as WebhookEntity[];

    const recordShares = [
      {
        id: 'record-share-1',
        recordId: 'recordId-1',
        objectMetadataId: mockObjectMetadata.id,
        principalId: EVERYONE_PRINCIPAL_ID,
        principalType: RecordSharePrincipalType.EVERYONE,
        accessLevel: RecordShareAccessLevel.READ,
        rowCause: RecordShareRowCause.MANUAL,
        sourceId: 'source-1',
      },
      {
        id: 'record-share-2',
        recordId: 'recordId-2',
        objectMetadataId: mockObjectMetadata.id,
        principalId: 'workspace-member-id',
        principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        accessLevel: RecordShareAccessLevel.FULL,
        rowCause: RecordShareRowCause.MANUAL,
        sourceId: 'source-1',
      },
    ] as RecordShare[];

    const result = transformEventBatchToWebhookEvents({
      workspaceEventBatch,
      webhooks,
      recordShares,
    });

    expect(result).toHaveLength(1);
    expect(result[0].record).toEqual({
      id: 'recordId-1',
      nameSingular: 'nameSingular-1',
    });
  });

  it('should include position-only update events', () => {
    const workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent> = {
      workspaceId: 'workspaceId',
      objectMetadata: mockObjectMetadata,
      name: 'objectNameSingular.updated',
      events: [
        {
          recordId: 'recordId-1',
          properties: {
            after: { id: 'id-1', nameSingular: 'nameSingular-1' },
            updatedFields: ['position'],
          },
        },
        {
          recordId: 'recordId-2',
          properties: {
            after: { id: 'id-2', nameSingular: 'nameSingular-2' },
            updatedFields: ['nameSingular', 'position'],
          },
        },
      ],
    };

    const webhooks = [
      {
        id: 'webhook-id',
        targetUrl: 'targetUrl',
        secret: 'secret',
      },
    ] as WebhookEntity[];

    const result = transformEventBatchToWebhookEvents({
      workspaceEventBatch,
      webhooks,
    });

    expect(result).toHaveLength(2);
    expect(result[0].record).toEqual({
      id: 'id-1',
      nameSingular: 'nameSingular-1',
    });
    expect(result[0].updatedFields).toEqual(['position']);
    expect(result[1].record).toEqual({
      id: 'id-2',
      nameSingular: 'nameSingular-2',
    });
    expect(result[1].updatedFields).toEqual(['nameSingular', 'position']);
  });
});
