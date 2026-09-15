import { gql } from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

const CREATE_UNSUBSCRIBE_TOPIC = gql`
  mutation CreateUnsubscribeTopic($input: CreateUnsubscribeTopicInput!) {
    createUnsubscribeTopic(input: $input) {
      id
      name
      description
      visibility
    }
  }
`;

const UPDATE_UNSUBSCRIBE_TOPIC = gql`
  mutation UpdateUnsubscribeTopic($input: UpdateUnsubscribeTopicInput!) {
    updateUnsubscribeTopic(input: $input) {
      id
      name
      description
      visibility
    }
  }
`;

const DELETE_UNSUBSCRIBE_TOPIC = gql`
  mutation DeleteUnsubscribeTopic($id: String!) {
    deleteUnsubscribeTopic(id: $id)
  }
`;

const UNSUBSCRIBE_TOPICS = gql`
  query UnsubscribeTopics {
    unsubscribeTopics {
      id
      name
      description
      visibility
    }
  }
`;

describe('unsubscribeTopicResolver (integration)', () => {
  const createdTopicIds: string[] = [];

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
      value: true,
      expectToFail: false,
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  afterEach(async () => {
    for (const id of createdTopicIds) {
      await testDataSource
        .query('DELETE FROM core."unsubscribeTopic" WHERE id = $1', [id])
        .catch(() => {});
    }
    createdTopicIds.length = 0;
  });

  const createTopic = async (input: {
    name: string;
    description?: string;
    visibility?: 'PUBLIC' | 'PRIVATE';
  }) => {
    const response = await makeMetadataAPIRequest({
      query: CREATE_UNSUBSCRIBE_TOPIC,
      variables: { input },
    });

    const createdId: string | undefined =
      response.body.data?.createUnsubscribeTopic?.id;

    if (createdId !== undefined) {
      createdTopicIds.push(createdId);
    }

    return response;
  };

  it('should create a topic and default its visibility to PRIVATE', async () => {
    const response = await createTopic({ name: 'Product updates' });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createUnsubscribeTopic).toMatchObject({
      name: 'Product updates',
      description: null,
      visibility: 'PRIVATE',
    });
    expect(response.body.data.createUnsubscribeTopic.id).toBeDefined();
  });

  it('should persist the topic so it is returned by the list query', async () => {
    const createResponse = await createTopic({
      name: 'Newsletter',
      description: 'Monthly news',
      visibility: 'PUBLIC',
    });
    const createdId = createResponse.body.data.createUnsubscribeTopic.id;

    const listResponse = await makeMetadataAPIRequest({
      query: UNSUBSCRIBE_TOPICS,
    });

    expect(listResponse.body.errors).toBeUndefined();
    expect(
      listResponse.body.data.unsubscribeTopics.find(
        (topic: { id: string }) => topic.id === createdId,
      ),
    ).toMatchObject({
      name: 'Newsletter',
      description: 'Monthly news',
      visibility: 'PUBLIC',
    });
  });

  it('should update an existing topic name and visibility', async () => {
    const createResponse = await createTopic({ name: 'Draft topic' });
    const createdId = createResponse.body.data.createUnsubscribeTopic.id;

    const updateResponse = await makeMetadataAPIRequest({
      query: UPDATE_UNSUBSCRIBE_TOPIC,
      variables: {
        input: { id: createdId, name: 'Renamed topic', visibility: 'PUBLIC' },
      },
    });

    expect(updateResponse.body.errors).toBeUndefined();
    expect(updateResponse.body.data.updateUnsubscribeTopic).toMatchObject({
      id: createdId,
      name: 'Renamed topic',
      visibility: 'PUBLIC',
    });
  });

  it('should delete a topic so it no longer appears in the list', async () => {
    const createResponse = await createTopic({ name: 'Temporary topic' });
    const createdId = createResponse.body.data.createUnsubscribeTopic.id;

    const deleteResponse = await makeMetadataAPIRequest({
      query: DELETE_UNSUBSCRIBE_TOPIC,
      variables: { id: createdId },
    });

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteUnsubscribeTopic).toBe(true);

    const listResponse = await makeMetadataAPIRequest({
      query: UNSUBSCRIBE_TOPICS,
    });

    expect(
      listResponse.body.data.unsubscribeTopics.some(
        (topic: { id: string }) => topic.id === createdId,
      ),
    ).toBe(false);
  });
});
