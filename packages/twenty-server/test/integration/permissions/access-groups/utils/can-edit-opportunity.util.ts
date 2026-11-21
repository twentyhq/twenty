import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { type AccessTestLogin } from 'test/integration/permissions/access-groups/utils/access-test-login.type';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const canEditOpportunity = async ({
  login,
  opportunityId,
}: {
  login: Pick<AccessTestLogin, 'token'>;
  opportunityId: string;
}): Promise<boolean> => {
  const response = await makeGraphqlApiRequest(
    updateOneOperationFactory({
      objectMetadataSingularName: 'opportunity',
      gqlFields: 'id',
      recordId: opportunityId,
      data: { name: `Edited ${v4()}` },
    }),
    login.token,
  );

  return !isDefined(response.body.errors);
};
