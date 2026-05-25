import { uploadWorkspaceLogoMutation } from 'test/integration/graphql/utils/upload-workspace-logo-mutation.util';
import { makeMetadataAPIRequestWithFileUpload } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-file-upload.util';

const TEST_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

// 67-byte 1x1 transparent PNG. Big enough for `file-type` to detect a valid
// image header, small enough to keep the upload negligible.
const ONE_BY_ONE_TRANSPARENT_PNG = Buffer.from(
  '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA63000100000005000100200CB81000000000049454E44AE426082',
  'hex',
);

type UploadedWorkspaceLogo = {
  fileId: string;
  signedUrl: string;
  workspaceId: string;
};

export const uploadTestWorkspaceLogo =
  async (): Promise<UploadedWorkspaceLogo> => {
    const response = await makeMetadataAPIRequestWithFileUpload(
      {
        query: uploadWorkspaceLogoMutation,
        variables: { file: null },
      },
      {
        field: 'file',
        buffer: ONE_BY_ONE_TRANSPARENT_PNG,
        filename: 'logo.png',
        contentType: 'image/png',
      },
    );

    if (response.body.errors !== undefined) {
      throw new Error(
        `uploadWorkspaceLogo failed: ${JSON.stringify(response.body.errors)}`,
      );
    }

    const { id, url } = response.body.data.uploadWorkspaceLogo as {
      id: string;
      url: string;
    };

    return { fileId: id, signedUrl: url, workspaceId: TEST_WORKSPACE_ID };
  };

export const cleanupTestWorkspaceLogo = async ({
  fileId,
  workspaceId,
}: {
  fileId: string;
  workspaceId: string;
}): Promise<void> => {
  await globalThis.testDataSource.query(
    `UPDATE core."workspace" SET "logoFileId" = NULL WHERE id = $1`,
    [workspaceId],
  );
  await globalThis.testDataSource.query(
    `DELETE FROM core."file" WHERE id = $1`,
    [fileId],
  );
};
