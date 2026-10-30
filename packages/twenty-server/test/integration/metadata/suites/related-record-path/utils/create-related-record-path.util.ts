/* @license Enterprise */

import {
  type CreateRelatedRecordPathFactoryInput,
  createRelatedRecordPathQueryFactory,
} from 'test/integration/metadata/suites/related-record-path/utils/create-related-record-path-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const createRelatedRecordPath = (
  input: CreateRelatedRecordPathFactoryInput,
) => makeMetadataApiRequest(createRelatedRecordPathQueryFactory({ input }));
