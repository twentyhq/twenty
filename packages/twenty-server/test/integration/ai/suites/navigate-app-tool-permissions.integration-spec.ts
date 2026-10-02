import { randomUUID } from 'node:crypto';

import request from 'supertest';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  type CompanyNameRlsRoleSetup,
  cleanupCompanyNameRlsRole,
  setupCompanyNameRlsRole,
} from 'test/integration/graphql/utils/setup-company-name-rls-role.util';
import {
  type RlsCompanyRelationRecords,
  cleanupRlsCompanyRelationRecords,
  setupRlsCompanyRelationRecords,
} from 'test/integration/graphql/utils/setup-rls-company-relation-records.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

type NavigateAppToolPayload = {
  success: boolean;
  message: string;
  error?: string;
  result?: {
    action: string;
    objectNameSingular?: string;
    recordId?: string;
  };
};

const RECORDS_CREATED_AT = '2019-08-15T10:00:00.000Z';

const navigateToRecord = async ({
  objectNameSingular,
  recordName,
  token,
}: {
  objectNameSingular: string;
  recordName: string;
  token: string;
}): Promise<NavigateAppToolPayload> => {
  const id = `call-${randomUUID()}`;

  const response = await request(`http://localhost:${APP_PORT}`)
    .post('/mcp')
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        id,
        params: {
          name: 'execute_tool',
          arguments: {
            toolName: 'navigate_app',
            arguments: {
              navigation: {
                type: 'navigateToRecord',
                objectNameSingular,
                recordName,
              },
            },
          },
        },
      }),
    )
    .expect(200);

  expect(response.body.error).toBeUndefined();

  const text = response.body.result?.content?.[0]?.text;

  expect(typeof text).toBe('string');

  return JSON.parse(text) as NavigateAppToolPayload;
};

describe('navigate_app tool respects the caller record permissions (integration)', () => {
  let rlsRole: CompanyNameRlsRoleSetup;
  let companies: RlsCompanyRelationRecords;
  const opportunityId = randomUUID();
  const opportunityName = `Navigate App Tool Opportunity ${randomUUID()}`;

  beforeAll(async () => {
    rlsRole = await setupCompanyNameRlsRole({
      label: 'Navigate App Tool RLS Test Role',
      description:
        'Role for testing that navigate_app only finds readable records',
    });

    companies = await setupRlsCompanyRelationRecords({
      companyNamePrefix: `Navigate App Tool ${randomUUID().slice(0, 8)}`,
      createdAt: RECORDS_CREATED_AT,
    });

    await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: 'id name',
        data: { id: opportunityId, name: opportunityName },
      }),
    );

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: 'id nameSingular',
    });

    const opportunityObjectMetadataId = objects?.find(
      (object) => object.nameSingular === 'opportunity',
    )?.id;

    jestExpectToBeDefined(opportunityObjectMetadataId);

    await upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: rlsRole.customRoleId,
        objectPermissions: [
          {
            objectMetadataId: opportunityObjectMetadataId,
            canReadObjectRecords: false,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ],
      },
    });
  });

  afterAll(async () => {
    await deleteRecordsByIds('opportunity', [opportunityId]);
    await cleanupRlsCompanyRelationRecords(companies);
    await cleanupCompanyNameRlsRole(rlsRole);
  });

  it('should find a record hidden by row-level permissions for a caller allowed to read it', async () => {
    const payload = await navigateToRecord({
      objectNameSingular: 'company',
      recordName: companies.hiddenCompanyName,
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(payload.success).toBe(true);
    expect(payload.result?.recordId).toBe(companies.hiddenCompanyId);
  });

  it('should not find a record hidden from the caller by row-level permissions', async () => {
    const payload = await navigateToRecord({
      objectNameSingular: 'company',
      recordName: companies.hiddenCompanyName,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(payload.success).toBe(false);
    expect(payload.result).toBeUndefined();
    expect(JSON.stringify(payload)).not.toContain(companies.hiddenCompanyId);
  });

  it('should find a record the caller can read under the same row-level permissions', async () => {
    const payload = await navigateToRecord({
      objectNameSingular: 'company',
      recordName: companies.visibleCompanyName,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(payload.success).toBe(true);
    expect(payload.result?.recordId).toBe(companies.visibleCompanyId);
  });

  it('should find a record of an object the caller is allowed to read', async () => {
    const payload = await navigateToRecord({
      objectNameSingular: 'opportunity',
      recordName: opportunityName,
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(payload.success).toBe(true);
    expect(payload.result?.recordId).toBe(opportunityId);
  });

  it('should not find any record of an object the caller cannot read', async () => {
    const payload = await navigateToRecord({
      objectNameSingular: 'opportunity',
      recordName: opportunityName,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(payload.success).toBe(false);
    expect(payload.result).toBeUndefined();
    expect(JSON.stringify(payload)).not.toContain(opportunityId);
  });
});
