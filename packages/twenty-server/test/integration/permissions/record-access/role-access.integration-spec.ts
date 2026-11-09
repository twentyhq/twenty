import { describePermissionTestWorkspace } from 'test/integration/permissions/utils/describe-permission-test-workspace.util';
import {
  type PermissionTestExpectedAnswers,
  type PermissionTestPrincipals,
} from 'test/integration/permissions/utils/permission-test-workspace.type';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { type RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { type RecordPermissionsOnlyRoleReadService } from 'src/engine/permissions/record-permissions-only-role-read.service';

const REACHES_EVERY_OPERATION: PermissionTestExpectedAnswers = {
  findRecordsActions: {
    canRead: true,
    canUpdate: true,
    canSoftDelete: true,
    canDelete: true,
  },
  canReadRecords: true,
  canUpdateRecords: true,
};

const REACHES_NOTHING: PermissionTestExpectedAnswers = {
  findRecordsActions: {
    canRead: false,
    canUpdate: false,
    canSoftDelete: false,
    canDelete: false,
  },
  canReadRecords: false,
  canUpdateRecords: false,
};

const NO_LIMITING_PRINCIPAL: PermissionTestPrincipals['limitingPrincipal'] = {
  type: 'none',
};
const CUSTOM_APPLICATION: PermissionTestPrincipals['applicationPrincipal'] = {
  type: 'customApplication',
};

describePermissionTestWorkspace({
  name: 'record access by role',
  defineTests: ({ findWorkspace, describeRecordAccess }) => {
    describeRecordAccess({
      name: 'a main role',
      mainPrincipal: { type: 'workspaceMember', role: 'allRecords' },
      limitingPrincipal: NO_LIMITING_PRINCIPAL,
      applicationPrincipal: CUSTOM_APPLICATION,
      cases: [
        {
          it: 'with all records reaches a record',
          record: 'insideEveryFilter',
          expected: REACHES_EVERY_OPERATION,
        },
        {
          it: 'with no access reaches nothing',
          mainPrincipal: { type: 'workspaceMember', role: 'none' },
          record: 'insideEveryFilter',
          expected: REACHES_NOTHING,
        },
        {
          it: 'with row level keeps a matching record',
          mainPrincipal: { type: 'workspaceMember', role: 'rowLevel' },
          record: 'insideEveryFilter',
          expected: REACHES_EVERY_OPERATION,
        },
        {
          it: 'with row level drops a record outside its filter',
          mainPrincipal: { type: 'workspaceMember', role: 'rowLevel' },
          record: 'outsideStatusFilter',
          expected: REACHES_NOTHING,
        },
      ],
    });

    describeRecordAccess({
      name: 'a limiting principal',
      mainPrincipal: { type: 'workspaceMember', role: 'allRecords' },
      limitingPrincipal: { type: 'agent', role: 'allRecords' },
      applicationPrincipal: CUSTOM_APPLICATION,
      cases: [
        {
          it: 'that lost its role blocks the main role',
          limitingPrincipal: { type: 'agentWithoutRole' },
          record: 'insideEveryFilter',
          expected: REACHES_NOTHING,
        },
        {
          it: 'with all records keeps the main role',
          record: 'insideEveryFilter',
          expected: REACHES_EVERY_OPERATION,
        },
        {
          it: 'with no access blocks the main role',
          limitingPrincipal: { type: 'agent', role: 'none' },
          record: 'insideEveryFilter',
          expected: REACHES_NOTHING,
        },
        {
          it: 'with row level narrows the main role',
          limitingPrincipal: { type: 'agent', role: 'rowLevel' },
          record: 'outsideCategoryFilter',
          expected: REACHES_NOTHING,
        },
        {
          it: 'does not widen a row level main role',
          mainPrincipal: { type: 'workspaceMember', role: 'rowLevel' },
          record: 'outsideStatusFilter',
          expected: REACHES_NOTHING,
        },
      ],
    });

    describeRecordAccess({
      name: 'two row level filters',
      mainPrincipal: { type: 'workspaceMember', role: 'rowLevel' },
      limitingPrincipal: { type: 'agent', role: 'rowLevel' },
      applicationPrincipal: CUSTOM_APPLICATION,
      cases: [
        {
          it: 'reach a record matching both',
          record: 'insideEveryFilter',
          expected: REACHES_EVERY_OPERATION,
        },
        {
          it: 'drop a record outside the main filter',
          record: 'outsideStatusFilter',
          expected: REACHES_NOTHING,
        },
        {
          it: 'drop a record outside the limiting filter',
          record: 'outsideCategoryFilter',
          expected: REACHES_NOTHING,
        },
      ],
    });

    describeRecordAccess({
      name: 'an application principal',
      mainPrincipal: { type: 'workspaceMember', role: 'allRecords' },
      limitingPrincipal: NO_LIMITING_PRINCIPAL,
      applicationPrincipal: { type: 'application', role: 'allRecords' },
      cases: [
        {
          it: 'with all records keeps the main role',
          record: 'insideEveryFilter',
          expected: REACHES_EVERY_OPERATION,
        },
        {
          it: 'with no access blocks the main role',
          applicationPrincipal: { type: 'application', role: 'none' },
          record: 'insideEveryFilter',
          expected: REACHES_NOTHING,
        },
        {
          it: 'with row level narrows the main role',
          applicationPrincipal: { type: 'application', role: 'rowLevel' },
          record: 'outsideRegionFilter',
          expected: REACHES_NOTHING,
        },
      ],
    });

    describeRecordAccess({
      name: 'an OAuth application has no role of its own',
      mainPrincipal: { type: 'workspaceMember', role: 'allRecords' },
      limitingPrincipal: NO_LIMITING_PRINCIPAL,
      applicationPrincipal: { type: 'oauthApplication' },
      cases: [
        {
          it: 'so it acts with the member role',
          record: 'insideEveryFilter',
          expected: REACHES_EVERY_OPERATION,
        },
        {
          it: 'so it lends nothing to an API key',
          mainPrincipal: { type: 'apiKey', role: 'allRecords' },
          record: 'insideEveryFilter',
          expected: REACHES_NOTHING,
        },
        {
          it: 'so it is held to the member filter',
          mainPrincipal: { type: 'workspaceMember', role: 'rowLevel' },
          record: 'outsideStatusFilter',
          expected: REACHES_NOTHING,
        },
      ],
    });

    describeRecordAccess({
      name: 'all three principals with a role',
      mainPrincipal: { type: 'workspaceMember', role: 'allRecords' },
      limitingPrincipal: { type: 'agent', role: 'allRecords' },
      applicationPrincipal: { type: 'application', role: 'allRecords' },
      cases: [
        {
          it: 'reach a record when all grant it',
          record: 'insideEveryFilter',
          expected: REACHES_EVERY_OPERATION,
        },
        {
          it: 'are blocked by the limiting principal alone',
          limitingPrincipal: { type: 'agent', role: 'none' },
          record: 'insideEveryFilter',
          expected: REACHES_NOTHING,
        },
        {
          it: 'are blocked by the application principal alone',
          applicationPrincipal: { type: 'application', role: 'none' },
          record: 'insideEveryFilter',
          expected: REACHES_NOTHING,
        },
        {
          it: 'are held to the filter of the application principal',
          applicationPrincipal: { type: 'application', role: 'rowLevel' },
          record: 'outsideRegionFilter',
          expected: REACHES_NOTHING,
        },
      ],
    });

    describeRecordAccess({
      name: 'every kind of main principal holds its role',
      mainPrincipal: { type: 'apiKey', role: 'allRecords' },
      limitingPrincipal: NO_LIMITING_PRINCIPAL,
      applicationPrincipal: CUSTOM_APPLICATION,
      cases: [
        {
          it: 'an API key',
          record: 'insideEveryFilter',
          expected: REACHES_EVERY_OPERATION,
        },
        {
          it: 'an API key with no access',
          mainPrincipal: { type: 'apiKey', role: 'none' },
          record: 'insideEveryFilter',
          expected: REACHES_NOTHING,
        },
        {
          it: 'an application',
          mainPrincipal: { type: 'application', role: 'allRecords' },
          applicationPrincipal: { type: 'sameApplicationAsMain' },
          record: 'insideEveryFilter',
          expected: REACHES_EVERY_OPERATION,
        },
        {
          it: 'an agent inside an application',
          mainPrincipal: { type: 'agent', role: 'allRecords' },
          applicationPrincipal: { type: 'application', role: 'allRecords' },
          record: 'insideEveryFilter',
          expected: REACHES_EVERY_OPERATION,
        },
      ],
    });

    describe('a webhook', () => {
      it('holds its role', async () => {
        const { workspaceId, webhookId, objectMetadataId, recordIds } =
          findWorkspace();
        const recordsQuestion = {
          principals:
            await getAppProviderByClassName<PrincipalPermissionsReadService>(
              'PrincipalPermissionsReadService',
            ).resolvePermissionsPrincipals({
              authContext: {
                type: 'webhook',
                workspace: { id: workspaceId },
                webhook: { id: webhookId },
              },
            }),
          objectMetadataId,
          recordIds: [recordIds.insideEveryFilter],
        };
        const recordPermissionsReadService =
          getAppProviderByClassName<RecordPermissionsReadService>(
            'RecordPermissionsReadService',
          );

        expect(
          await recordPermissionsReadService.canAccessKnownRecords({
            ...recordsQuestion,
            operationType: 'read',
          }),
        ).toBe(true);
        expect(
          await recordPermissionsReadService.canAccessKnownRecords({
            ...recordsQuestion,
            operationType: 'update',
          }),
        ).toBe(true);
      });
    });

    describe('a bare role', () => {
      it('answers from the role alone', async () => {
        const { workspaceId, roleIds, objectMetadataId } = findWorkspace();

        const roleIdsUnableToRead =
          await getAppProviderByClassName<RecordPermissionsOnlyRoleReadService>(
            'RecordPermissionsOnlyRoleReadService',
          ).filterRoleIdsWithoutReadAccess({
            workspaceId,
            roleIds: [roleIds.none, roleIds.rowLevel, roleIds.allRecords],
            objectMetadataId,
          });

        expect([...roleIdsUnableToRead]).toEqual([roleIds.none]);
      });
    });
  },
});
