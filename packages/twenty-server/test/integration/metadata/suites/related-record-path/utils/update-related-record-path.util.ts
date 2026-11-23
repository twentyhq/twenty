/* @license Enterprise */

import {
  type UpdateRelatedRecordPathFactoryInput,
  updateRelatedRecordPathQueryFactory,
} from 'test/integration/metadata/suites/related-record-path/utils/update-related-record-path-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const updateRelatedRecordPath = (
  input: UpdateRelatedRecordPathFactoryInput,
) => makeMetadataApiRequest(updateRelatedRecordPathQueryFactory({ input }));
