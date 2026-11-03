import { ensureAgentRoleQueryFactory } from 'test/integration/metadata/suites/agent/utils/ensure-agent-role-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';

export const ensureAgentRole = async ({
  agentId,
  expectToFail = false,
}: {
  agentId: string;
  expectToFail?: boolean;
}): CommonResponseBody<{ ensureAgentRole: RoleDTO }> => {
  const response = await makeMetadataApiRequest(
    ensureAgentRoleQueryFactory({ agentId }),
  );

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Agent role initialization should have failed',
    });
  }

  if (!expectToFail) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Agent role initialization should have succeeded',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
