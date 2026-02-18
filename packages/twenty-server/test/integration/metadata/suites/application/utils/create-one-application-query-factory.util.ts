import gql from 'graphql-tag';

export const createOneApplicationQueryFactory = ({
  universalIdentifier,
  name,
  description,
  version,
  sourcePath,
}: {
  universalIdentifier: string;
  name: string;
  description?: string;
  version: string;
  sourcePath: string;
}) => ({
  query: gql`
    mutation CreateOneApplication($input: CreateApplicationInput!) {
      createOneApplication(input: $input) {
        id
        universalIdentifier
        name
      }
    }
  `,
  variables: {
    input: {
      universalIdentifier,
      name,
      description,
      version,
      sourcePath,
    },
  },
});
