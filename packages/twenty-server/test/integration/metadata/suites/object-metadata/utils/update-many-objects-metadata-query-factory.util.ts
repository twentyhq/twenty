import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';

export type UpdateManyObjectsFactoryInput = {
  inputs: UpdateOneObjectInput[];
};

export const updateManyObjectsMetadataQueryFactory = ({
  gqlFields = 'id',
  input,
}: PerformMetadataQueryParams<UpdateManyObjectsFactoryInput>) => ({
  query: gql`
        mutation UpdateManyObjectMetadataItems($inputs: [UpdateOneObjectInput!]!) {
            updateManyObjects(inputs: $inputs) {
            ${gqlFields}
        }
      }
      `,
  variables: {
    inputs: input.inputs,
  },
});
