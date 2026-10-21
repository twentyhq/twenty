import gql from 'graphql-tag';

const VARIABLE_GQL_FIELDS = `
  id
  key
  description
  isSecret
  isRequired
  isDeprecated
  isFilled
  createdAt
  updatedAt
`;

export const findApplicationRegistrationVariablesQueryFactory = ({
  applicationRegistrationId,
}: {
  applicationRegistrationId: string;
}) => ({
  query: gql`
    query FindApplicationRegistrationVariables(
      $applicationRegistrationId: String!
    ) {
      findApplicationRegistrationVariables(
        applicationRegistrationId: $applicationRegistrationId
      ) {
        ${VARIABLE_GQL_FIELDS}
      }
    }
  `,
  variables: { applicationRegistrationId },
});

export const updateApplicationRegistrationVariableMutationFactory = ({
  id,
  value,
  description,
}: {
  id: string;
  value?: string;
  description?: string;
}) => ({
  query: gql`
    mutation UpdateApplicationRegistrationVariable(
      $input: UpdateApplicationRegistrationVariableInput!
    ) {
      updateApplicationRegistrationVariable(input: $input) {
        ${VARIABLE_GQL_FIELDS}
      }
    }
  `,
  variables: {
    input: {
      id,
      update: {
        ...(value !== undefined && { value }),
        ...(description !== undefined && { description }),
      },
    },
  },
});
