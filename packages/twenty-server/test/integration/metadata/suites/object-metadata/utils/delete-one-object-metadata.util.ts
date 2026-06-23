import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  type DeleteOneObjectFactoryInput,
  deleteOneObjectMetadataQueryFactory,
} from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata-query-factory.util';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type MessageQueueDriver } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import { QUEUE_DRIVER } from 'src/engine/core-modules/message-queue/message-queue.constants';

export const deleteOneObjectMetadata = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<DeleteOneObjectFactoryInput>) => {
  const graphqlOperation = deleteOneObjectMetadataQueryFactory({
    input,
    gqlFields,
  });

  // Deleting object metadata drops indexes under a lock_timeout; let in-flight
  // jobs settle first so they don't hold the table lock the migration needs.
  await global.app.get<MessageQueueDriver>(QUEUE_DRIVER).waitForIdle();

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Object Metadata deletion should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Object Metadata deletion has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
