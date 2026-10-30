/* @license Enterprise */

import { deleteRelatedRecordPathQueryFactory } from 'test/integration/metadata/suites/related-record-path/utils/delete-related-record-path-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const deleteRelatedRecordPath = (id: string) =>
  makeMetadataApiRequest(
    deleteRelatedRecordPathQueryFactory({ input: { id } }),
  );
