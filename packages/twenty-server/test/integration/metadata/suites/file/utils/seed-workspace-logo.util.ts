import { uploadWorkspaceLogoMutation } from 'test/integration/graphql/utils/upload-workspace-logo-mutation.util';
import { makeMetadataAPIRequestWithFileUpload } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-file-upload.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// 67-byte 1x1 transparent PNG. Big enough for `file-type` to detect a valid
// image header, small enough to keep the upload negligible. Exported so the
// success spec can assert round-trip byte-equality against the served body.
export const ONE_BY_ONE_TRANSPARENT_PNG = Buffer.from(
  '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA63000100000005000100200CB81000000000049454E44AE426082',
  'hex',
);

type SeededWorkspaceLogo = {
  fileId: string;
  signedUrl: string;
  workspaceId: string;
  cleanup: () => Promise<void>;
};

export const seedWorkspaceLogo = async (): Promise<SeededWorkspaceLogo> => {
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

  const { id: fileId, url: signedUrl } = response.body.data
    .uploadWorkspaceLogo as { id: string; url: string };

  const workspaceId = SEED_APPLE_WORKSPACE_ID;

  const cleanup = async (): Promise<void> => {
    await globalThis.testDataSource.query(
      `UPDATE core."workspace" SET "logoFileId" = NULL WHERE id = $1`,
      [workspaceId],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM core."file" WHERE id = $1`,
      [fileId],
    );
  };

  return { fileId, signedUrl, workspaceId, cleanup };
};
