import gql from 'graphql-tag';

type DeleteOneRelationFactoryParams = {
  idToDelete: string;
};

export const deleteOneRelationMetadataItemFactory = ({
  idToDelete,
}: DeleteOneRelationFactoryParams) => ({
  query: gql`
    mutation DeleteOneRelation($input: DeleteOneRelationInput!) {
      deleteOneRelation(input: $input) {
        id
      }
    }
  `,
  variables: {
    input: {
      id: idToDelete,
    },
  },
});
