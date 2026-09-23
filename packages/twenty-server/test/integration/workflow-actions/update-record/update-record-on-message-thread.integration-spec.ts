import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { createOneSelectFieldMetadataForIntegrationTests } from 'test/integration/metadata/suites/field-metadata/utils/create-one-select-field-metadata-for-integration-tests.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { isDefined } from 'twenty-shared/utils';

import { MESSAGE_THREAD_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-thread-data-seeds.constant';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

const MESSAGE_THREAD_ID = MESSAGE_THREAD_DATA_SEED_IDS.ID_1;

const findMessageThread = async () => {
  const [messageThread] = await findRecordNodesByFilter<{
    subject: string;
    category: string | null;
  }>('messageThread', 'messageThreads', 'subject category', {
    id: { eq: MESSAGE_THREAD_ID },
  });

  jestExpectToBeDefined(messageThread);

  return messageThread;
};

describe('UPDATE_RECORD workflow action on message threads (integration)', () => {
  let categoryFieldMetadataId: string | undefined;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: 'id nameSingular',
      expectToFail: false,
    });

    const messageThreadObjectMetadata = objects.find(
      (object) => object.nameSingular === 'messageThread',
    );

    if (!isDefined(messageThreadObjectMetadata)) {
      throw new Error('messageThread object metadata not found');
    }

    const { selectFieldMetadataId } =
      await createOneSelectFieldMetadataForIntegrationTests({
        input: {
          objectMetadataId: messageThreadObjectMetadata.id,
          name: 'category',
        },
      });

    categoryFieldMetadataId = selectFieldMetadataId;
  });

  afterAll(async () => {
    if (!isDefined(categoryFieldMetadataId)) {
      return;
    }

    await updateOneFieldMetadata({
      input: {
        idToUpdate: categoryFieldMetadataId,
        updatePayload: { isActive: false },
      },
      expectToFail: false,
    });

    await deleteOneFieldMetadata({
      input: { idToDelete: categoryFieldMetadataId },
      expectToFail: false,
    });
  });

  it('updates a custom field and returns only the record id', async () => {
    const workflowRun = await runWorkflowActionStep({
      name: 'Update a message thread custom field',
      stepType: 'UPDATE_RECORD',
      input: {
        objectName: 'messageThread',
        objectRecordId: MESSAGE_THREAD_ID,
        objectRecord: { category: 'OPTION_1' },
        fieldsToUpdate: ['category'],
      },
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
      stepResult: { id: MESSAGE_THREAD_ID },
    });
    expect(Object.keys(workflowRun.stepResult ?? {})).toEqual(['id']);

    const messageThread = await findMessageThread();

    expect(messageThread.category).toBe('OPTION_1');
  });

  it('rejects an update of a standard field', async () => {
    const { subject: subjectBeforeRun } = await findMessageThread();

    const workflowRun = await runWorkflowActionStep({
      name: 'Rename a message thread',
      stepType: 'UPDATE_RECORD',
      input: {
        objectName: 'messageThread',
        objectRecordId: MESSAGE_THREAD_ID,
        objectRecord: { subject: 'Renamed by a workflow' },
        fieldsToUpdate: ['subject'],
      },
    });

    expect(workflowRun).toMatchObject({
      stepStatus: 'FAILED',
      stepError: 'Failed to update: Object cannot be updated by automation',
    });

    const messageThread = await findMessageThread();

    expect(messageThread.subject).toBe(subjectBeforeRun);
  });
});
