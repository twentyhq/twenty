import { randomUUID } from 'node:crypto';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { upsertFieldPermissions } from 'test/integration/metadata/suites/field-permission/utils/upsert-field-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import {
  createWebhook,
  deleteWebhook,
} from 'test/integration/metadata/suites/utils/webhook-test.util';
import { findFieldMetadataIdByName } from 'test/integration/utils/find-field-metadata-id-by-name.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { type CallWebhookJobsJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs.job';
import { type CallWebhookJobData } from 'src/engine/metadata-modules/webhook/types/webhook-job-data.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const VISIBLE_CHANGE_RECORD_ID = randomUUID();
const HIDDEN_CHANGE_RECORD_ID = randomUUID();
const RECORD_IDS = [VISIBLE_CHANGE_RECORD_ID, HIDDEN_CHANGE_RECORD_ID];

describe('webhook events with an unreadable field', () => {
  let objectMetadataId: string;
  let roleId: string;
  let webhookId: string;

  beforeAll(async () => {
    objectMetadataId = await findObjectMetadataIdByName('person');

    const createdPeople = await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        data: RECORD_IDS.map((id) => ({ id })),
      }),
    );

    expect(createdPeople.body.errors).toBeUndefined();

    const { data } = await createOneRole({
      input: {
        label: 'Webhook Event Field Permissions Role',
        canUpdateAllSettings: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    roleId = data.createOneRole.id;

    await upsertFieldPermissions({
      input: {
        roleId,
        fieldPermissions: [
          {
            objectMetadataId,
            fieldMetadataId: await findFieldMetadataIdByName({
              objectMetadataId,
              fieldName: 'intro',
            }),
            canReadFieldValue: false,
            canUpdateFieldValue: null,
          },
        ],
      },
      expectToFail: false,
    });

    const response = await createWebhook({
      input: {
        targetUrl: 'https://example.com/webhook',
        operations: ['person.updated'],
        roleId,
      },
    });

    expect(response.body.errors).toBeUndefined();

    webhookId = response.body.data.createWebhook.id;
  });

  afterAll(async () => {
    await deleteWebhook({ id: webhookId });
    await deleteOneRole({ input: { idToDelete: roleId } });
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { id: { in: RECORD_IDS } },
      }),
    );
  });

  it('should leave the field out of the payload and skip updates of that field only', async () => {
    const addJob = jest
      .spyOn(
        global.app.get<MessageQueueService>(
          getQueueToken(MessageQueue.webhookQueue),
        ),
        'add',
      )
      .mockResolvedValue(undefined);

    await getAppProviderByClassName<CallWebhookJobsJob>(
      'CallWebhookJobsJob',
    ).handle({
      name: 'person.updated',
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadata: { id: objectMetadataId, nameSingular: 'person' },
      events: [
        {
          recordId: VISIBLE_CHANGE_RECORD_ID,
          properties: {
            before: {
              id: VISIBLE_CHANGE_RECORD_ID,
              jobTitle: 'Before',
              intro: 'Hidden before',
            },
            after: {
              id: VISIBLE_CHANGE_RECORD_ID,
              jobTitle: 'After',
              intro: 'Hidden after',
            },
            diff: {
              jobTitle: { before: 'Before', after: 'After' },
              intro: { before: 'Hidden before', after: 'Hidden after' },
            },
            updatedFields: ['jobTitle', 'intro'],
          },
        },
        {
          recordId: HIDDEN_CHANGE_RECORD_ID,
          properties: {
            before: { id: HIDDEN_CHANGE_RECORD_ID, intro: 'Hidden before' },
            after: { id: HIDDEN_CHANGE_RECORD_ID, intro: 'Hidden after' },
            diff: {
              intro: { before: 'Hidden before', after: 'Hidden after' },
            },
            updatedFields: ['intro'],
          },
        },
      ],
    });

    const webhookJobs = addJob.mock.calls
      .flatMap(([, jobData]) => jobData as CallWebhookJobData[])
      .filter((jobData) => jobData.webhookId === webhookId);

    addJob.mockRestore();

    expect(webhookJobs).toHaveLength(1);
    expect(webhookJobs[0].record).toEqual({
      id: VISIBLE_CHANGE_RECORD_ID,
      jobTitle: 'After',
    });
    expect(webhookJobs[0].updatedFields).toEqual(['jobTitle']);
  });
});
