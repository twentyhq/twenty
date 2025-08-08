import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DeleteOneObjectFactoryInput = {
  idToDelete: string;
};

export const deleteOneObjectMetadataQueryFactory = ({
  input,
  gqlFields = 'id',
}: PerformMetadataQueryParams<DeleteOneObjectFactoryInput>) => ({
  query: gql`
        mutation DeleteOneObjectMetadataItem($idToDelete: UUID!) {
          deleteOneObject(input: { id: $idToDelete }) {
            ${gqlFields}
        }
      }
      `,
  variables: {
    idToDelete: input.idToDelete,
  },
});
