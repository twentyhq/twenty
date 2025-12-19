import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { findOneAgent } from 'test/integration/metadata/suites/agent/utils/find-one-agent.util';

describe('Agent deletion should succeed', () => {
  it('should successfully delete a custom agent', async () => {
    const { data: createData } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Agent To Delete',
        prompt: 'This agent will be deleted',
        modelId: 'gpt-4o',
      },
    });

    const agentId = createData.createOneAgent.id;

    const { data: findBeforeData } = await findOneAgent({
      expectToFail: false,
      input: { id: agentId },
    });

    expect(findBeforeData.findOneAgent.id).toBe(agentId);

    const { data: deleteData } = await deleteOneAgent({
      expectToFail: false,
      input: { id: agentId },
    });

    expect(deleteData.deleteOneAgent).toMatchObject({
      id: agentId,
    });

    const { errors: findAfterErrors } = await findOneAgent({
      expectToFail: true,
      input: { id: agentId },
    });

    expect(findAfterErrors).toBeDefined();
  });
});
