import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';

export const createAgentWithoutRole = async ({
  name,
  accessToken,
}: {
  name: string;
  accessToken: string;
}) => {
  const { data } = await createOneAgent({
    input: {
      name,
      label: name,
      prompt: 'Record access test agent',
      modelId: TEST_AI_MODEL_ID,
    },
    gqlFields: 'id',
    expectToFail: false,
    token: accessToken,
  });

  return data.createOneAgent.id;
};
