import { randomUUID } from 'crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { MessageChannelVisibility } from 'twenty-shared/types';

import { MESSAGE_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/message-channel-seed-ids.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SUBJECT = 'Quarterly revenue figures';
const TEXT = 'Revenue came in at 4.2M, do not forward this outside the board.';

const RESTRICTED = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;

const NOT_OWNED_BY_VIEWER_CHANNEL_ID = MESSAGE_CHANNEL_DATA_SEED_IDS.JONY;
const OWNED_BY_VIEWER_CHANNEL_ID = MESSAGE_CHANNEL_DATA_SEED_IDS.JANE;

type MessageFixture = {
  messageId: string;
  messageThreadId: string;
  messageParticipantId: string;
  associationId: string;
};

const setChannelVisibility = async (
  messageChannelId: string,
  visibility: MessageChannelVisibility,
) =>
  globalThis.testDataSource.query(
    `UPDATE core."messageChannel" SET visibility = $1 WHERE id = $2 AND "workspaceId" = $3`,
    [visibility, messageChannelId, SEED_APPLE_WORKSPACE_ID],
  );

const createRecord = async (
  objectMetadataSingularName: string,
  data: object,
) => {
  const response = await makeGraphqlAPIRequest(
    createOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      data,
    }),
  );

  expect(response.body.errors).toBeUndefined();
};

const destroyRecord = async (
  objectMetadataSingularName: string,
  recordId: string,
) =>
  makeGraphqlAPIRequest(
    destroyOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      recordId,
    }),
  );

const createMessageOnChannel = async (
  messageChannelId: string,
): Promise<MessageFixture> => {
  const fixture: MessageFixture = {
    messageId: randomUUID(),
    messageThreadId: randomUUID(),
    messageParticipantId: randomUUID(),
    associationId: randomUUID(),
  };

  await createRecord('messageThread', { id: fixture.messageThreadId });

  await createRecord('message', {
    id: fixture.messageId,
    messageThreadId: fixture.messageThreadId,
    subject: SUBJECT,
    text: TEXT,
    receivedAt: new Date().toISOString(),
  });

  await createRecord('messageChannelMessageAssociation', {
    id: fixture.associationId,
    messageId: fixture.messageId,
    messageChannelId,
  });

  await createRecord('messageParticipant', {
    id: fixture.messageParticipantId,
    messageId: fixture.messageId,
    role: 'FROM',
    handle: 'board@apple.dev',
    displayName: 'Board',
  });

  return fixture;
};

const destroyMessageFixture = async (fixture: MessageFixture) => {
  await destroyRecord('messageParticipant', fixture.messageParticipantId);
  await destroyRecord(
    'messageChannelMessageAssociation',
    fixture.associationId,
  );
  await destroyRecord('message', fixture.messageId);
  await destroyRecord('messageThread', fixture.messageThreadId);
};

const readMessageDirectly = async (messageId: string) => {
  const response = await makeGraphqlAPIRequest(
    findOneOperationFactory({
      objectMetadataSingularName: 'message',
      gqlFields: 'id subject text',
      filter: { id: { eq: messageId } },
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.message;
};

const readMessageThroughThread = async (
  messageThreadId: string,
  messageId: string,
) => {
  const response = await makeGraphqlAPIRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'messageThread',
      objectMetadataPluralName: 'messageThreads',
      gqlFields: `id messages { edges { node { id subject text } } }`,
      filter: { id: { eq: messageThreadId } },
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.messageThreads.edges[0].node.messages.edges
    .map((edge: { node: { id: string } }) => edge.node)
    .find((message: { id: string }) => message.id === messageId);
};

const readMessageThroughParticipant = async (messageParticipantId: string) => {
  const response = await makeGraphqlAPIRequest(
    findManyOperationFactory({
      objectMetadataPluralName: 'messageParticipants',
      objectMetadataSingularName: 'messageParticipant',
      gqlFields: `id message { id subject text }`,
      filter: { id: { eq: messageParticipantId } },
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.messageParticipants.edges[0].node.message;
};

const readMessageThroughMutationResult = async (messageId: string) => {
  const response = await makeGraphqlAPIRequest(
    updateOneOperationFactory({
      objectMetadataSingularName: 'message',
      gqlFields: 'id subject text',
      recordId: messageId,
      data: { receivedAt: new Date().toISOString() },
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.updateMessage;
};

describe('message channel visibility restrictions', () => {
  describe('when the viewer does not own the channel and it is METADATA', () => {
    let fixture: MessageFixture;

    beforeAll(async () => {
      await setChannelVisibility(
        NOT_OWNED_BY_VIEWER_CHANNEL_ID,
        MessageChannelVisibility.METADATA,
      );
      fixture = await createMessageOnChannel(NOT_OWNED_BY_VIEWER_CHANNEL_ID);
    });

    afterAll(async () => {
      await destroyMessageFixture(fixture);
      await setChannelVisibility(
        NOT_OWNED_BY_VIEWER_CHANNEL_ID,
        MessageChannelVisibility.SHARE_EVERYTHING,
      );
    });

    it('hides subject and text when the message is read directly', async () => {
      const message = await readMessageDirectly(fixture.messageId);

      expect(message.subject).toBe(RESTRICTED);
      expect(message.text).toBe(RESTRICTED);
    });

    it('hides subject and text when the message is read through its thread', async () => {
      const message = await readMessageThroughThread(
        fixture.messageThreadId,
        fixture.messageId,
      );

      expect(message.subject).toBe(RESTRICTED);
      expect(message.text).toBe(RESTRICTED);
    });

    it('hides subject and text when the message is read through a participant', async () => {
      const message = await readMessageThroughParticipant(
        fixture.messageParticipantId,
      );

      expect(message.subject).toBe(RESTRICTED);
      expect(message.text).toBe(RESTRICTED);
    });

    it('hides subject and text in the record returned by a mutation', async () => {
      const message = await readMessageThroughMutationResult(fixture.messageId);

      expect(message.subject).toBe(RESTRICTED);
      expect(message.text).toBe(RESTRICTED);
    });
  });

  describe('when the viewer does not own the channel and it is SUBJECT', () => {
    let fixture: MessageFixture;

    beforeAll(async () => {
      await setChannelVisibility(
        NOT_OWNED_BY_VIEWER_CHANNEL_ID,
        MessageChannelVisibility.SUBJECT,
      );
      fixture = await createMessageOnChannel(NOT_OWNED_BY_VIEWER_CHANNEL_ID);
    });

    afterAll(async () => {
      await destroyMessageFixture(fixture);
      await setChannelVisibility(
        NOT_OWNED_BY_VIEWER_CHANNEL_ID,
        MessageChannelVisibility.SHARE_EVERYTHING,
      );
    });

    it('keeps the subject readable and hides only the text through its thread', async () => {
      const message = await readMessageThroughThread(
        fixture.messageThreadId,
        fixture.messageId,
      );

      expect(message.subject).toBe(SUBJECT);
      expect(message.text).toBe(RESTRICTED);
    });
  });

  describe('when the viewer does not own the channel and it is SHARE_EVERYTHING', () => {
    let fixture: MessageFixture;

    beforeAll(async () => {
      await setChannelVisibility(
        NOT_OWNED_BY_VIEWER_CHANNEL_ID,
        MessageChannelVisibility.SHARE_EVERYTHING,
      );
      fixture = await createMessageOnChannel(NOT_OWNED_BY_VIEWER_CHANNEL_ID);
    });

    afterAll(async () => {
      await destroyMessageFixture(fixture);
    });

    it('leaves the message untouched through its thread', async () => {
      const message = await readMessageThroughThread(
        fixture.messageThreadId,
        fixture.messageId,
      );

      expect(message.subject).toBe(SUBJECT);
      expect(message.text).toBe(TEXT);
    });
  });

  describe('when the viewer owns the channel and it is METADATA', () => {
    let fixture: MessageFixture;

    beforeAll(async () => {
      await setChannelVisibility(
        OWNED_BY_VIEWER_CHANNEL_ID,
        MessageChannelVisibility.METADATA,
      );
      fixture = await createMessageOnChannel(OWNED_BY_VIEWER_CHANNEL_ID);
    });

    afterAll(async () => {
      await destroyMessageFixture(fixture);
      await setChannelVisibility(
        OWNED_BY_VIEWER_CHANNEL_ID,
        MessageChannelVisibility.SHARE_EVERYTHING,
      );
    });

    it('leaves the message untouched through its thread', async () => {
      const message = await readMessageThroughThread(
        fixture.messageThreadId,
        fixture.messageId,
      );

      expect(message.subject).toBe(SUBJECT);
      expect(message.text).toBe(TEXT);
    });
  });
});
