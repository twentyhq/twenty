import gql from 'graphql-tag';

import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

const CUSTOMER_WITHOUT_AMOUNT_EXPRESSION =
  'stage == "CUSTOMER" and isEmpty(amount)';
const RULE_MESSAGE = 'A customer deal needs an amount';

const createValidationRule = (input: Record<string, unknown>) =>
  makeMetadataAPIRequest({
    query: gql`
      mutation CreateValidationRule($input: CreateValidationRuleInput!) {
        createValidationRule(input: $input) {
          id
        }
      }
    `,
    variables: { input },
  });

const findOpportunitiesByName = async (name: string) => {
  const response = await makeGraphqlAPIRequest({
    query: gql`
      query FindOpportunities($name: String!) {
        opportunities(filter: { name: { eq: $name } }) {
          edges {
            node {
              id
              stage
            }
          }
        }
      }
    `,
    variables: { name },
  });

  return response.body.data.opportunities.edges.map(
    (edge: { node: { id: string; stage: string } }) => edge.node,
  );
};

describe('Validation rules should be enforced on record writes', () => {
  let validationRuleId: string;
  let opportunityObjectMetadataId: string;
  let amountFieldMetadataId: string;
  const createdOpportunityIds: string[] = [];

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
        }
      `,
    });

    const opportunityObjectMetadata = objects.find(
      (object: { nameSingular: string }) =>
        object.nameSingular === 'opportunity',
    );

    jestExpectToBeDefined(opportunityObjectMetadata);
    opportunityObjectMetadataId = opportunityObjectMetadata.id;

    const amountField = opportunityObjectMetadata.fieldsList?.find(
      (field: { name: string }) => field.name === 'amount',
    );

    jestExpectToBeDefined(amountField);
    amountFieldMetadataId = amountField.id;

    const response = await createValidationRule({
      objectMetadataId: opportunityObjectMetadataId,
      errorFieldMetadataId: amountFieldMetadataId,
      expression: CUSTOMER_WITHOUT_AMOUNT_EXPRESSION,
      message: RULE_MESSAGE,
    });

    validationRuleId = response.body.data.createValidationRule.id;
    jestExpectToBeDefined(validationRuleId);
  });

  afterAll(async () => {
    await makeMetadataAPIRequest({
      query: gql`
        mutation DeleteValidationRule($id: UUID!) {
          deleteValidationRule(id: $id) {
            id
          }
        }
      `,
      variables: { id: validationRuleId },
    });

    if (createdOpportunityIds.length > 0) {
      await makeGraphqlAPIRequest({
        query: gql`
          mutation DestroyOpportunities($ids: [UUID!]!) {
            destroyOpportunities(filter: { id: { in: $ids } }) {
              id
            }
          }
        `,
        variables: { ids: createdOpportunityIds },
      });
    }
  });

  it('should reject a rule expression that references an unknown field', async () => {
    const response = await createValidationRule({
      objectMetadataId: opportunityObjectMetadataId,
      expression: 'stage == "CUSTOMER" and isEmpty(amont)',
      message: RULE_MESSAGE,
    });

    expect(response.body.errors[0].message).toBe('Unknown field "amont"');
  });

  it('should reject a create that violates the rule and report the field and input index', async () => {
    const response = await makeGraphqlAPIRequest({
      query: gql`
        mutation {
          createOpportunity(
            data: { name: "Validation rule invalid create", stage: CUSTOMER }
          ) {
            id
          }
        }
      `,
    });

    expect(response.body.errors[0].extensions.subCode).toBe(
      'VALIDATION_RULE_VIOLATION',
    );
    expect(response.body.errors[0].extensions.validationRuleViolations).toEqual(
      [
        expect.objectContaining({
          ruleId: validationRuleId,
          message: RULE_MESSAGE,
          fieldMetadataId: amountFieldMetadataId,
          inputIndex: 0,
        }),
      ],
    );
    expect(
      await findOpportunitiesByName('Validation rule invalid create'),
    ).toEqual([]);
  });

  it('should accept a create that satisfies the rule', async () => {
    const response = await makeGraphqlAPIRequest({
      query: gql`
        mutation {
          createOpportunity(
            data: {
              name: "Validation rule valid create"
              stage: CUSTOMER
              amount: { amountMicros: 1000000000, currencyCode: "USD" }
            }
          ) {
            id
          }
        }
      `,
    });

    expect(response.body.errors).toBeUndefined();
    createdOpportunityIds.push(response.body.data.createOpportunity.id);
  });

  it('should reject the whole batch when one created record violates the rule', async () => {
    const response = await makeGraphqlAPIRequest({
      query: gql`
        mutation {
          createOpportunities(
            data: [
              { name: "Validation rule batch valid", stage: NEW }
              { name: "Validation rule batch invalid", stage: CUSTOMER }
            ]
          ) {
            id
          }
        }
      `,
    });

    expect(
      response.body.errors[0].extensions.validationRuleViolations[0].inputIndex,
    ).toBe(1);
    expect(
      await findOpportunitiesByName('Validation rule batch valid'),
    ).toEqual([]);
  });

  it('should reject a partial update that makes the record invalid and keep the stored row', async () => {
    const createResponse = await makeGraphqlAPIRequest({
      query: gql`
        mutation {
          createOpportunity(
            data: { name: "Validation rule partial update", stage: NEW }
          ) {
            id
          }
        }
      `,
    });

    const opportunityId = createResponse.body.data.createOpportunity.id;

    createdOpportunityIds.push(opportunityId);

    const updateResponse = await makeGraphqlAPIRequest({
      query: gql`
        mutation UpdateOpportunity($id: UUID!) {
          updateOpportunity(id: $id, data: { stage: CUSTOMER }) {
            id
          }
        }
      `,
      variables: { id: opportunityId },
    });

    expect(updateResponse.body.errors[0].extensions.subCode).toBe(
      'VALIDATION_RULE_VIOLATION',
    );
    expect(
      await findOpportunitiesByName('Validation rule partial update'),
    ).toEqual([{ id: opportunityId, stage: 'NEW' }]);
  });
});
