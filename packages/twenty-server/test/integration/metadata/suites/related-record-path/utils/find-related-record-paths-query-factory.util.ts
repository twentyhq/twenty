/* @license Enterprise */

import gql from 'graphql-tag';
import { RELATED_RECORD_PATH_GQL_FIELDS } from 'test/integration/metadata/suites/related-record-path/utils/related-record-path-gql-fields.constant';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export const findRelatedRecordPathsQueryFactory = ({
  gqlFields = RELATED_RECORD_PATH_GQL_FIELDS,
}: PerformMetadataQueryParams<void>) => ({
  query: gql`
    query RelatedRecordPaths {
      relatedRecordPaths {
        ${gqlFields}
      }
    }
  `,
});
