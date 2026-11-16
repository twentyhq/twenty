import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { addPermissionTestWorkspaceMember } from 'test/integration/permissions/utils/add-permission-test-workspace-member.util';
import { createPermissionTestActiveWorkspace } from 'test/integration/permissions/utils/create-permission-test-active-workspace.util';
import { createPermissionTestObject } from 'test/integration/permissions/utils/create-permission-test-object.util';
import { createPermissionTestRole } from 'test/integration/permissions/utils/create-permission-test-role.util';
import { parse } from 'graphql';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey, RecordShareAccessLevel } from 'twenty-shared/types';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const OBJECT_NAME_SINGULAR = 'permissionTableRecord';
const SET_RECORD_SHARE = parse(
  `mutation SetRecordShare($target: RecordTargetInput!, $principal: RecordSharePrincipalInput!, $accessLevel: RecordShareAccessLevel!) { setRecordShare(target: $target, principal: $principal, accessLevel: $accessLevel) { canManageSharing } }`,
);

describe('permission tables', () => {
  it('should store record shares in a workspace created without the record share and access group objects', async () => {
    const { workspaceId, workspaceOrigin, inviteHash, adminAccessToken } =
      await createPermissionTestActiveWorkspace({
        featureFlagsEnabledBeforeActivation: [
          FeatureFlagKey.IS_PERMISSION_TABLES_ENABLED,
        ],
      });

    const permissionStorageObjects = await global.testDataSource.query(
      `SELECT "id" FROM core."objectMetadata"
       WHERE "workspaceId" = $1 AND "universalIdentifier" = ANY($2)`,
      [
        workspaceId,
        [
          STANDARD_OBJECTS.recordShare.universalIdentifier,
          STANDARD_OBJECTS.accessGroup.universalIdentifier,
        ],
      ],
    );

    expect(permissionStorageObjects).toEqual([]);

    const { objectMetadataId, fields } = await createPermissionTestObject({
      nameSingular: OBJECT_NAME_SINGULAR,
      namePlural: `${OBJECT_NAME_SINGULAR}s`,
      accessToken: adminAccessToken,
    });
    const roleId = await createPermissionTestRole({
      label: 'No access',
      grant: 'none',
      rowLevelFilter: { fieldMetadataId: fields.status.id, value: 'active' },
      objectMetadataId,
      accessToken: adminAccessToken,
    });
    const workspaceMemberId = await addPermissionTestWorkspaceMember({
      workspaceId,
      workspaceOrigin,
      inviteHash,
      roleId,
      adminAccessToken,
    });

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value: true,
      workspaceId,
      expectToFail: false,
    });

    const createResponse = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: OBJECT_NAME_SINGULAR,
        gqlFields: 'id',
        data: { status: 'active', category: 'core', region: 'europe' },
      }),
      adminAccessToken,
    );

    expect(createResponse.body.errors).toBeUndefined();

    const recordId: string =
      createResponse.body.data.createPermissionTableRecord.id;
    const shareResponse = await makeMetadataApiRequest(
      {
        query: SET_RECORD_SHARE,
        variables: {
          target: { objectMetadataId, recordId },
          principal: { workspaceMemberId },
          accessLevel: RecordShareAccessLevel.READ,
        },
      },
      adminAccessToken,
    );

    expect(shareResponse.body.errors).toBeUndefined();

    const recordShares = await global.testDataSource.query(
      `SELECT "recordId", "accessLevel" FROM "${getWorkspaceSchemaName(workspaceId)}"."recordShare"
       WHERE "principalId" = $1`,
      [workspaceMemberId],
    );

    expect(recordShares).toEqual([
      { recordId, accessLevel: RecordShareAccessLevel.READ },
    ]);
  });
});
