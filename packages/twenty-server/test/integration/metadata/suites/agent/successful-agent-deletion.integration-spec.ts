// import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
// import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
// import { findOneAgent } from 'test/integration/metadata/suites/agent/utils/find-one-agent.util';

// describe('Agent deletion should succeed', () => {
//   it('should successfully delete a custom agent', async () => {
//     // Create an agent
//     const { data: createData } = await createOneAgent({
//       expectToFail: false,
//       input: {
//         label: 'Agent To Delete',
//         prompt: 'This agent will be deleted',
//         modelId: 'gpt-4o',
//       },
//     });

//     const agentId = createData.createOneAgent.id;

//     // Verify agent exists
//     const { data: findBeforeData, errors: findBeforeErrors } =
//       await findOneAgent({
//         expectToFail: false,
//         input: { id: agentId },
//       });

//     expect(findBeforeErrors).toBeUndefined();
//     expect(findBeforeData.findOneAgent).toBeDefined();
//     expect(findBeforeData.findOneAgent.id).toBe(agentId);

//     // Delete the agent
//     const { data: deleteData, errors: deleteErrors } = await deleteOneAgent({
//       expectToFail: false,
//       input: { id: agentId },
//     });

//     expect(deleteErrors).toBeUndefined();
//     expect(deleteData).toBeDefined();
//     expect(deleteData.deleteOneAgent).toMatchObject({
//       id: agentId,
//     });

//     // Verify agent no longer exists
//     const { errors: findAfterErrors } = await findOneAgent({
//       expectToFail: true,
//       input: { id: agentId },
//     });

//     expect(findAfterErrors).toBeDefined();
//   });

//   it('should successfully delete an agent with role assignment', async () => {
//     // Create an agent with all optional fields
//     const { data: createData } = await createOneAgent({
//       expectToFail: false,
//       input: {
//         name: 'agentToDelete',
//         label: 'Complex Agent To Delete',
//         icon: 'IconRobot',
//         description: 'Agent with many fields',
//         prompt: 'Complex agent prompt',
//         modelId: 'gpt-4o',
//         responseFormat: {
//           type: 'json',
//           schema: { type: 'object' },
//         },
//         modelConfiguration: {
//           temperature: 0.8,
//         },
//         evaluationInputs: ['test 1', 'test 2'],
//       },
//     });

//     const agentId = createData.createOneAgent.id;

//     // Delete the agent
//     const { data: deleteData, errors: deleteErrors } = await deleteOneAgent({
//       expectToFail: false,
//       input: { id: agentId },
//     });

//     expect(deleteErrors).toBeUndefined();
//     expect(deleteData).toBeDefined();
//     expect(deleteData.deleteOneAgent.id).toBe(agentId);

//     // Verify agent no longer exists
//     const { errors: findAfterErrors } = await findOneAgent({
//       expectToFail: true,
//       input: { id: agentId },
//     });

//     expect(findAfterErrors).toBeDefined();
//   });
// });

