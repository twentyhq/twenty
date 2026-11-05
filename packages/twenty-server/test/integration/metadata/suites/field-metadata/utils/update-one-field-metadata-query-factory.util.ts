import gql from 'graphql-tag';
import { type CreateOneFieldFactoryInput } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';

export type UpdateOneFieldFactoryInput = {
  idToUpdate: string;
  updatePayload: Omit<
    UpdateFieldInput,
    'workspaceId' | 'id' | 'isSearchable' | 'options'
  > & {
    isSearchable?: boolean | null;
    options?: CreateOneFieldFactoryInput['options'];
  };
};

export const updateOneFieldMetadataQueryFactory = ({
  gqlFields = 'id',
  input,
}: PerformMetadataQueryParams<UpdateOneFieldFactoryInput>) => ({
  query: gql`
        mutation UpdateOneFieldMetadataItem($idToUpdate: UUID!, $updatePayload: UpdateFieldInput!) {
            updateOneField(input: {id: $idToUpdate, update: $updatePayload}) {
            ${gqlFields}
        }
      }
      `,
  variables: {
    idToUpdate: input.idToUpdate,
    updatePayload: input.updatePayload,
  },
});
