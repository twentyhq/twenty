/* @license Enterprise */

import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

const RECORD_INHERITANCE_RULE_GQL_FIELDS = `
  id
  objectMetadataId
  parentObjectMetadataId
  fieldMetadataId
  junctionFieldMetadataId
`;

export type RecordInheritanceRuleResult = {
  id: string;
  objectMetadataId: string;
  parentObjectMetadataId: string;
  fieldMetadataId: string;
  junctionFieldMetadataId: string | null;
};

export const createRecordInheritanceRule = (input: {
  objectMetadataId: string;
  fieldMetadataId: string;
  junctionFieldMetadataId?: string | null;
}) =>
  makeMetadataApiRequest({
    query: gql`
      mutation CreateRecordInheritanceRule(
        $input: CreateRecordInheritanceRuleInput!
      ) {
        createRecordInheritanceRule(input: $input) {
          ${RECORD_INHERITANCE_RULE_GQL_FIELDS}
        }
      }
    `,
    variables: { input },
  });

export const deleteRecordInheritanceRule = (id: string) =>
  makeMetadataApiRequest({
    query: gql`
      mutation DeleteRecordInheritanceRule($id: UUID!) {
        deleteRecordInheritanceRule(id: $id) {
          id
        }
      }
    `,
    variables: { id },
  });

export const findRecordInheritanceRules = async () => {
  const response = await makeMetadataApiRequest({
    query: gql`
      query RecordInheritanceRules {
        recordInheritanceRules {
          ${RECORD_INHERITANCE_RULE_GQL_FIELDS}
        }
      }
    `,
  });

  return response.body.data
    .recordInheritanceRules as RecordInheritanceRuleResult[];
};
