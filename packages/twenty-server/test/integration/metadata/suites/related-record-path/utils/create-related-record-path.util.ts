/* @license Enterprise */

import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { RELATED_RECORD_PATH_GQL_FIELDS } from 'test/integration/metadata/suites/related-record-path/utils/related-record-path-gql-fields.constant';

export const createRelatedRecordPath = (input: {
  objectMetadataId: string;
  firstFieldMetadataId: string;
  secondFieldMetadataId?: string;
  thirdFieldMetadataId?: string;
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
