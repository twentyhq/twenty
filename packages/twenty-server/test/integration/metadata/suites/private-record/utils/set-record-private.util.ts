/* @license Enterprise */

import {
  type SetRecordPrivateFactoryInput,
  setRecordPrivateQueryFactory,
} from 'test/integration/metadata/suites/private-record/utils/set-record-private-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const setRecordPrivate = (input: SetRecordPrivateFactoryInput) =>
  makeMetadataApiRequest(setRecordPrivateQueryFactory(input));
