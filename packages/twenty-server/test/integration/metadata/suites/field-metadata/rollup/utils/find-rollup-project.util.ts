import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

export const findRollupProject = async ({
  projectId,
  gqlFields,
}: {
  projectId: string;
  gqlFields: string;
}) => {
  await waitForAllJobsToFinish();

  const response = await makeGraphqlApiRequest(
    findOneOperationFactory({
      objectMetadataSingularName: 'rollupProject',
      gqlFields: `id ${gqlFields}`,
      filter: { id: { eq: projectId } },
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.rollupProject;
};
