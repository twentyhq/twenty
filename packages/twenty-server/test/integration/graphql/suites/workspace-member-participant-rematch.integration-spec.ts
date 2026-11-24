import { randomUUID } from 'crypto';

import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type Participant = {
  handle: string;
  workspaceMemberId: string | null;
};

const PHIL_SEED_EMAIL = 'phil.schiler@apple.dev';
const PHIL_NEW_EMAIL = 'phil.new@member-rematch.test';
const OTHER_EMAIL = 'someone.else@member-rematch.test';

describe('participant matching when a workspace member gets an email', () => {
  let calendarEventId: string;
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

  const updatePhilEmail = async (userEmail: string) => {
    const response = await makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
        gqlFields: 'id',
        data: { userEmail },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    await waitForAllJobsToFinish();
  };

  const findWorkspaceMemberIdByHandle = async ({
    objectMetadataSingularName,
    objectMetadataPluralName,
    filter,
  }: {
    objectMetadataSingularName: string;
    objectMetadataPluralName: string;
    filter: object;
  }): Promise<Record<string, string | null>> => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName,
        objectMetadataPluralName,
        filter,
        gqlFields: 'handle workspaceMemberId',
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return Object.fromEntries(
      response.body.data[objectMetadataPluralName].edges.map(
        ({ node }: { node: Participant }) => [
          node.handle,
          node.workspaceMemberId,
        ],
      ),
    );
  };

  beforeEach(async () => {
    calendarEventId = await create({
      objectName: 'calendarEvent',
      input: {
        title: 'Member rematch',
        isFullDay: false,
        startsAt: '2026-01-01T12:00:00.000Z',
        endsAt: '2026-01-01T13:00:00.000Z',
      },
    });
    const messageThreadId = await create({
      objectName: 'messageThread',
      input: {},
    });

    messageId = await create({
      objectName: 'message',
      input: {
        messageThreadId,
        subject: 'Member rematch',
        receivedAt: '2026-01-01T12:00:00.000Z',
      },
    });

    for (const handle of [PHIL_NEW_EMAIL, OTHER_EMAIL]) {
      await create({
        objectName: 'calendarEventParticipant',
        input: { calendarEventId, handle },
      });
      await create({
        objectName: 'messageParticipant',
        input: { messageId, handle, role: 'TO' },
      });
    }

    await waitForAllJobsToFinish();
  });

  afterEach(async () => {
    await updatePhilEmail(PHIL_SEED_EMAIL);

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

  it('links participants that already have the email a member gets', async () => {
    await updatePhilEmail(PHIL_NEW_EMAIL);

    const expectedLinks = {
      [PHIL_NEW_EMAIL]: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
      [OTHER_EMAIL]: null,
    };

    expect(
      await findWorkspaceMemberIdByHandle({
        objectMetadataSingularName: 'calendarEventParticipant',
        objectMetadataPluralName: 'calendarEventParticipants',
        filter: { calendarEventId: { eq: calendarEventId } },
      }),
    ).toEqual(expectedLinks);
    expect(
      await findWorkspaceMemberIdByHandle({
        objectMetadataSingularName: 'messageParticipant',
        objectMetadataPluralName: 'messageParticipants',
        filter: { messageId: { eq: messageId } },
      }),
    ).toEqual(expectedLinks);
  });
});
