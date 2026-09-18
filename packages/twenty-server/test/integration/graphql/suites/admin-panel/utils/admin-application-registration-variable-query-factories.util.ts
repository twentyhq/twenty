import gql from 'graphql-tag';

const ADMIN_VARIABLE_GQL_FIELDS = `
  id
  key
  value
  isSecret
  isFilled
`;

export const findAdminApplicationRegistrationVariablesQueryFactory = ({
  applicationRegistrationId,
}: {
  applicationRegistrationId: string;
}) => ({
  query: gql`
    query FindAdminApplicationRegistrationVariables(
      $applicationRegistrationId: String!
    ) {
      findAdminApplicationRegistrationVariables(
        applicationRegistrationId: $applicationRegistrationId
      ) {
        ${ADMIN_VARIABLE_GQL_FIELDS}
      }
    }
  `,
  variables: { applicationRegistrationId },
});

export const updateAdminApplicationRegistrationVariableMutationFactory = ({
  id,
  value,
}: {
  id: string;
  value: string;
}) => ({
  query: gql`
    mutation UpdateAdminApplicationRegistrationVariable(
      $input: UpdateApplicationRegistrationVariableInput!
    ) {
      updateAdminApplicationRegistrationVariable(input: $input) {
        ${ADMIN_VARIABLE_GQL_FIELDS}
      }
    }
  `,
  variables: { input: { id, update: { value } } },
});
