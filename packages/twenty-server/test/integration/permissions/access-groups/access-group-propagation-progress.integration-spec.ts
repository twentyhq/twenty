import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { type AccessGroupPropagationProgressDTO } from 'src/engine/permissions/dtos/access-group-propagation-progress.dto';

const readProgress = async (
  token?: string,
): Promise<{
  progress: AccessGroupPropagationProgressDTO | undefined;
  errors: { extensions: { code: string } }[] | undefined;
}> => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        query AccessGroupPropagationProgress {
          accessGroupPropagationProgress {
            totalRecordCount
            remainingRecordCount
            isInProgress
          }
        }
      `,
    },
    token,
  );

  return {
    progress: response.body.data?.accessGroupPropagationProgress,
    errors: response.body.errors,
  };
};

describe('access group propagation progress (integration)', () => {
  it('should report nothing while no propagation runs', async () => {
    expect((await readProgress()).progress).toEqual({
      totalRecordCount: 0,
      remainingRecordCount: 0,
      isInProgress: false,
    });
  });

  it('should refuse members who cannot manage roles', async () => {
    const { progress, errors } = await readProgress(
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(progress).toBeUndefined();
    expect(errors?.[0].extensions.code).toBe('FORBIDDEN');
  });
});
