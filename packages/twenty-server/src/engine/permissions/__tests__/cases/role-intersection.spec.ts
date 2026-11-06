import { describeRecordAccess } from 'src/engine/permissions/__tests__/framework/describe-record-access.util';
import {
  agent,
  application,
  CUSTOM_APPLICATION,
  EVERY_OPERATION,
  NO_LIMITING_PRINCIPAL,
  NO_OPERATION,
  OAUTH_APPLICATION,
  workspaceMember,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';

describeRecordAccess({
  name: 'a limiting principal',
  given: {
    mainPrincipal: workspaceMember({ role: 'allRecords' }),
    limitingPrincipal: agent({ role: 'allRecords' }),
    applicationPrincipal: CUSTOM_APPLICATION,
    isSharingEnabled: false,
  },
  cases: [
    { it: 'with all records keeps the main role', grants: EVERY_OPERATION },
    {
      it: 'with no access blocks the main role',
      given: { limitingPrincipal: agent({ role: 'none' }) },
      grants: NO_OPERATION,
    },
    {
      it: 'with row level narrows the main role',
      given: { limitingPrincipal: agent({ role: 'rowLevel' }) },
      record: { isOutsideLimitingRoleFilter: true },
      grants: NO_OPERATION,
    },
    {
      it: 'does not widen a row level main role',
      given: { mainPrincipal: workspaceMember({ role: 'rowLevel' }) },
      record: { isOutsideMainRoleFilter: true },
      grants: NO_OPERATION,
    },
  ],
});

describeRecordAccess({
  name: 'two row level filters',
  given: {
    mainPrincipal: workspaceMember({ role: 'rowLevel' }),
    limitingPrincipal: agent({ role: 'rowLevel' }),
    applicationPrincipal: CUSTOM_APPLICATION,
    isSharingEnabled: false,
  },
  cases: [
    { it: 'reach a record matching both', grants: EVERY_OPERATION },
    {
      it: 'drop a record outside the main filter',
      record: { isOutsideMainRoleFilter: true },
      grants: NO_OPERATION,
    },
    {
      it: 'drop a record outside the limiting filter',
      record: { isOutsideLimitingRoleFilter: true },
      grants: NO_OPERATION,
    },
  ],
});

describeRecordAccess({
  name: 'an application principal',
  given: {
    mainPrincipal: workspaceMember({ role: 'allRecords' }),
    limitingPrincipal: NO_LIMITING_PRINCIPAL,
    applicationPrincipal: application({ role: 'allRecords' }),
    isSharingEnabled: false,
  },
  cases: [
    { it: 'with all records keeps the main role', grants: EVERY_OPERATION },
    {
      it: 'with no access blocks the main role',
      given: { applicationPrincipal: application({ role: 'none' }) },
      grants: NO_OPERATION,
    },
    {
      it: 'with row level narrows the main role',
      given: { applicationPrincipal: application({ role: 'rowLevel' }) },
      record: { isOutsideApplicationRoleFilter: true },
      grants: NO_OPERATION,
    },
  ],
});

describeRecordAccess({
  name: 'an OAuth application has no role of its own',
  given: {
    mainPrincipal: workspaceMember({ role: 'allRecords' }),
    limitingPrincipal: NO_LIMITING_PRINCIPAL,
    applicationPrincipal: OAUTH_APPLICATION,
    isSharingEnabled: false,
  },
  cases: [
    { it: 'so it acts with the member role', grants: EVERY_OPERATION },
    {
      it: 'so it is held to the member filter',
      given: { mainPrincipal: workspaceMember({ role: 'rowLevel' }) },
      record: { isOutsideMainRoleFilter: true },
      grants: NO_OPERATION,
    },
  ],
});

describeRecordAccess({
  name: 'all three principals with a role',
  given: {
    mainPrincipal: workspaceMember({ role: 'allRecords' }),
    limitingPrincipal: agent({ role: 'allRecords' }),
    applicationPrincipal: application({ role: 'allRecords' }),
    isSharingEnabled: false,
  },
  cases: [
    { it: 'reach a record when all grant it', grants: EVERY_OPERATION },
    {
      it: 'are blocked by the limiting principal alone',
      given: { limitingPrincipal: agent({ role: 'none' }) },
      grants: NO_OPERATION,
    },
    {
      it: 'are blocked by the application principal alone',
      given: { applicationPrincipal: application({ role: 'none' }) },
      grants: NO_OPERATION,
    },
    {
      it: 'are held to the filter of the application principal',
      given: { applicationPrincipal: application({ role: 'rowLevel' }) },
      record: { isOutsideApplicationRoleFilter: true },
      grants: NO_OPERATION,
    },
  ],
});
