import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindApplicationRegistrationTarballUrlFactoryInput = {
  id: string;
};

export const findApplicationRegistrationTarballUrlQueryFactory = ({
  input,
}: PerformMetadataQueryParams<FindApplicationRegistrationTarballUrlFactoryInput>) => ({
  query: gql`
    query ApplicationRegistrationTarballUrl($id: String!) {
      applicationRegistrationTarballUrl(id: $id)
    }
  `,
  variables: {
    id: input.id,
  },
});
