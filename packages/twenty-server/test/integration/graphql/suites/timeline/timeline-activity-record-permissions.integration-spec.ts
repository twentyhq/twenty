import { randomUUID } from 'crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  type CompanyNameRlsRoleSetup,
  VISIBLE_COMPANY_NAME_TOKEN,
  cleanupCompanyNameRlsRole,
  setupCompanyNameRlsRole,
} from 'test/integration/graphql/utils/setup-company-name-rls-role.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const VISIBLE_TAGLINE = `VISIBLE-TAGLINE-${randomUUID()}`;
const HIDDEN_TAGLINE = `HIDDEN-TAGLINE-${randomUUID()}`;

const buildTimelineActivitiesOperation = (companyIds: string[]) =>
  findManyOperationFactory({
    objectMetadataSingularName: 'timelineActivity',
    objectMetadataPluralName: 'timelineActivities',
    gqlFields: 'id properties',
    filter: { targetCompanyId: { in: companyIds } },
  });

describe('Timeline activity record permissions', () => {
  let rlsRole: CompanyNameRlsRoleSetup;
  const visibleCompanyId = randomUUID();
  const hiddenCompanyId = randomUUID();

  beforeAll(async () => {
    rlsRole = await setupCompanyNameRlsRole({
      label: 'Timeline Activity Record Permissions Role',
      description: 'Reads companies whose name contains the visible token',
    });

    for (const { id, name, tagline } of [
      {
        id: visibleCompanyId,
        name: `${VISIBLE_COMPANY_NAME_TOKEN} ${randomUUID()}`,
        tagline: VISIBLE_TAGLINE,
      },
      {
        id: hiddenCompanyId,
        name: `Hidden ${randomUUID()}`,
        tagline: HIDDEN_TAGLINE,
      },
    ]) {
      await makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: 'id',
          data: { id, name },
        }),
      );

      await makeGraphqlApiRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: 'id',
          recordId: id,
          data: { tagline },
        }),
      );
    }

    await waitForAllJobsToFinish();
  });

  afterAll(async () => {
    await cleanupCompanyNameRlsRole(rlsRole);

    for (const recordId of [visibleCompanyId, hiddenCompanyId]) {
      await makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: 'id',
          recordId,
        }),
      );
    }
  });

  it('should keep the diff of both companies for a role that reads every company', async () => {
    const serializedData = JSON.stringify(
      (
        await makeGraphqlApiRequest(
          buildTimelineActivitiesOperation([visibleCompanyId, hiddenCompanyId]),
        )
      ).body.data,
    );

    expect(serializedData).toContain(VISIBLE_TAGLINE);
    expect(serializedData).toContain(HIDDEN_TAGLINE);
  });

  it('should omit the diff of a company hidden by a row-level rule', async () => {
    const response = await makeGraphqlApiRequest(
      buildTimelineActivitiesOperation([visibleCompanyId, hiddenCompanyId]),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    const serializedData = JSON.stringify(response.body.data);

    expect(response.body.errors).toBeUndefined();
    expect(serializedData).toContain(VISIBLE_TAGLINE);
    expect(serializedData).not.toContain(HIDDEN_TAGLINE);
  });
});
