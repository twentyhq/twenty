/* @license Enterprise */

import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

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
