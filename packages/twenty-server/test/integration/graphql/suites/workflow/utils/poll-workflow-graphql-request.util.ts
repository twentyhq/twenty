import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

const POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 250;

export const pollWorkflowGraphqlRequest = async <TResult>({
  query,
  variables,
  extract,
  until,
}: {
  query: string;
  variables?: object;
  extract: (data: any) => TResult;
  until: (result: TResult) => boolean;
}): Promise<TResult> => {
  let result: TResult = extract(undefined);

  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
    const response = await workflowGraphqlRequest(query, variables);

    expect(response.body.errors).toBeUndefined();

    result = extract(response.body.data);

    if (until(result)) {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  return result;
};
