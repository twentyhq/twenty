/* @license Enterprise */

import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';

import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

const CUSTOMER_NEEDS_AMOUNT_EXPRESSION =
  'stage != "CUSTOMER" or not isEmpty(amount)';
const RULE_MESSAGE = 'A customer deal needs an amount';

const createValidationRule = (input: Record<string, unknown>) =>
  makeMetadataApiRequest({
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
  const response = await makeGraphqlApiRequest({
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
      name: 'Customer needs an amount',
      expression: CUSTOMER_NEEDS_AMOUNT_EXPRESSION,
      message: RULE_MESSAGE,
    });

    validationRuleId = response.body.data.createValidationRule.id;
    jestExpectToBeDefined(validationRuleId);
  });

  afterAll(async () => {
    await makeMetadataApiRequest({
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
      await makeGraphqlApiRequest({
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
      name: 'Customer needs an amount',
      expression: 'stage != "CUSTOMER" or not isEmpty(amont)',
      message: RULE_MESSAGE,
    });

    expect(response.body.errors[0].message).toBe('Unknown field "amont"');
  });

  it('should reject a create that violates the rule and report the field and input index', async () => {
    const response = await makeGraphqlApiRequest({
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
    const response = await makeGraphqlApiRequest({
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
    const response = await makeGraphqlApiRequest({
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
    const createResponse = await makeGraphqlApiRequest({
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

    const updateResponse = await makeGraphqlApiRequest({
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

  it('should retain relation keys and composite fields when selecting rule dependencies', async () => {
    const companyResponse = await makeGraphqlApiRequest({
      query: gql`
        mutation {
          createCompany(
            data: { name: "Validation projection company", employees: 5 }
          ) {
            id
          }
        }
      `,
    });
    const companyId = companyResponse.body.data.createCompany.id;
    const ruleResponse = await createValidationRule({
      objectMetadataId: opportunityObjectMetadataId,
      name: 'Company employee requirement',
      expression: 'isDefined(company) and company.employees >= 10',
      message: 'The company needs ten employees',
    });
    const relationRuleId = ruleResponse.body.data.createValidationRule.id;

    try {
      const createOpportunity = () =>
        makeGraphqlApiRequest({
          query: gql`
            mutation CreateProjectionOpportunity($companyId: UUID!) {
              createOpportunity(
                data: {
                  name: "Validation projection opportunity"
                  companyId: $companyId
                  stage: CUSTOMER
                  amount: { amountMicros: 1000000, currencyCode: "USD" }
                }
              ) {
                id
              }
            }
          `,
          variables: { companyId },
        });

      const rejected = await createOpportunity();
      expect(
        rejected.body.errors[0].extensions.validationRuleViolations,
      ).toEqual([expect.objectContaining({ ruleId: relationRuleId })]);

      await makeGraphqlApiRequest({
        query: gql`
          mutation UpdateProjectionCompany($id: UUID!) {
            updateCompany(id: $id, data: { employees: 10 }) {
              id
            }
          }
        `,
        variables: { id: companyId },
      });
      const accepted = await createOpportunity();
      expect(accepted.body.errors).toBeUndefined();
      createdOpportunityIds.push(accepted.body.data.createOpportunity.id);
    } finally {
      await makeMetadataApiRequest({
        query: gql`
          mutation DeleteProjectionRule($id: UUID!) {
            deleteValidationRule(id: $id) {
              id
            }
          }
        `,
        variables: { id: relationRuleId },
      });
      await makeGraphqlApiRequest({
        query: gql`
          mutation DeleteProjectionCompany($id: UUID!) {
            deleteCompany(id: $id) {
              id
            }
          }
        `,
        variables: { id: companyId },
      });
    }
  });
});

describe('Validation rules reading previous values should be enforced on updates', () => {
  let validationRuleId: string;
  const createdOpportunityIds: string[] = [];

  const createOpportunity = async (name: string) => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        mutation CreateOpportunity($name: String!) {
          createOpportunity(data: { name: $name, stage: NEW }) {
            id
          }
        }
      `,
      variables: { name },
    });

    const opportunityId = response.body.data.createOpportunity.id;

    createdOpportunityIds.push(opportunityId);

    return opportunityId;
  };

  const updateStage = ({ id, stage }: { id: string; stage: string }) =>
    makeGraphqlApiRequest({
      query: gql(`
        mutation UpdateOpportunity($id: UUID!) {
          updateOpportunity(id: $id, data: { stage: ${stage} }) {
            id
          }
        }
      `),
      variables: { id },
    });

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

    const stageField = opportunityObjectMetadata.fieldsList?.find(
      (field: { name: string }) => field.name === 'stage',
    );

    jestExpectToBeDefined(stageField);

    const response = await createValidationRule({
      objectMetadataId: opportunityObjectMetadata.id,
      errorFieldMetadataId: stageField.id,
      name: 'Proposal follows a meeting',
      expression:
        'stage != "PROPOSAL" or previous.stage in ["MEETING", "PROPOSAL"]',
      message: 'Hold a meeting before sending a proposal',
    });

    validationRuleId = response.body.data.createValidationRule.id;
    jestExpectToBeDefined(validationRuleId);
  });

  afterAll(async () => {
    await makeMetadataApiRequest({
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
      await makeGraphqlApiRequest({
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

  it('should reject an update that skips the stage the rule requires before it', async () => {
    const opportunityId = await createOpportunity('Previous value skipped');

    const response = await updateStage({
      id: opportunityId,
      stage: 'PROPOSAL',
    });

    expect(response.body.errors[0].extensions.subCode).toBe(
      'VALIDATION_RULE_VIOLATION',
    );
    expect(await findOpportunitiesByName('Previous value skipped')).toEqual([
      { id: opportunityId, stage: 'NEW' },
    ]);
  });

  it('should accept the same stage once the required one comes first', async () => {
    const opportunityId = await createOpportunity('Previous value followed');

    expect(
      (await updateStage({ id: opportunityId, stage: 'MEETING' })).body.errors,
    ).toBe(undefined);
    expect(
      (await updateStage({ id: opportunityId, stage: 'PROPOSAL' })).body.errors,
    ).toBe(undefined);
    expect(await findOpportunitiesByName('Previous value followed')).toEqual([
      { id: opportunityId, stage: 'PROPOSAL' },
    ]);
  });

  it('should reject a filtered bulk update that skips the required stage', async () => {
    const opportunityId = await createOpportunity('Previous value bulk');

    const response = await makeGraphqlApiRequest({
      query: gql`
        mutation UpdateOpportunities($id: UUID!) {
          updateOpportunities(
            filter: { id: { eq: $id } }
            data: { stage: PROPOSAL }
          ) {
            id
          }
        }
      `,
      variables: { id: opportunityId },
    });

    expect(response.body.errors[0].extensions.subCode).toBe(
      'VALIDATION_RULE_VIOLATION',
    );
    expect(await findOpportunitiesByName('Previous value bulk')).toEqual([
      { id: opportunityId, stage: 'NEW' },
    ]);
  });
});

describe('Validation rules reading the previously related record should be enforced on updates', () => {
  let validationRuleId: string;
  const companyIds = {
    big: randomUUID(),
    otherBig: randomUUID(),
    small: randomUUID(),
  };
  const opportunityId = randomUUID();

  const moveOpportunityToCompany = (companyId: string) =>
    makeGraphqlApiRequest({
      query: gql`
        mutation UpdateOpportunity($id: UUID!, $companyId: UUID!) {
          updateOpportunity(id: $id, data: { companyId: $companyId }) {
            id
          }
        }
      `,
      variables: { id: opportunityId, companyId },
    });

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

    const companyField = opportunityObjectMetadata.fieldsList?.find(
      (field: { name: string }) => field.name === 'company',
    );

    jestExpectToBeDefined(companyField);

    await makeGraphqlApiRequest({
      query: gql`
        mutation CreateCompanies($data: [CompanyCreateInput!]!) {
          createCompanies(data: $data) {
            id
          }
        }
      `,
      variables: {
        data: [
          { id: companyIds.big, name: 'Previous relation big', employees: 500 },
          {
            id: companyIds.otherBig,
            name: 'Previous relation other big',
            employees: 800,
          },
          {
            id: companyIds.small,
            name: 'Previous relation small',
            employees: 5,
          },
        ],
      },
    });

    await makeGraphqlApiRequest({
      query: gql`
        mutation CreateOpportunity($id: UUID!, $companyId: UUID!) {
          createOpportunity(
            data: {
              id: $id
              name: "Previous relation deal"
              companyId: $companyId
            }
          ) {
            id
          }
        }
      `,
      variables: { id: opportunityId, companyId: companyIds.big },
    });

    const response = await createValidationRule({
      objectMetadataId: opportunityObjectMetadata.id,
      errorFieldMetadataId: companyField.id,
      name: 'Deals stay with large accounts',
      expression:
        'not isDefined(previous.company) or previous.company.employees <= 100 or company.employees > 100',
      message: 'A deal cannot move from a large account to a small one',
    });

    validationRuleId = response.body.data.createValidationRule.id;
    jestExpectToBeDefined(validationRuleId);
  });

  afterAll(async () => {
    await makeMetadataApiRequest({
      query: gql`
        mutation DeleteValidationRule($id: UUID!) {
          deleteValidationRule(id: $id) {
            id
          }
        }
      `,
      variables: { id: validationRuleId },
    });

    await makeGraphqlApiRequest({
      query: gql`
        mutation DestroyOpportunity($id: UUID!) {
          destroyOpportunity(id: $id) {
            id
          }
        }
      `,
      variables: { id: opportunityId },
    });

    await makeGraphqlApiRequest({
      query: gql`
        mutation DestroyCompanies($ids: [UUID!]!) {
          destroyCompanies(filter: { id: { in: $ids } }) {
            id
          }
        }
      `,
      variables: { ids: Object.values(companyIds) },
    });
  });

  it('should reject moving a deal from a large account to a small one', async () => {
    const response = await moveOpportunityToCompany(companyIds.small);

    expect(response.body.errors[0].extensions.subCode).toBe(
      'VALIDATION_RULE_VIOLATION',
    );
  });

  it('should accept moving a deal between large accounts', async () => {
    const response = await moveOpportunityToCompany(companyIds.otherBig);

    expect(response.body.errors).toBe(undefined);
  });
});
