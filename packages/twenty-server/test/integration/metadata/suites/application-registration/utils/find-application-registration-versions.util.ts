import {
  type FindApplicationRegistrationVersionsFactoryInput,
  findApplicationRegistrationVersionsQueryFactory,
} from 'test/integration/metadata/suites/application-registration/utils/find-application-registration-versions-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export type ApplicationRegistrationVersionResult = {
  id: string;
  applicationRegistrationId: string;
  version: string;
  sourceType: string;
  sourcePackage: string | null;
  tarballFileId: string | null;
  artifactUrl: string | null;
  artifactDownloadUrl: string | null;
  checksum: string | null;
  publishedByUserId: string | null;
  publishedByWorkspaceId: string | null;
  publishedAt: string;
  reviewState: string;
};

export const findApplicationRegistrationVersions = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<FindApplicationRegistrationVersionsFactoryInput>): CommonResponseBody<{
  findApplicationRegistrationVersions: ApplicationRegistrationVersionResult[];
}> => {
  const graphqlOperation = findApplicationRegistrationVersionsQueryFactory({
    input,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Finding application registration versions should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Finding application registration versions has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
