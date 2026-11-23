import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { findAgents } from 'test/integration/metadata/suites/agent/utils/find-agents.util';
import { findOneAgent } from 'test/integration/metadata/suites/agent/utils/find-one-agent.util';
import { updateOneAgent } from 'test/integration/metadata/suites/agent/utils/update-one-agent.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const AGENT_GQL_FIELDS = 'id isPrivate';

const buildAgentInput = (label: string, isPrivate: boolean) => ({
  label,
  prompt: 'Private agent prompt',
  modelId: TEST_AI_MODEL_ID,
  responseFormat: { type: 'text' as const },
  isPrivate,
});

const findAgentIds = async (token: string) => {
  const { data } = await findAgents({
    input: undefined,
    gqlFields: 'id',
    expectToFail: false,
    token,
  });

  return data.findManyAgents.map(({ id }) => id);
};

describe('private agent visibility (integration)', () => {
  let privateAgentId: string;

  beforeAll(async () => {
    const { data } = await createOneAgent({
      expectToFail: false,
      input: buildAgentInput('Jane private agent', true),
      gqlFields: AGENT_GQL_FIELDS,
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    privateAgentId = data.createOneAgent.id;
  });

  afterAll(async () => {
    await deleteOneAgent({
      expectToFail: false,
      input: { id: privateAgentId },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });
  });

  it('lets the owner read their private agent', async () => {
    const { data } = await findOneAgent({
      expectToFail: false,
      input: { id: privateAgentId },
      gqlFields: AGENT_GQL_FIELDS,
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(data.findOneAgent).toEqual({ id: privateAgentId, isPrivate: true });
    expect(await findAgentIds(APPLE_JANE_ADMIN_ACCESS_TOKEN)).toContain(
      privateAgentId,
    );
  });

  it('hides a private agent from an API key', async () => {
    expect(await findAgentIds(API_KEY_ACCESS_TOKEN)).not.toContain(
      privateAgentId,
    );

    const { errors } = await findOneAgent({
      expectToFail: true,
      input: { id: privateAgentId },
      gqlFields: AGENT_GQL_FIELDS,
      token: API_KEY_ACCESS_TOKEN,
    });

    expect(errors?.[0]?.extensions?.code).toBe(ErrorCode.NOT_FOUND);
  });

  it('refuses updates and deletes of a private agent from an API key', async () => {
    const { errors: updateErrors } = await updateOneAgent({
      expectToFail: true,
      input: { id: privateAgentId, label: 'Taken over' },
      gqlFields: AGENT_GQL_FIELDS,
      token: API_KEY_ACCESS_TOKEN,
    });

    const { errors: deleteErrors } = await deleteOneAgent({
      expectToFail: true,
      input: { id: privateAgentId },
      token: API_KEY_ACCESS_TOKEN,
    });

    expect(updateErrors?.[0]?.extensions?.code).toBe(ErrorCode.NOT_FOUND);
    expect(deleteErrors?.[0]?.extensions?.code).toBe(ErrorCode.NOT_FOUND);
  });

  it('refuses a private agent created by an API key', async () => {
    const { errors } = await createOneAgent({
      expectToFail: true,
      input: buildAgentInput('API key private agent', true),
      gqlFields: AGENT_GQL_FIELDS,
      token: API_KEY_ACCESS_TOKEN,
    });

    expect(errors?.[0]?.extensions?.code).toBe(ErrorCode.FORBIDDEN);
  });

  describe('an ownerless shared agent', () => {
    let sharedAgentId: string;

    beforeAll(async () => {
      const { data } = await createOneAgent({
        expectToFail: false,
        input: buildAgentInput('API key shared agent', false),
        gqlFields: AGENT_GQL_FIELDS,
        token: API_KEY_ACCESS_TOKEN,
      });

      sharedAgentId = data.createOneAgent.id;
    });

    afterAll(async () => {
      await deleteOneAgent({
        expectToFail: false,
        input: { id: sharedAgentId },
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });
    });

    it('cannot be made private by an API key', async () => {
      const { errors } = await updateOneAgent({
        expectToFail: true,
        input: { id: sharedAgentId, isPrivate: true },
        gqlFields: AGENT_GQL_FIELDS,
        token: API_KEY_ACCESS_TOKEN,
      });

      expect(errors?.[0]?.extensions?.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('becomes owned by the member who makes it private', async () => {
      const { data } = await updateOneAgent({
        expectToFail: false,
        input: { id: sharedAgentId, isPrivate: true },
        gqlFields: AGENT_GQL_FIELDS,
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      expect(data.updateOneAgent).toEqual({
        id: sharedAgentId,
        isPrivate: true,
      });
      expect(await findAgentIds(API_KEY_ACCESS_TOKEN)).not.toContain(
        sharedAgentId,
      );
      expect(await findAgentIds(APPLE_JANE_ADMIN_ACCESS_TOKEN)).toContain(
        sharedAgentId,
      );
    });
  });
});
