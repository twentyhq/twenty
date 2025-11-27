import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role-input.dto';

export type CreateOneRoleFactoryInput = CreateRoleInput;

export const createOneRoleQueryFactory = ({
  input,
  gqlFields = 'id',
}: PerformMetadataQueryParams<CreateOneRoleFactoryInput>) => ({
  query: gql`
        mutation CreateOneRole($createRoleInput: CreateRoleInput!) {
          createOneRole(createRoleInput: $createRoleInput) {
            ${gqlFields}
        }
      }
      `,
  variables: {
    createRoleInput: input,
  },
});
