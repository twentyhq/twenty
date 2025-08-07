import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DeleteOneFieldFactoryInput = {
  idToDelete: string;
};

export const deleteOneFieldMetadataQueryFactory = ({
  input,
  gqlFields = 'id',
}: PerformMetadataQueryParams<DeleteOneFieldFactoryInput>) => ({
  query: gql`
        mutation DeleteOneFieldMetadataItem($idToDelete: UUID!) {
          deleteOneField(input: { id: $idToDelete }) {
            ${gqlFields}
        }
      }
      `,
  variables: {
    idToDelete: input.idToDelete,
  },
});
