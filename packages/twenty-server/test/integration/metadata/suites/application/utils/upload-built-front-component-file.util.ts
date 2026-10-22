import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';

// The migration runner refuses to create a front component whose built file is
// not in storage, so every component an item points at needs one uploaded first.
export const uploadBuiltFrontComponentFile = async ({
  applicationUniversalIdentifier,
  componentName,
}: {
  applicationUniversalIdentifier: string;
  componentName: string;
}) => {
  await uploadApplicationFile({
    applicationUniversalIdentifier,
    fileFolder: 'BuiltFrontComponent',
    filePath: `src/front-components/${componentName}.mjs`,
    fileBuffer: Buffer.from('dummy built component content'),
    filename: `${componentName}.mjs`,
    contentType: 'application/javascript',
    expectToFail: false,
  });
};
