import {
  type FindOneApplicationFactoryInput,
  findOneApplicationQueryFactory,
} from 'test/integration/metadata/suites/application/utils/find-one-application-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export type ApplicationRoleIds = {
  id: string;
  defaultRoleId: string | null;
  grantRoleId: string | null;
};

export const findApplicationRoleIds = async ({
  input,
  token,
}: {
  input: FindOneApplicationFactoryInput;
  token?: string;
}): Promise<ApplicationRoleIds> => {
  const response = await makeMetadataApiRequest(
    findOneApplicationQueryFactory({
      input,
      gqlFields: `
        id
        defaultRoleId
        grantRoleId
      `,
    }),
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.findOneApplication;
};
