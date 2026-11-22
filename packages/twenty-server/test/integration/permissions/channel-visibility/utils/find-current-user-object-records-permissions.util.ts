import { gql } from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const findCurrentUserObjectRecordsPermissions = (accessToken: string) =>
  makeMetadataApiRequest(
    {
      query: gql`
        query {
          currentUser {
            currentUserWorkspace {
              objectRecordsPermissions {
                objectMetadataId
                canReadAllRecords
                canReadSomeRecords
              }
            }
          }
        }
      `,
    },
    accessToken,
  );
