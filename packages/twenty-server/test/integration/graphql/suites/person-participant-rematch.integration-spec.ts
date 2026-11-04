import { randomUUID } from 'crypto';

import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

type Participant = {
  id: string;
  handle: string;
  personId: string | null;
};

describe('participant rematch when a person changes', () => {
  let personId: string;
  let messageThreadId: string;
  let messageId: string;
  const fixtures: { objectName: string; id: string }[] = [];

  const create = async ({
    objectName,
    input,
  }: {
    objectName: string;
    input: object;
  }) => {
    const id = randomUUID();
    const response = await createOneOperation({
      objectMetadataSingularName: objectName,
      input: { id, ...input },
    });

    expect(response.errors).toBeUndefined();
    fixtures.push({ objectName, id });

    return id;
  };

  const updatePersonEmails = async (emails: {
    primaryEmail: string;
    additionalEmails: string[];
  }) => {
    const response = await makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        recordId: personId,
        gqlFields: 'id',
        data: { emails },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    await waitForAllJobsToFinish();
  };

  const findParticipantPersonIdByHandle = async (): Promise<
    Record<string, string | null>
  > => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'messageParticipant',
        objectMetadataPluralName: 'messageParticipants',
        filter: { messageId: { eq: messageId } },
        gqlFields: 'id handle personId',
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return Object.fromEntries(
      response.body.data.messageParticipants.edges.map(
        ({ node }: { node: Participant }) => [node.handle, node.personId],
      ),
    );
  };

  beforeEach(async () => {
    personId = await create({
      objectName: 'person',
      input: {
        name: { firstName: 'Ada' },
        emails: { primaryEmail: 'ada@rematch.test', additionalEmails: [] },
      },
    });
    messageThreadId = await create({ objectName: 'messageThread', input: {} });
    messageId = await create({
      objectName: 'message',
      input: {
        messageThreadId,
        subject: 'Rematch',
        receivedAt: '2026-01-01T12:00:00.000Z',
      },
    });
    await create({
      objectName: 'messageParticipant',
      input: {
        messageId,
        personId,
        handle: 'ADA@rematch.test',
        role: 'FROM',
      },
    });
    await create({
      objectName: 'messageParticipant',
      input: {
        messageId,
        personId,
        handle: 'urn:li:person:ada',
        role: 'TO',
      },
    });
    await waitForAllJobsToFinish();
  });

  afterEach(async () => {
    const targetsResponse = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'messageThreadTarget',
        objectMetadataPluralName: 'messageThreadTargets',
        filter: { messageThreadId: { eq: messageThreadId } },
        gqlFields: 'id',
      }),
    );

    const targetEdges: { node: { id: string } }[] =
      targetsResponse.body.data.messageThreadTargets.edges;

    for (const { node } of targetEdges) {
      if (!fixtures.some(({ id }) => id === node.id)) {
        fixtures.push({ objectName: 'messageThreadTarget', id: node.id });
      }
    }

    for (const { objectName, id } of fixtures.splice(0).reverse()) {
      const response = await makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: objectName,
          recordId: id,
          gqlFields: 'id',
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }
  });

  it('keeps a non-email participant linked when the person is created and when their emails change', async () => {
    expect(await findParticipantPersonIdByHandle()).toEqual({
      'ADA@rematch.test': personId,
      'urn:li:person:ada': personId,
    });

    await updatePersonEmails({
      primaryEmail: 'ada@rematch.test',
      additionalEmails: ['ada.lovelace@rematch.test'],
    });

    expect((await findParticipantPersonIdByHandle())['urn:li:person:ada']).toBe(
      personId,
    );
  });

  it('releases an email participant, whatever its case, when the person loses that email', async () => {
    await updatePersonEmails({
      primaryEmail: 'lovelace@rematch.test',
      additionalEmails: [],
    });

    expect(await findParticipantPersonIdByHandle()).toEqual({
      'ADA@rematch.test': null,
      'urn:li:person:ada': personId,
    });
  });
});
