import gql from 'graphql-tag';

import { type AdminUpdateApplicationRegistrationPayload } from 'src/engine/core-modules/application/application-registration/dtos/admin-update-application-registration.input';

export type UpdateAdminApplicationRegistrationFactoryInput = {
  id: string;
  update: AdminUpdateApplicationRegistrationPayload;
};

export const updateAdminApplicationRegistrationQueryFactory = ({
  id,
  update,
}: UpdateAdminApplicationRegistrationFactoryInput) => ({
  query: gql`
    mutation UpdateAdminApplicationRegistration(
      $input: AdminUpdateApplicationRegistrationInput!
    ) {
      updateAdminApplicationRegistration(input: $input) {
        id
        name
        isListed
        isPreInstalled
        isVetted
      }
    }
  `,
  variables: {
    input: { id, update },
  },
});
