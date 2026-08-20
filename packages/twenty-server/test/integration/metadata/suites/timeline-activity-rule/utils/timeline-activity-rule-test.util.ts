import gql from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const RULE_GQL_FIELDS = `
  id
  objectMetadataId
  relationFieldMetadataId
  resolution
  actions
  triggerFieldMetadataIds
  isActive
  isStandard
  isOverridden
`;

export const FIND_TIMELINE_ACTIVITY_RULES = gql`
  query TimelineActivityRules {
    timelineActivityRules {
      ${RULE_GQL_FIELDS}
    }
  }
`;

export const UPSERT_TIMELINE_ACTIVITY_RULE = gql`
  mutation UpsertTimelineActivityRule($input: UpsertTimelineActivityRuleInput!) {
    upsertTimelineActivityRule(input: $input) {
      ${RULE_GQL_FIELDS}
    }
  }
`;

export const RESET_TIMELINE_ACTIVITY_RULE = gql`
  mutation ResetTimelineActivityRule($input: ResetTimelineActivityRuleInput!) {
    resetTimelineActivityRule(input: $input) {
      ${RULE_GQL_FIELDS}
    }
  }
`;

export type TimelineActivityRuleResponse = {
  id: string | null;
  objectMetadataId: string;
  relationFieldMetadataId: string | null;
  resolution: string;
  actions: string[];
  triggerFieldMetadataIds: string[] | null;
  isActive: boolean;
  isStandard: boolean;
  isOverridden: boolean;
};

export const createRecord = async ({
  objectMetadataSingularName,
  data,
}: {
  objectMetadataSingularName: string;
  data: object;
}): Promise<void> => {
  const response = await makeGraphqlAPIRequest(
    createOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      data,
    }),
  );

  expect(response.body.errors).toBeUndefined();
};

export const findTimelineEntriesOnCompany = async ({
  companyId,
  name,
}: {
  companyId: string;
  name: string;
}): Promise<{ name: string; action: string | null }[]> => {
  await waitForAllJobsToFinish();

  const response = await makeGraphqlAPIRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      objectMetadataPluralName: 'timelineActivities',
      gqlFields: 'id name action',
      filter: {
        targetCompanyId: { eq: companyId },
        name: { eq: name },
      },
      first: 10,
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.timelineActivities.edges.map(
    (edge: { node: { name: string; action: string | null } }) => edge.node,
  );
};
