import gql from 'graphql-tag';

type DeleteOneObjectFactoryParams = {
  idToDelete: string;
};

export const deleteOneObjectMetadataItemFactory = ({
  idToDelete,
}: DeleteOneObjectFactoryParams) => ({
  query: gql`
    mutation DeleteOneObjectMetadataItem($idToDelete: UUID!) {
      deleteOneObject(input: { id: $idToDelete }) {
        id
      }
    }
  `,
  variables: {
    idToDelete,
  },
});
