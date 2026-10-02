import { randomUUID } from 'node:crypto';

import request from 'supertest';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { ViewVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type NavigateAppToolPayload = {
  success: boolean;
  message: string;
  error?: string;
  result?: {
    action: string;
    objectNameSingular?: string;
    recordId?: string;
    viewId?: string;
    viewName?: string;
  };
};

const navigate = async (
  navigation: Record<string, unknown>,
  token: string,
): Promise<NavigateAppToolPayload> => {
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
            arguments: { navigation },
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

describe('navigate_app tool respects the caller permissions (integration)', () => {
  const recordId = randomUUID();
  let restrictedRoleId: string | undefined;
  let originalMemberRoleId: string | undefined;
  let unlistedViewId: string | undefined;
  let workspaceViewId: string | undefined;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: 'id nameSingular',
    });

    const companyObjectMetadataId = objects?.find(
      (object) => object.nameSingular === 'company',
    )?.id;
    const opportunityObjectMetadataId = objects?.find(
      (object) => object.nameSingular === 'opportunity',
    )?.id;

    jestExpectToBeDefined(companyObjectMetadataId);
    jestExpectToBeDefined(opportunityObjectMetadataId);

    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Navigate App Tool Test Role',
        description: 'Role that cannot read opportunities',
        icon: 'IconSettings',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
    });

    restrictedRoleId = roleData?.createOneRole?.id;

    jestExpectToBeDefined(restrictedRoleId);

    await upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: restrictedRoleId,
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

    await updateWorkspaceMemberRole({
      input: {
        roleId: restrictedRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
      expectToFail: false,
    });

    const { data: unlistedViewData } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Navigate App Tool Unlisted View',
        objectMetadataId: companyObjectMetadataId,
        icon: 'IconBuildingSkyscraper',
        visibility: ViewVisibility.UNLISTED,
      },
    });

    unlistedViewId = unlistedViewData?.createView?.id;

    const { data: workspaceViewData } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Navigate App Tool Workspace View',
        objectMetadataId: companyObjectMetadataId,
        icon: 'IconBuildingSkyscraper',
        visibility: ViewVisibility.WORKSPACE,
      },
    });

    workspaceViewId = workspaceViewData?.createView?.id;

    jestExpectToBeDefined(unlistedViewId);
    jestExpectToBeDefined(workspaceViewId);
  });

  afterAll(async () => {
    for (const viewId of [unlistedViewId, workspaceViewId]) {
      if (isDefined(viewId)) {
        await destroyOneView({ viewId, expectToFail: false });
      }
    }

    if (isDefined(originalMemberRoleId)) {
      await updateWorkspaceMemberRole({
        input: {
          roleId: originalMemberRoleId,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        },
        expectToFail: false,
      });
    }

    if (isDefined(restrictedRoleId)) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: restrictedRoleId },
      });
    }
  });

  describe('navigateToRecord', () => {
    it('should return the record route on an object the caller can read', async () => {
      const payload = await navigate(
        { type: 'navigateToRecord', objectNameSingular: 'company', recordId },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(payload.success).toBe(true);
      expect(payload.result).toEqual({
        action: 'navigateToRecord',
        objectNameSingular: 'company',
        recordId,
      });
    });

    it('should return not found on an object the caller cannot read', async () => {
      const payload = await navigate(
        {
          type: 'navigateToRecord',
          objectNameSingular: 'opportunity',
          recordId,
        },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(payload.success).toBe(false);
      expect(payload.result).toBeUndefined();
      expect(payload.error).toBe(
        `No opportunity record with id "${recordId}" was found, or you do not have access to it.`,
      );
    });

    it('should return the record route on that object for a caller who can read it', async () => {
      const payload = await navigate(
        {
          type: 'navigateToRecord',
          objectNameSingular: 'opportunity',
          recordId,
        },
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
      );

      expect(payload.success).toBe(true);
      expect(payload.result?.recordId).toBe(recordId);
    });
  });

  describe('navigateToView', () => {
    it('should return the view route for a workspace view', async () => {
      const payload = await navigate(
        { type: 'navigateToView', viewId: workspaceViewId },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(payload.success).toBe(true);
      expect(payload.result).toEqual({
        action: 'navigateToView',
        viewId: workspaceViewId,
        viewName: 'Navigate App Tool Workspace View',
        objectNameSingular: 'company',
      });
    });

    it("should return not found for another user's unlisted view", async () => {
      const payload = await navigate(
        { type: 'navigateToView', viewId: unlistedViewId },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(payload.success).toBe(false);
      expect(payload.result).toBeUndefined();
      expect(JSON.stringify(payload)).not.toContain(
        'Navigate App Tool Unlisted View',
      );
    });

    it('should return the view route for an unlisted view to its creator', async () => {
      const payload = await navigate(
        { type: 'navigateToView', viewId: unlistedViewId },
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
      );

      expect(payload.success).toBe(true);
      expect(payload.result?.viewId).toBe(unlistedViewId);
    });
  });
});
