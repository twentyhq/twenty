import { findAgentsQueryFactory } from 'test/integration/metadata/suites/agent/utils/find-agents-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type AgentDTO } from 'src/engine/metadata-modules/ai/ai-agent/dtos/agent.dto';

export const findAgents = async ({
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<undefined>): CommonResponseBody<{
  findManyAgents: AgentDTO[];
}> => {
  const graphqlOperation = findAgentsQueryFactory({
    gqlFields,
    input: undefined,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Finding agents should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Finding agents has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
