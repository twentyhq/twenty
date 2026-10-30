/* @license Enterprise */

import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  RELATED_RECORD_PATH_GQL_FIELDS,
  type RelatedRecordPathResponse,
} from 'test/integration/metadata/suites/related-record-path/utils/related-record-path-gql-fields.constant';

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
