import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { runAgentQueryFactory } from 'test/integration/graphql/suites/user-session/utils/run-agent-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

describe('runAgent input should be validated', () => {
  it('should refuse an agent universal identifier that is not a UUID', async () => {
    const response = await makeMetadataApiRequest(
      runAgentQueryFactory({
        agentUniversalIdentifier: 'slack-assistant',
        prompt: 'Hello',
      }),
    );

    expect(response.body.errors?.[0]?.extensions?.code).toBe(
      ErrorCode.BAD_USER_INPUT,
    );
    expect(response.body.errors?.[0]?.message).toContain(
      'agentUniversalIdentifier must be a UUID',
    );
  });

  it('should let replayed messages carry an empty assistant turn past validation', async () => {
    const response = await makeMetadataApiRequest({
      query: gql`
        mutation RunAgent($input: RunAgentInput!) {
          runAgent(input: $input) {
            success
          }
        }
      `,
      variables: {
        input: {
          agentUniversalIdentifier: randomUUID(),
          messages: [
            { role: 'user', content: 'Who owns ACME?' },
            { role: 'assistant', content: '' },
            { role: 'user', content: 'Any update?' },
          ],
        },
      },
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe(
      ErrorCode.NOT_FOUND,
    );
  });
});
