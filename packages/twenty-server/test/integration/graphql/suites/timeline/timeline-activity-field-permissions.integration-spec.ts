import { randomUUID } from 'crypto';

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
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

const RESTRICTED_JOB_TITLE = `RESTRICTED-${randomUUID()}`;
const READABLE_FIRST_NAME = `READABLE-${randomUUID()}`;

const buildTimelineActivitiesOperation = ({
  personId,
  filter = {},
}: {
  personId: string;
  filter?: object;
}) =>
  findManyOperationFactory({
    objectMetadataSingularName: 'timelineActivity',
    objectMetadataPluralName: 'timelineActivities',
    gqlFields: 'id properties',
    filter: { and: [{ targetPersonId: { eq: personId } }, filter] },
  });

describe('Timeline activity field permissions', () => {
  let personId: string;
  let customRoleId: string;
  let originalMemberRoleId: string;
  let personObjectId: string;
  let jobTitleFieldId: string;
  let timelineActivitiesFieldId: string;

  beforeAll(async () => {
    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    const { objects } = await findManyObjectMetadata({
      input: { filter: {}, paging: { first: 100 } },
      gqlFields: 'id nameSingular fieldsList { id name }',
      expectToFail: false,
    });
    const personObject = objects.find(
      (object) => object.nameSingular === 'person',
    );
    const jobTitleField = personObject?.fieldsList?.find(
      (field) => field.name === 'jobTitle',
    );
    const timelineActivitiesField = personObject?.fieldsList?.find(
      (field) => field.name === 'timelineActivities',
    );

    assertIsDefinedOrThrow(personObject);
    assertIsDefinedOrThrow(jobTitleField);
    assertIsDefinedOrThrow(timelineActivitiesField);

    personObjectId = personObject.id;
    jobTitleFieldId = jobTitleField.id;
    timelineActivitiesFieldId = timelineActivitiesField.id;

    const { roleId } = await createCustomRoleWithObjectPermissions({
      label: 'TimelineRestrictedJobTitleRole',
      canReadPerson: true,
    });

    customRoleId = roleId;

    await upsertFieldPermissions({
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

    await makeGraphqlApiRequest(
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
    const response = await makeGraphqlApiRequest(
      buildTimelineActivitiesOperation({ personId }),
    );

    expect(JSON.stringify(response.body.data)).toContain(RESTRICTED_JOB_TITLE);
  });

  it('should omit the fields the role cannot read', async () => {
    const response = await makeGraphqlApiRequestWithMemberRole(
      buildTimelineActivitiesOperation({ personId }),
    );

    const serializedData = JSON.stringify(response.body.data);

    expect(serializedData).toContain(READABLE_FIRST_NAME);
    expect(serializedData).not.toContain(RESTRICTED_JOB_TITLE);
  });

  it('should refuse a filter on properties for a role with a field it cannot read', async () => {
    const response = await makeGraphqlApiRequestWithMemberRole(
      buildTimelineActivitiesOperation({
        personId,
        filter: { properties: { like: `%${RESTRICTED_JOB_TITLE}%` } },
      }),
    );

    expect(response.body.errors?.[0]?.message).toContain(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
  });

  // Restricting person.timelineActivities is mirrored onto timelineActivity.targetPerson
  it('should still read properties when the role cannot read the target relation', async () => {
    const adminResponse = await makeGraphqlApiRequest(
      buildTimelineActivitiesOperation({ personId }),
    );
    const activityIds = adminResponse.body.data.timelineActivities.edges.map(
      ({ node }: { node: { id: string } }) => node.id,
    );

    await upsertFieldPermissions({
      roleId: customRoleId,
      fieldPermissions: [
        {
          objectMetadataId: personObjectId,
          fieldMetadataId: jobTitleFieldId,
          canReadFieldValue: false,
          canUpdateFieldValue: false,
        },
        {
          objectMetadataId: personObjectId,
          fieldMetadataId: timelineActivitiesFieldId,
          canReadFieldValue: false,
          canUpdateFieldValue: false,
        },
      ],
    });

    const response = await makeGraphqlApiRequestWithMemberRole(
      findManyOperationFactory({
        objectMetadataSingularName: 'timelineActivity',
        objectMetadataPluralName: 'timelineActivities',
        gqlFields: 'id properties',
        filter: { id: { in: activityIds } },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(JSON.stringify(response.body.data)).not.toContain(
      RESTRICTED_JOB_TITLE,
    );
  });
});
