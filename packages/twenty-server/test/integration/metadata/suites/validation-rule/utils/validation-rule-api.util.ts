import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

const VALIDATION_RULE_GQL_FIELDS = `
  id
  objectMetadataId
  name
  description
  icon
  expression
  message
  errorFieldMetadataId
  isActive
`;

export const createValidationRule = (input: Record<string, unknown>) =>
  makeMetadataApiRequest({
    query: gql`
      mutation CreateValidationRule($input: CreateValidationRuleInput!) {
        createValidationRule(input: $input) {
          ${VALIDATION_RULE_GQL_FIELDS}
        }
      }
    `,
    variables: { input },
  });

export const updateValidationRule = (
  id: string,
  update: Record<string, unknown>,
) =>
  makeMetadataApiRequest({
    query: gql`
      mutation UpdateValidationRule($input: UpdateValidationRuleInput!) {
        updateValidationRule(input: $input) {
          ${VALIDATION_RULE_GQL_FIELDS}
        }
      }
    `,
    variables: { input: { id, update } },
  });

export const deleteValidationRule = (id: string) =>
  makeMetadataApiRequest({
    query: gql`
      mutation DeleteValidationRule($id: UUID!) {
        deleteValidationRule(id: $id) {
          id
        }
      }
    `,
    variables: { id },
  });

export const findValidationRules = async (objectMetadataId: string) => {
  const response = await makeMetadataApiRequest({
    query: gql`
      query ValidationRules($objectMetadataId: UUID!) {
        validationRules(objectMetadataId: $objectMetadataId) {
          ${VALIDATION_RULE_GQL_FIELDS}
        }
      }
    `,
    variables: { objectMetadataId },
  });

  return response.body.data.validationRules as {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    expression: string;
    message: string;
    errorFieldMetadataId: string | null;
    isActive: boolean;
  }[];
};
