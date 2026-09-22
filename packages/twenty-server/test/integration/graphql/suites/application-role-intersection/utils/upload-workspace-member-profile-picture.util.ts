import { uploadWorkspaceMemberProfilePictureQueryFactory } from 'test/integration/graphql/suites/application-role-intersection/utils/upload-workspace-member-profile-picture-query-factory.util';
import { ONE_BY_ONE_TRANSPARENT_PNG } from 'test/integration/metadata/suites/file/utils/seed-workspace-logo.util';
import { makeMetadataAPIRequestWithFileUpload } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-file-upload.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const uploadWorkspaceMemberProfilePicture = async ({
  expectToFail = false,
  token,
}: {
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  uploadWorkspaceMemberProfilePicture: { id: string; url: string };
}> => {
  const response = await makeMetadataAPIRequestWithFileUpload(
    uploadWorkspaceMemberProfilePictureQueryFactory(),
    {
      field: 'file',
      buffer: ONE_BY_ONE_TRANSPARENT_PNG,
      filename: 'profile-picture.png',
      contentType: 'image/png',
    },
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'uploadWorkspaceMemberProfilePicture should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'uploadWorkspaceMemberProfilePicture has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
