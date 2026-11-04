/* @license Enterprise */

import { findRelatedRecordPathsQueryFactory } from 'test/integration/metadata/suites/related-record-path/utils/find-related-record-paths-query-factory.util';
import { type RelatedRecordPathResponse } from 'test/integration/metadata/suites/related-record-path/utils/related-record-path-gql-fields.constant';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const findRelatedRecordPaths = async () => {
  const response = await makeMetadataApiRequest(
    findRelatedRecordPathsQueryFactory({ input: undefined }),
  );

  const relatedRecordPaths: RelatedRecordPathResponse[] =
    response.body.data.relatedRecordPaths;

  return relatedRecordPaths;
};
