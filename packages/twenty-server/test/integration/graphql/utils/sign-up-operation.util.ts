import { SignUpInput } from 'src/engine/core-modules/auth/dto/sign-up.input';
import { SignUpOutput } from 'src/engine/core-modules/auth/dto/sign-up.output';
import { makeMetadataAPIRequest } from 'test/integration/graphql/utils/make-metadata-api-request.util';
import { signUpOperationFactory } from 'test/integration/graphql/utils/sign-up-operation-factory.util';
import { CommonResponseBody } from 'test/integration/types/common-response-body.type';

export const performSignUp = async (
  signUpInput: SignUpInput,
): CommonResponseBody<{
  findResponse: SignUpOutput;
}> => {
  const operation = signUpOperationFactory(signUpInput);

  return await makeMetadataAPIRequest({
    operation,
    options: {
      unAuthenticated: true,
    },
  });
};
