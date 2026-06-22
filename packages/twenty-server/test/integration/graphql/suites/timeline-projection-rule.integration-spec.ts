import gql from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

const GET_OBJECTS = gql`
  query {
    objects(paging: { first: 200 }) {
      edges {
        node {
          id
          nameSingular
        }
      }
    }
  }
`;

const GET_RULES = gql`
  query {
    getTimelineProjectionRules {
      id
      anchorObjectMetadataId
      sourceObjectMetadataId
      linkedObjectMetadataIds
    }
  }
`;

const CREATE_RULE = gql`
  mutation ($input: CreateTimelineProjectionRuleInput!) {
    createTimelineProjectionRule(input: $input) {
      id
      anchorObjectMetadataId
      sourceObjectMetadataId
      linkedObjectMetadataIds
    }
  }
`;

const UPDATE_RULE = gql`
  mutation ($input: UpdateTimelineProjectionRuleInput!) {
    updateTimelineProjectionRule(input: $input) {
      id
      linkedObjectMetadataIds
    }
  }
`;

const DELETE_RULE = gql`
  mutation ($input: DeleteTimelineProjectionRuleInput!) {
    deleteTimelineProjectionRule(input: $input)
  }
`;

const GET_PROJECTIONS = gql`
  query ($objectNameSingular: String!, $recordId: UUID!) {
    getTimelineActivityProjections(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
    ) {
      targetColumnName
      recordIds
      linkedObjectMetadataIds
    }
  }
`;

const RULE_COMPANY_ID = '20202020-7e57-4002-8000-000000000001';
const RULE_OPPORTUNITY_ID = '20202020-7e57-4002-8000-000000000002';

const createRecord = async (
  objectMetadataSingularName: string,
  data: object,
) => {
  const response = await makeGraphqlAPIRequest(
    createOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      data,
    }),
  );

  expect(response.body.errors).toBeUndefined();
};

const deleteRule = (id: string) =>
  makeGraphqlAPIRequest({ query: DELETE_RULE, variables: { input: { id } } });

describe('timeline projection rule resolver (integration)', () => {
  let objectIdByNameSingular: Record<string, string>;
  const createdRuleIds: string[] = [];

  beforeAll(async () => {
    const response = await makeMetadataAPIRequest({ query: GET_OBJECTS });

    objectIdByNameSingular = Object.fromEntries(
      response.body.data.objects.edges.map(
        ({ node }: { node: { id: string; nameSingular: string } }) => [
          node.nameSingular,
          node.id,
        ],
      ),
    );
  });

  afterAll(async () => {
    for (const id of createdRuleIds) {
      await deleteRule(id);
    }
  });

  it('should create, list, update and delete a projection rule', async () => {
    const input = {
      anchorObjectMetadataId: objectIdByNameSingular['company'],
      sourceObjectMetadataId: objectIdByNameSingular['opportunity'],
      linkedObjectMetadataIds: [objectIdByNameSingular['note']],
    };

    const createResponse = await makeGraphqlAPIRequest({
      query: CREATE_RULE,
      variables: { input },
    });

    expect(createResponse.body.errors).toBeUndefined();

    const createdRule = createResponse.body.data.createTimelineProjectionRule;

    createdRuleIds.push(createdRule.id);

    expect(createdRule.anchorObjectMetadataId).toBe(
      input.anchorObjectMetadataId,
    );
    expect(createdRule.linkedObjectMetadataIds).toEqual(
      input.linkedObjectMetadataIds,
    );

    const listResponse = await makeGraphqlAPIRequest({ query: GET_RULES });

    expect(
      listResponse.body.data.getTimelineProjectionRules.map(
        (rule: { id: string }) => rule.id,
      ),
    ).toContain(createdRule.id);

    const updateResponse = await makeGraphqlAPIRequest({
      query: UPDATE_RULE,
      variables: {
        input: {
          id: createdRule.id,
          anchorObjectMetadataId: input.anchorObjectMetadataId,
          sourceObjectMetadataId: input.sourceObjectMetadataId,
          linkedObjectMetadataIds: [
            objectIdByNameSingular['note'],
            objectIdByNameSingular['task'],
          ],
        },
      },
    });

    expect(updateResponse.body.errors).toBeUndefined();
    expect(
      updateResponse.body.data.updateTimelineProjectionRule
        .linkedObjectMetadataIds,
    ).toHaveLength(2);

    const deleteResponse = await deleteRule(createdRule.id);

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteTimelineProjectionRule).toBe(true);

    const listAfterDelete = await makeGraphqlAPIRequest({ query: GET_RULES });

    expect(
      listAfterDelete.body.data.getTimelineProjectionRules.map(
        (rule: { id: string }) => rule.id,
      ),
    ).not.toContain(createdRule.id);
  });

  describe('with a custom rule projecting opportunities onto a company', () => {
    let ruleId: string;

    beforeAll(async () => {
      await createRecord('company', {
        id: RULE_COMPANY_ID,
        name: 'Rule Source Company',
      });

      await createRecord('opportunity', {
        id: RULE_OPPORTUNITY_ID,
        name: 'Rule Source Opportunity',
        companyId: RULE_COMPANY_ID,
      });

      const createResponse = await makeGraphqlAPIRequest({
        query: CREATE_RULE,
        variables: {
          input: {
            anchorObjectMetadataId: objectIdByNameSingular['company'],
            sourceObjectMetadataId: objectIdByNameSingular['opportunity'],
            linkedObjectMetadataIds: [objectIdByNameSingular['note']],
          },
        },
      });

      ruleId = createResponse.body.data.createTimelineProjectionRule.id;
      createdRuleIds.push(ruleId);
    });

    afterAll(async () => {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'opportunity',
          gqlFields: 'id',
          recordId: RULE_OPPORTUNITY_ID,
        }),
      );
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: 'id',
          recordId: RULE_COMPANY_ID,
        }),
      );
    });

    it('should project the related opportunity onto the company timeline', async () => {
      const response = await makeGraphqlAPIRequest({
        query: GET_PROJECTIONS,
        variables: { objectNameSingular: 'company', recordId: RULE_COMPANY_ID },
      });

      expect(response.body.errors).toBeUndefined();

      const opportunityProjection =
        response.body.data.getTimelineActivityProjections.find(
          (projection: { targetColumnName: string }) =>
            projection.targetColumnName === 'targetOpportunityId',
        );

      expect(opportunityProjection).toBeDefined();
      expect(opportunityProjection.recordIds).toContain(RULE_OPPORTUNITY_ID);
      expect(opportunityProjection.linkedObjectMetadataIds).toEqual([
        objectIdByNameSingular['note'],
      ]);
    });
  });
});
