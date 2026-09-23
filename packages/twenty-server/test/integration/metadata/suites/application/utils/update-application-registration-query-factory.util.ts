import gql from 'graphql-tag';

import { type UpdateApplicationRegistrationPayload } from 'src/engine/core-modules/application/application-registration/dtos/update-application-registration.input';

export type UpdateApplicationRegistrationFactoryInput = {
  id: string;
  // Extra keys are allowed on purpose: the failing cases send fields the
  // tenant input type does not declare.
  update: UpdateApplicationRegistrationPayload & Record<string, unknown>;
};

export const updateApplicationRegistrationQueryFactory = ({
  id,
  update,
}: UpdateApplicationRegistrationFactoryInput) => ({
  query: gql`
    mutation UpdateApplicationRegistration(
      $input: UpdateApplicationRegistrationInput!
    ) {
      updateApplicationRegistration(input: $input) {
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
