import gql from 'graphql-tag';
import { PerformMetadataQueryParams } from 'test/integration/graphql/types/perform-metadata-query.type';

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
