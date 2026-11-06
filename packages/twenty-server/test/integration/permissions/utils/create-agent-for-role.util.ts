import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';

export const createAgentForRole = async ({
  name,
  roleId,
  accessToken,
}: {
  name: string;
  roleId: string;
  accessToken: string;
}) => {
  const { data } = await createOneAgent({
    input: {
      name,
      label: name,
      prompt: 'Record access test agent',
      modelId: TEST_AI_MODEL_ID,
      roleId,
    },
    gqlFields: 'id',
    expectToFail: false,
    token: accessToken,
  });

  return data.createOneAgent.id as string;
};
