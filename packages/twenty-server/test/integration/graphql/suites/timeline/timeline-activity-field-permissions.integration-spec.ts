import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import request from 'supertest';
import { createCustomRoleWithObjectPermissions } from 'test/integration/graphql/utils/create-custom-role-with-object-permissions.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
import { upsertFieldPermissions } from 'test/integration/graphql/utils/upsert-field-permissions.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

const RESTRICTED_JOB_TITLE = `RESTRICTED-${randomUUID()}`;
const READABLE_FIRST_NAME = `READABLE-${randomUUID()}`;

type TimelineActivityNode = {
  id: string;
  properties: { diff?: Record<string, unknown> } | null;
};

const findMetadataIds = async () => {
  const objectsResponse = await makeMetadataApiRequest({
    query: gql`
      query {
        objects(paging: { first: 1000 }) {
          edges {
            node {
              id
              nameSingular
            }
          }
        }
      }
    `,
  });

  const fieldsResponse = await makeMetadataApiRequest({
    query: gql`
      query {
        fields(paging: { first: 1000 }) {
          edges {
            node {
              id
              name
              object {
                nameSingular
              }
            }
          }
        }
      }
    `,
  });

  const personObjectId = objectsResponse.body.data.objects.edges.find(
    (edge: { node: { nameSingular: string } }) =>
      edge.node.nameSingular === 'person',
  ).node.id;

  const jobTitleFieldId = fieldsResponse.body.data.fields.edges.find(
    (edge: { node: { name: string; object: { nameSingular: string } } }) =>
      edge.node.name === 'jobTitle' &&
      edge.node.object.nameSingular === 'person',
  ).node.id;

  return { personObjectId, jobTitleFieldId };
};

const findPersonTimelineActivities = async ({
  personId,
  asMember,
}: {
  personId: string;
  asMember: boolean;
}): Promise<TimelineActivityNode[]> => {
  const operation = findManyOperationFactory({
    objectMetadataSingularName: 'timelineActivity',
    objectMetadataPluralName: 'timelineActivities',
    gqlFields: 'id properties',
    filter: { targetPersonId: { eq: personId } },
  });

  const response = asMember
    ? await makeGraphqlApiRequestWithMemberRole(operation)
    : await makeGraphqlApiRequest(operation);

  expect(response.body.errors).toBeUndefined();

  return response.body.data.timelineActivities.edges.map(
    (edge: { node: TimelineActivityNode }) => edge.node,
  );
};

const expectPermissionDenied = (response: request.Response) => {
  expect(response.body.errors?.[0]?.message).toContain(
    PermissionsExceptionMessage.PERMISSION_DENIED,
  );
  expect(response.body.errors?.[0]?.extensions.code).toBe(ErrorCode.FORBIDDEN);
};

describe('Timeline activity field permissions', () => {
  let personId: string;
  let customRoleId: string;
  let originalMemberRoleId: string;

  beforeAll(async () => {
    const rolesResponse = await makeMetadataApiRequest({
      query: gql`
        query {
          getRoles {
            id
            label
          }
        }
      `,
    });

    originalMemberRoleId = rolesResponse.body.data.getRoles.find(
      (role: { label: string }) => role.label === 'Member',
    ).id;

    const { personObjectId, jobTitleFieldId } = await findMetadataIds();

    const { roleId } = await createCustomRoleWithObjectPermissions({
      label: 'TimelineRestrictedJobTitleRole',
      canReadPerson: true,
    });

    customRoleId = roleId;

    const { errors } = await upsertFieldPermissions({
      roleId: customRoleId,
      fieldPermissions: [
        {
          objectMetadataId: personObjectId,
          fieldMetadataId: jobTitleFieldId,
          canReadFieldValue: false,
          canUpdateFieldValue: false,
        },
      ],
    });

    expect(errors).toBeUndefined();

    await updateWorkspaceMemberRole({
      client,
      roleId: customRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    personId = randomUUID();

    await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        data: { id: personId, jobTitle: 'Initial job title' },
      }),
    );

    const updateResponse = await makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId: personId,
        data: {
          jobTitle: RESTRICTED_JOB_TITLE,
          name: { firstName: READABLE_FIRST_NAME, lastName: 'Person' },
        },
      }),
    );

    expect(updateResponse.body.errors).toBeUndefined();

    await waitForAllJobsToFinish();
  });

  afterAll(async () => {
    await updateWorkspaceMemberRole({
      client,
      roleId: originalMemberRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    await deleteRole(client, customRoleId);

    await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId: personId,
      }),
    );
  });

  it('should keep the full diff for a role that can read every field', async () => {
    const timelineActivities = await findPersonTimelineActivities({
      personId,
      asMember: false,
    });

    const serializedActivities = JSON.stringify(timelineActivities);

    expect(serializedActivities).toContain(RESTRICTED_JOB_TITLE);
    expect(serializedActivities).toContain(READABLE_FIRST_NAME);
  });

  it('should omit fields the role cannot read from the diff', async () => {
    const timelineActivities = await findPersonTimelineActivities({
      personId,
      asMember: true,
    });

    const updateActivity = timelineActivities.find((timelineActivity) =>
      JSON.stringify(timelineActivity.properties).includes(READABLE_FIRST_NAME),
    );

    expect(updateActivity?.properties?.diff).toHaveProperty('name');
    expect(updateActivity?.properties?.diff).not.toHaveProperty('jobTitle');
    expect(JSON.stringify(timelineActivities)).not.toContain(
      RESTRICTED_JOB_TITLE,
    );
  });

  it('should omit fields the role cannot read from the REST response', async () => {
    const response = await makeRestApiRequest({
      method: 'get',
      path: `/timelineActivities?filter=targetPersonId[eq]:${personId}`,
      bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.status).toBe(200);

    const serializedBody = JSON.stringify(response.body);

    expect(serializedBody).toContain(READABLE_FIRST_NAME);
    expect(serializedBody).not.toContain(RESTRICTED_JOB_TITLE);
  });

  it('should omit fields the role cannot read from grouped records', async () => {
    const response = await makeGraphqlApiRequestWithMemberRole({
      query: gql`
        query TimelineActivitiesGroupBy(
          $groupBy: [TimelineActivityGroupByInput!]!
          $filter: TimelineActivityFilterInput
        ) {
          timelineActivitiesGroupBy(groupBy: $groupBy, filter: $filter) {
            groupByDimensionValues
            edges {
              node {
                id
                properties
              }
            }
          }
        }
      `,
      variables: {
        groupBy: [{ targetPersonId: true }],
        filter: { targetPersonId: { eq: personId } },
      },
    });

    expect(response.body.errors).toBeUndefined();

    const serializedGroups = JSON.stringify(
      response.body.data.timelineActivitiesGroupBy,
    );

    expect(serializedGroups).toContain(READABLE_FIRST_NAME);
    expect(serializedGroups).not.toContain(RESTRICTED_JOB_TITLE);
  });

  it('should refuse a filter on properties for a role with a field it cannot read', async () => {
    const response = await makeGraphqlApiRequestWithMemberRole(
      findManyOperationFactory({
        objectMetadataSingularName: 'timelineActivity',
        objectMetadataPluralName: 'timelineActivities',
        gqlFields: 'id',
        filter: {
          and: [
            { targetPersonId: { eq: personId } },
            { properties: { like: `%${RESTRICTED_JOB_TITLE}%` } },
          ],
        },
      }),
    );

    expectPermissionDenied(response);
  });

  it('should refuse an order on properties for a role with a field it cannot read', async () => {
    const response = await makeGraphqlApiRequestWithMemberRole(
      findManyOperationFactory({
        objectMetadataSingularName: 'timelineActivity',
        objectMetadataPluralName: 'timelineActivities',
        gqlFields: 'id',
        filter: { targetPersonId: { eq: personId } },
        orderBy: [{ properties: 'AscNullsFirst' }],
      }),
    );

    expectPermissionDenied(response);
  });
});
