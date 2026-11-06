import { describeRecordAccess } from 'src/engine/permissions/__tests__/framework/describe-record-access.util';
import {
  agent,
  application,
  CUSTOM_APPLICATION,
  NO_LIMITING_PRINCIPAL,
  OAUTH_APPLICATION,
  workspaceMember,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  EVERY_OPERATION,
  NO_OPERATION,
} from 'src/engine/permissions/__tests__/framework/record-operations.constant';

describeRecordAccess({
  name: 'a limiting principal',
  mainPrincipal: workspaceMember({ role: 'allRecords' }),
  limitingPrincipal: agent({ role: 'allRecords' }),
  applicationPrincipal: CUSTOM_APPLICATION,
  cases: [
    { it: 'with all records keeps the main role', grants: EVERY_OPERATION },
    {
      it: 'with no access blocks the main role',
      limitingPrincipal: agent({ role: 'none' }),
      grants: NO_OPERATION,
    },
    {
      it: 'with row level narrows the main role',
      limitingPrincipal: agent({ role: 'rowLevel' }),
      record: { outsideFilterOf: ['limitingPrincipal'] },
      grants: NO_OPERATION,
    },
    {
      it: 'does not widen a row level main role',
      mainPrincipal: workspaceMember({ role: 'rowLevel' }),
      record: { outsideFilterOf: ['mainPrincipal'] },
      grants: NO_OPERATION,
    },
  ],
});

describeRecordAccess({
  name: 'two row level filters',
  mainPrincipal: workspaceMember({ role: 'rowLevel' }),
  limitingPrincipal: agent({ role: 'rowLevel' }),
  applicationPrincipal: CUSTOM_APPLICATION,
  cases: [
    { it: 'reach a record matching both', grants: EVERY_OPERATION },
    {
      it: 'drop a record outside the main filter',
      record: { outsideFilterOf: ['mainPrincipal'] },
      grants: NO_OPERATION,
    },
    {
      it: 'drop a record outside the limiting filter',
      record: { outsideFilterOf: ['limitingPrincipal'] },
      grants: NO_OPERATION,
    },
  ],
});

describeRecordAccess({
  name: 'an application principal',
  mainPrincipal: workspaceMember({ role: 'allRecords' }),
  limitingPrincipal: NO_LIMITING_PRINCIPAL,
  applicationPrincipal: application({ role: 'allRecords' }),
  cases: [
    { it: 'with all records keeps the main role', grants: EVERY_OPERATION },
    {
      it: 'with no access blocks the main role',
      applicationPrincipal: application({ role: 'none' }),
      grants: NO_OPERATION,
    },
    {
      it: 'with row level narrows the main role',
      applicationPrincipal: application({ role: 'rowLevel' }),
      record: { outsideFilterOf: ['applicationPrincipal'] },
      grants: NO_OPERATION,
    },
  ],
});

describeRecordAccess({
  name: 'an OAuth application has no role of its own',
  mainPrincipal: workspaceMember({ role: 'allRecords' }),
  limitingPrincipal: NO_LIMITING_PRINCIPAL,
  applicationPrincipal: OAUTH_APPLICATION,
  cases: [
    { it: 'so it acts with the member role', grants: EVERY_OPERATION },
    {
      it: 'so it is held to the member filter',
      mainPrincipal: workspaceMember({ role: 'rowLevel' }),
      record: { outsideFilterOf: ['mainPrincipal'] },
      grants: NO_OPERATION,
    },
  ],
});

describeRecordAccess({
  name: 'all three principals with a role',
  mainPrincipal: workspaceMember({ role: 'allRecords' }),
  limitingPrincipal: agent({ role: 'allRecords' }),
  applicationPrincipal: application({ role: 'allRecords' }),
  cases: [
    { it: 'reach a record when all grant it', grants: EVERY_OPERATION },
    {
      it: 'are blocked by the limiting principal alone',
      limitingPrincipal: agent({ role: 'none' }),
      grants: NO_OPERATION,
    },
    {
      it: 'are blocked by the application principal alone',
      applicationPrincipal: application({ role: 'none' }),
      grants: NO_OPERATION,
    },
    {
      it: 'are held to the filter of the application principal',
      applicationPrincipal: application({ role: 'rowLevel' }),
      record: { outsideFilterOf: ['applicationPrincipal'] },
      grants: NO_OPERATION,
    },
  ],
});
