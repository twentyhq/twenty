import gql from 'graphql-tag';

type DeleteOneFieldFactoryParams = {
  idToDelete: string;
};

export const deleteOneFieldMetadataItemFactory = ({
  idToDelete,
}: DeleteOneFieldFactoryParams) => ({
  query: gql`
    mutation DeleteOneFieldMetadataItem($idToDelete: UUID!) {
      deleteOneField(input: { id: $idToDelete }) {
        id
      }
    }
  `,
  variables: {
    idToDelete,
  },
});
