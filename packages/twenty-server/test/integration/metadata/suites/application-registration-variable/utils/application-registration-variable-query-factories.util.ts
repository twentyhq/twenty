import gql from 'graphql-tag';

const VARIABLE_GQL_FIELDS = `
  id
  key
  description
  isSecret
  isRequired
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

export const createApplicationRegistrationVariableMutationFactory = ({
  applicationRegistrationId,
  key,
  value,
  description,
  isSecret,
}: {
  applicationRegistrationId: string;
  key: string;
  value: string;
  description?: string;
  isSecret?: boolean;
}) => ({
  query: gql`
    mutation CreateApplicationRegistrationVariable(
      $input: CreateApplicationRegistrationVariableInput!
    ) {
      createApplicationRegistrationVariable(input: $input) {
        ${VARIABLE_GQL_FIELDS}
      }
    }
  `,
  variables: {
    input: {
      applicationRegistrationId,
      key,
      value,
      ...(description !== undefined && { description }),
      ...(isSecret !== undefined && { isSecret }),
    },
  },
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

export const deleteApplicationRegistrationVariableMutationFactory = ({
  id,
}: {
  id: string;
}) => ({
  query: gql`
    mutation DeleteApplicationRegistrationVariable($id: String!) {
      deleteApplicationRegistrationVariable(id: $id)
    }
  `,
  variables: { id },
});
