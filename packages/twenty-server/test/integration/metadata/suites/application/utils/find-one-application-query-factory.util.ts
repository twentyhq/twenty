import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindOneApplicationFactoryInput = {
  id?: string;
  universalIdentifier?: string;
};

const DEFAULT_APPLICATION_GQL_FIELDS = `
  id
  universalIdentifier
`;

export const findOneApplicationQueryFactory = ({
  input,
  gqlFields = DEFAULT_APPLICATION_GQL_FIELDS,
}: PerformMetadataQueryParams<FindOneApplicationFactoryInput>) => ({
  query: gql`
    query FindOneApplication($id: UUID, $universalIdentifier: UUID) {
      findOneApplication(id: $id, universalIdentifier: $universalIdentifier) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
    universalIdentifier: input.universalIdentifier,
  },
});
