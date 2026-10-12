import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindApplicationRegistrationVersionsFactoryInput = {
  applicationRegistrationId: string;
};

export const findApplicationRegistrationVersionsQueryFactory = ({
  input,
}: PerformMetadataQueryParams<FindApplicationRegistrationVersionsFactoryInput>) => ({
  query: gql`
    query FindApplicationRegistrationVersions(
      $applicationRegistrationId: String!
    ) {
      findApplicationRegistrationVersions(
        applicationRegistrationId: $applicationRegistrationId
      ) {
        id
        applicationRegistrationId
        version
        sourceType
        sourcePackage
        tarballFileId
        artifactUrl
        artifactDownloadUrl
        checksum
        publishedByUserId
        publishedByWorkspaceId
        publishedAt
        reviewState
      }
    }
  `,
  variables: {
    applicationRegistrationId: input.applicationRegistrationId,
  },
});
