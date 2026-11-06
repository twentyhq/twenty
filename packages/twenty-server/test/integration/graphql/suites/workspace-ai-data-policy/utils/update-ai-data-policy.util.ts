import { gql } from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

const UPDATE_WORKSPACE_AI_DATA_POLICY = gql`
  mutation UpdateWorkspaceAiDataPolicy($data: UpdateWorkspaceInput!) {
    updateWorkspace(data: $data) {
      aiDataPolicy {
        requiredDataResidencyRegion
        isZeroDataRetentionRequired
        isProductImprovementDataSharingEnabled
      }
    }
  }
`;

export const updateAiDataPolicy = ({
  data,
  token,
}: {
  data: Record<string, unknown>;
  token: string;
}) =>
  makeMetadataApiRequest(
    { query: UPDATE_WORKSPACE_AI_DATA_POLICY, variables: { data } },
    token,
  );
