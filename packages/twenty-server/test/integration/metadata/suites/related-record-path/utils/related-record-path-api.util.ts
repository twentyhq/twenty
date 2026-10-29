/* @license Enterprise */

import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

const RELATED_RECORD_PATH_GQL_FIELDS = `
  id
  sourceObjectMetadataId
  targetObjectMetadataId
  fieldMetadataIds
`;

export type RelatedRecordPathResponse = {
  id: string;
  sourceObjectMetadataId: string;
  targetObjectMetadataId: string;
  fieldMetadataIds: string[];
};

export const createRelatedRecordPath = (input: {
  sourceObjectMetadataId: string;
  fieldMetadataIds: string[];
}) =>
  makeMetadataApiRequest({
    query: gql`
      mutation CreateRelatedRecordPath($input: CreateRelatedRecordPathInput!) {
        createRelatedRecordPath(input: $input) {
          ${RELATED_RECORD_PATH_GQL_FIELDS}
        }
      }
    `,
    variables: { input },
  });

export const deleteRelatedRecordPath = (id: string) =>
  makeMetadataApiRequest({
    query: gql`
      mutation DeleteRelatedRecordPath($id: UUID!) {
        deleteRelatedRecordPath(id: $id) {
          id
        }
      }
    `,
    variables: { id },
  });

export const findRelatedRecordPaths = async () => {
  const response = await makeMetadataApiRequest({
    query: gql`
      query RelatedRecordPaths {
        relatedRecordPaths {
          ${RELATED_RECORD_PATH_GQL_FIELDS}
        }
      }
    `,
  });

  const relatedRecordPaths: RelatedRecordPathResponse[] =
    response.body.data.relatedRecordPaths;

  return relatedRecordPaths;
};
