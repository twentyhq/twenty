/* @license Enterprise */

import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DeleteRelatedRecordPathFactoryInput = {
  id: string;
};

export const deleteRelatedRecordPathQueryFactory = ({
  input,
  gqlFields = 'id',
}: PerformMetadataQueryParams<DeleteRelatedRecordPathFactoryInput>) => ({
  query: gql`
    mutation DeleteRelatedRecordPath($id: UUID!) {
      deleteRelatedRecordPath(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: { id: input.id },
});
