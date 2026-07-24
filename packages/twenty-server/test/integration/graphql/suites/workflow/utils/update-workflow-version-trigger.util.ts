import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

export const updateWorkflowVersionTrigger = async ({
  workflowVersionId,
  trigger,
}: {
  workflowVersionId: string;
  trigger: object;
}) => {
  const response = await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: `
        mutation UpdateWorkflowVersionTrigger(
          $input: UpdateWorkflowVersionTriggerInput!
        ) {
          updateWorkflowVersionTrigger(input: $input) {
            trigger
          }
        }
      `,
      variables: {
        input: {
          workflowVersionId,
          trigger,
        },
      },
    });

  if (response.body.errors) {
    throw new Error(
      `Failed to update workflow version trigger: ${JSON.stringify(
        response.body.errors,
      )}`,
    );
  }

  return response;
};
