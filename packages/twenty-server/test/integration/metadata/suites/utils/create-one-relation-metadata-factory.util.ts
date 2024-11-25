import gql from 'graphql-tag';

import { CreateRelationInput } from 'src/engine/metadata-modules/relation-metadata/dtos/create-relation.input';

type CreateOneRelationFactoryParams = {
  gqlFields: string;
  input?: {
    relation: Omit<CreateRelationInput, 'workspaceId'>;
  };
};

export const createOneRelationMetadataFactory = ({
  gqlFields,
  input,
}: CreateOneRelationFactoryParams) => ({
  query: gql`
      mutation CreateOneRelationMetadata($input: CreateOneRelationInput!) {
        createOneRelation(input: $input) {
          ${gqlFields}
        }
      }
    `,
  variables: {
    input,
  },
});
