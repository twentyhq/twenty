import {
  type CreateCommandMenuItemFactoryInput,
  createCommandMenuItemQueryFactory,
} from 'test/integration/metadata/suites/command-menu-item/utils/create-command-menu-item-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';

export const createCommandMenuItem = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<CreateCommandMenuItemFactoryInput>): CommonResponseBody<{
  createCommandMenuItem: CommandMenuItemDTO;
}> => {
  const graphqlOperation = createCommandMenuItemQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'CommandMenuItem creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'CommandMenuItem creation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
