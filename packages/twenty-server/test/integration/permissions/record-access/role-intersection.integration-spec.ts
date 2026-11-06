import { createRecordAccessWorkspace } from 'test/integration/permissions/utils/create-record-access-workspace.util';
import {
  describeRecordAccessInWorkspace,
  type ExpectedRecordAccess,
} from 'test/integration/permissions/utils/describe-record-access-in-workspace.util';
import { SETUP_STEP_DURATIONS } from 'test/integration/permissions/utils/measure-setup-step.util';
import { type RecordAccessWorkspace } from 'test/integration/permissions/utils/record-access-workspace.type';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { FeatureFlagKey } from 'twenty-shared/types';

import { type WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import {
  agent,
  apiKey,
  application,
  CUSTOM_APPLICATION,
  NO_LIMITING_PRINCIPAL,
  OAUTH_APPLICATION,
  SAME_APPLICATION_AS_MAIN,
  webhook,
  workspaceMember,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';

const REACHES_EVERY_OPERATION: ExpectedRecordAccess = {
  findRecordsPermissions: {
    canRead: true,
    canUpdate: true,
    canSoftDelete: true,
    canDelete: true,
  },
  canReadRecords: true,
  canUpdateRecords: true,
};

const REACHES_NOTHING: ExpectedRecordAccess = {
  findRecordsPermissions: {
    canRead: false,
    canUpdate: false,
    canSoftDelete: false,
    canDelete: false,
  },
  canReadRecords: false,
  canUpdateRecords: false,
};

let workspace: RecordAccessWorkspace;

const findWorkspace = () => workspace;

const setSharingEnabled = (value: boolean) =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
    value,
    workspaceId: workspace.workspaceId,
    expectToFail: false,
  });

beforeAll(async () => {
  jest.useRealTimers();

  const startedAt = Date.now();

  workspace = await createRecordAccessWorkspace();

  console.log(
    JSON.stringify({
      workspaceMilliseconds: Date.now() - startedAt,
      steps: SETUP_STEP_DURATIONS,
    }),
  );
}, 120000);

afterAll(async () => {
  const startedAt = Date.now();

  await getAppProviderByClassName<WorkspaceService>(
    'WorkspaceService',
  ).deleteWorkspace(workspace.workspaceId);

  console.log(JSON.stringify({ teardownMilliseconds: Date.now() - startedAt }));
}, 120000);

describeRecordAccessInWorkspace({
  name: 'a limiting principal',
  findWorkspace,
  mainPrincipal: workspaceMember({ role: 'allRecords' }),
  limitingPrincipal: agent({ role: 'allRecords' }),
  applicationPrincipal: CUSTOM_APPLICATION,
  cases: [
    {
      it: 'with all records keeps the main role',
      record: 'insideEveryFilter',
      expected: REACHES_EVERY_OPERATION,
    },
    {
      it: 'with no access blocks the main role',
      limitingPrincipal: agent({ role: 'none' }),
      record: 'insideEveryFilter',
      expected: REACHES_NOTHING,
    },
    {
      it: 'with row level narrows the main role',
      limitingPrincipal: agent({ role: 'rowLevel' }),
      record: 'outsideCategoryFilter',
      expected: REACHES_NOTHING,
    },
    {
      it: 'does not widen a row level main role',
      mainPrincipal: workspaceMember({ role: 'rowLevel' }),
      record: 'outsideStatusFilter',
      expected: REACHES_NOTHING,
    },
  ],
});

describeRecordAccessInWorkspace({
  name: 'two row level filters',
  findWorkspace,
  mainPrincipal: workspaceMember({ role: 'rowLevel' }),
  limitingPrincipal: agent({ role: 'rowLevel' }),
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

describeRecordAccessInWorkspace({
  name: 'an application principal',
  findWorkspace,
  mainPrincipal: workspaceMember({ role: 'allRecords' }),
  limitingPrincipal: NO_LIMITING_PRINCIPAL,
  applicationPrincipal: application({ role: 'allRecords' }),
  cases: [
    {
      it: 'with all records keeps the main role',
      record: 'insideEveryFilter',
      expected: REACHES_EVERY_OPERATION,
    },
    {
      it: 'with no access blocks the main role',
      applicationPrincipal: application({ role: 'none' }),
      record: 'insideEveryFilter',
      expected: REACHES_NOTHING,
    },
    {
      it: 'with row level narrows the main role',
      applicationPrincipal: application({ role: 'rowLevel' }),
      record: 'outsideRegionFilter',
      expected: REACHES_NOTHING,
    },
  ],
});

describeRecordAccessInWorkspace({
  name: 'an OAuth application has no role of its own',
  findWorkspace,
  mainPrincipal: workspaceMember({ role: 'allRecords' }),
  limitingPrincipal: NO_LIMITING_PRINCIPAL,
  applicationPrincipal: OAUTH_APPLICATION,
  cases: [
    {
      it: 'so it acts with the member role',
      record: 'insideEveryFilter',
      expected: REACHES_EVERY_OPERATION,
    },
    {
      it: 'so it is held to the member filter',
      mainPrincipal: workspaceMember({ role: 'rowLevel' }),
      record: 'outsideStatusFilter',
      expected: REACHES_NOTHING,
    },
  ],
});

describeRecordAccessInWorkspace({
  name: 'all three principals with a role',
  findWorkspace,
  mainPrincipal: workspaceMember({ role: 'allRecords' }),
  limitingPrincipal: agent({ role: 'allRecords' }),
  applicationPrincipal: application({ role: 'allRecords' }),
  cases: [
    {
      it: 'reach a record when all grant it',
      record: 'insideEveryFilter',
      expected: REACHES_EVERY_OPERATION,
    },
    {
      it: 'are blocked by the limiting principal alone',
      limitingPrincipal: agent({ role: 'none' }),
      record: 'insideEveryFilter',
      expected: REACHES_NOTHING,
    },
    {
      it: 'are blocked by the application principal alone',
      applicationPrincipal: application({ role: 'none' }),
      record: 'insideEveryFilter',
      expected: REACHES_NOTHING,
    },
    {
      it: 'are held to the filter of the application principal',
      applicationPrincipal: application({ role: 'rowLevel' }),
      record: 'outsideRegionFilter',
      expected: REACHES_NOTHING,
    },
  ],
});

describeRecordAccessInWorkspace({
  name: 'every kind of main principal holds its role',
  findWorkspace,
  mainPrincipal: apiKey({ role: 'allRecords' }),
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
      mainPrincipal: apiKey({ role: 'none' }),
      record: 'insideEveryFilter',
      expected: REACHES_NOTHING,
    },
    {
      it: 'an application',
      mainPrincipal: application({ role: 'allRecords' }),
      applicationPrincipal: SAME_APPLICATION_AS_MAIN,
      record: 'insideEveryFilter',
      expected: REACHES_EVERY_OPERATION,
    },
    {
      it: 'an agent inside an application',
      mainPrincipal: agent({ role: 'allRecords' }),
      applicationPrincipal: application({ role: 'allRecords' }),
      record: 'insideEveryFilter',
      expected: REACHES_EVERY_OPERATION,
    },
    {
      it: 'a webhook',
      mainPrincipal: webhook({ role: 'allRecords' }),
      record: 'insideEveryFilter',
      expected: REACHES_EVERY_OPERATION,
    },
  ],
});

describeRecordAccessInWorkspace({
  name: 'a share beyond the role',
  findWorkspace,
  mainPrincipal: workspaceMember({ role: 'none' }),
  limitingPrincipal: NO_LIMITING_PRINCIPAL,
  applicationPrincipal: CUSTOM_APPLICATION,
  cases: [
    {
      it: 'of read lets the member read',
      record: 'sharedReadToNoAccessMember',
      expected: {
        findRecordsPermissions: {
          canRead: true,
          canUpdate: false,
          canSoftDelete: false,
          canDelete: false,
        },
        canReadRecords: true,
        canUpdateRecords: false,
      },
    },
    {
      it: 'of write lets the member read and update',
      record: 'sharedWriteToNoAccessMember',
      expected: {
        findRecordsPermissions: {
          canRead: true,
          canUpdate: true,
          canSoftDelete: false,
          canDelete: false,
        },
        canReadRecords: true,
        canUpdateRecords: true,
      },
    },
    {
      it: 'of full access never deletes',
      record: 'sharedFullToNoAccessMember',
      expected: {
        findRecordsPermissions: {
          canRead: true,
          canUpdate: true,
          canSoftDelete: false,
          canDelete: false,
        },
        canReadRecords: true,
        canUpdateRecords: true,
      },
    },
    {
      it: 'to another member grants nothing',
      record: 'sharedReadToAnotherMember',
      expected: REACHES_NOTHING,
    },
    {
      it: 'to the main role reaches the member',
      record: 'sharedReadToNoAccessRole',
      expected: {
        findRecordsPermissions: {
          canRead: true,
          canUpdate: false,
          canSoftDelete: false,
          canDelete: false,
        },
        canReadRecords: true,
        canUpdateRecords: false,
      },
    },
  ],
});

describeRecordAccessInWorkspace({
  name: 'a share on a private record the role reaches',
  findWorkspace,
  mainPrincipal: workspaceMember({ role: 'allRecords' }),
  limitingPrincipal: NO_LIMITING_PRINCIPAL,
  applicationPrincipal: CUSTOM_APPLICATION,
  cases: [
    {
      it: 'of write does not delete',
      record: 'privateSharedWriteToAllRecordsMember',
      expected: {
        findRecordsPermissions: {
          canRead: true,
          canUpdate: true,
          canSoftDelete: false,
          canDelete: false,
        },
        canReadRecords: true,
        canUpdateRecords: true,
      },
    },
    {
      it: 'of full access reaches every operation',
      record: 'privateSharedFullToAllRecordsMember',
      expected: REACHES_EVERY_OPERATION,
    },
  ],
});

describe('with sharing off', () => {
  beforeAll(() => setSharingEnabled(false));
  afterAll(() => setSharingEnabled(true));

  describeRecordAccessInWorkspace({
    name: 'a member with no access',
    findWorkspace,
    mainPrincipal: workspaceMember({ role: 'none' }),
    limitingPrincipal: NO_LIMITING_PRINCIPAL,
    applicationPrincipal: CUSTOM_APPLICATION,
    cases: [
      {
        it: 'ignores a share on a public record',
        record: 'sharedReadToNoAccessMember',
        expected: REACHES_NOTHING,
      },
    ],
  });
});
