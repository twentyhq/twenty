import gql from 'graphql-tag';
import { isDefined } from 'twenty-shared/utils';

import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const setupApplicationForSync = async ({
  applicationUniversalIdentifier,
  name,
  sourcePath,
}: {
  applicationUniversalIdentifier: string;
  name: string;
  description: string;
  sourcePath: string;
}) => {
  jest.useRealTimers();

  const registrationResponse = await makeMetadataAPIRequest({
    query: gql`
      mutation CreateApplicationRegistration(
        $input: CreateApplicationRegistrationInput!
      ) {
        createApplicationRegistration(input: $input) {
          applicationRegistration {
            id
          }
        }
      }
    `,
    variables: {
      input: { name, universalIdentifier: applicationUniversalIdentifier },
    },
  });

  if (isDefined(registrationResponse.body.errors)) {
    throw new Error(
      `Failed to create application registration: ${JSON.stringify(
        registrationResponse.body.errors,
      )}`,
    );
  }

  const developmentApplicationResponse = await makeMetadataAPIRequest({
    query: gql`
      mutation CreateDevelopmentApplication(
        $universalIdentifier: String!
        $name: String!
      ) {
        createDevelopmentApplication(
          universalIdentifier: $universalIdentifier
          name: $name
        ) {
          id
        }
      }
    `,
    variables: { universalIdentifier: applicationUniversalIdentifier, name },
  });

  if (isDefined(developmentApplicationResponse.body.errors)) {
    throw new Error(
      `Failed to create development application: ${JSON.stringify(
        developmentApplicationResponse.body.errors,
      )}`,
    );
  }

  const packageJson = JSON.stringify({
    name: sourcePath,
    version: '1.0.0',
  });

  await uploadApplicationFile({
    applicationUniversalIdentifier,
    fileFolder: 'Dependencies',
    filePath: 'package.json',
    fileBuffer: Buffer.from(packageJson),
    filename: 'package.json',
    expectToFail: false,
  });

  jest.useFakeTimers();
};
