import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

type ApplicationSuggestedViewField = {
  universalIdentifier: string;
  viewId: string;
  objectMetadataId: string;
  fieldMetadataId: string;
  position: number;
};

export const findApplicationSuggestedViewFields = async ({
  applicationId,
  token,
}: {
  applicationId: string;
  token?: string;
}): Promise<ApplicationSuggestedViewField[]> => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        query ApplicationSuggestedViewFields($applicationId: UUID!) {
          applicationSuggestedViewFields(applicationId: $applicationId) {
            universalIdentifier
            viewId
            objectMetadataId
            fieldMetadataId
            position
          }
        }
      `,
      variables: { applicationId },
    },
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.applicationSuggestedViewFields;
};

export const dismissApplicationSuggestedViewFields = async ({
  applicationId,
  universalIdentifiers,
  token,
}: {
  applicationId: string;
  universalIdentifiers: string[];
  token?: string;
}): Promise<void> => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        mutation DismissApplicationSuggestedViewFields(
          $input: DismissApplicationSuggestedViewFieldsInput!
        ) {
          dismissApplicationSuggestedViewFields(input: $input)
        }
      `,
      variables: { input: { applicationId, universalIdentifiers } },
    },
    token,
  );

  expect(response.body.errors).toBeUndefined();
};
