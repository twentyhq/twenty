import {
  createApplicationRegistrationVariableMutationFactory,
  deleteApplicationRegistrationVariableMutationFactory,
  findApplicationRegistrationVariablesQueryFactory,
  updateApplicationRegistrationVariableMutationFactory,
} from 'test/integration/metadata/suites/application-registration-variable/utils/application-registration-variable-query-factories.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application-registration/application-registration-variable.entity';

type VariableFields = Pick<
  ApplicationRegistrationVariableEntity,
  | 'id'
  | 'key'
  | 'description'
  | 'isSecret'
  | 'isRequired'
  | 'isFilled'
  | 'createdAt'
  | 'updatedAt'
>;

const handleExpectation = (
  response: { body: { errors?: unknown[]; data?: unknown } },
  expectToFail: boolean | undefined,
  operationName: string,
) => {
  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response: response as never,
      errorMessage: `${operationName} should have failed but did not`,
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response: response as never,
      errorMessage: `${operationName} has failed but should not`,
    });
  }
};

export const findApplicationRegistrationVariables = async ({
  applicationRegistrationId,
  expectToFail,
  token,
}: {
  applicationRegistrationId: string;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  findApplicationRegistrationVariables: VariableFields[];
}> => {
  const graphqlOperation = findApplicationRegistrationVariablesQueryFactory({
    applicationRegistrationId,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  handleExpectation(response, expectToFail, 'Find variables');

  return { data: response.body.data, errors: response.body.errors };
};

export const createApplicationRegistrationVariable = async ({
  applicationRegistrationId,
  key,
  value,
  description,
  isSecret,
  expectToFail,
  token,
}: {
  applicationRegistrationId: string;
  key: string;
  value: string;
  description?: string;
  isSecret?: boolean;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  createApplicationRegistrationVariable: VariableFields;
}> => {
  const graphqlOperation = createApplicationRegistrationVariableMutationFactory(
    {
      applicationRegistrationId,
      key,
      value,
      description,
      isSecret,
    },
  );

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  handleExpectation(response, expectToFail, 'Create variable');

  return { data: response.body.data, errors: response.body.errors };
};

export const updateApplicationRegistrationVariable = async ({
  id,
  value,
  description,
  expectToFail,
  token,
}: {
  id: string;
  value?: string;
  description?: string;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  updateApplicationRegistrationVariable: VariableFields;
}> => {
  const graphqlOperation = updateApplicationRegistrationVariableMutationFactory(
    {
      id,
      value,
      description,
    },
  );

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  handleExpectation(response, expectToFail, 'Update variable');

  return { data: response.body.data, errors: response.body.errors };
};

export const deleteApplicationRegistrationVariable = async ({
  id,
  expectToFail,
  token,
}: {
  id: string;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  deleteApplicationRegistrationVariable: boolean;
}> => {
  const graphqlOperation = deleteApplicationRegistrationVariableMutationFactory(
    { id },
  );

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  handleExpectation(response, expectToFail, 'Delete variable');

  return { data: response.body.data, errors: response.body.errors };
};
