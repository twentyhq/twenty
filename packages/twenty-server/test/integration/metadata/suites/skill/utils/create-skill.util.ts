import {
  type CreateSkillFactoryInput,
  createSkillQueryFactory,
} from 'test/integration/metadata/suites/skill/utils/create-skill-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type SkillDTO } from 'src/engine/metadata-modules/skill/dtos/skill.dto';

export const createSkill = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<CreateSkillFactoryInput>): CommonResponseBody<{
  createSkill: SkillDTO;
}> => {
  const graphqlOperation = createSkillQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Skill creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Skill creation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
