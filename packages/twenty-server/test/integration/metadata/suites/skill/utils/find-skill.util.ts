import {
  type FindSkillFactoryInput,
  findSkillQueryFactory,
} from 'test/integration/metadata/suites/skill/utils/find-skill-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type SkillDTO } from 'src/engine/metadata-modules/skill/dtos/skill.dto';

export const findSkill = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<FindSkillFactoryInput>): CommonResponseBody<{
  skill: SkillDTO;
}> => {
  const graphqlOperation = findSkillQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Finding skill should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Finding skill has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
