import { describeRecordAccess } from 'src/engine/permissions/__tests__/framework/describe-record-access.util';
import {
  agent,
  apiKey,
  application,
  bareRole,
  CUSTOM_APPLICATION,
  EVERY_OPERATION,
  NO_LIMITING_PRINCIPAL,
  NO_OPERATION,
  SAME_APPLICATION_AS_MAIN,
  webhook,
  workspaceMember,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';

describeRecordAccess('a main role', {
  given: {
    mainPrincipal: workspaceMember({ role: 'allRecords' }),
    limitingPrincipal: NO_LIMITING_PRINCIPAL,
    applicationPrincipal: CUSTOM_APPLICATION,
    isSharingEnabled: false,
  },
  cases: [
    { it: 'with all records reaches a public record', grants: EVERY_OPERATION },
    {
      it: 'with no access reaches nothing',
      given: { mainPrincipal: workspaceMember({ role: 'none' }) },
      grants: NO_OPERATION,
    },
    {
      it: 'with row level keeps a matching record',
      given: { mainPrincipal: workspaceMember({ role: 'rowLevel' }) },
      grants: EVERY_OPERATION,
    },
    {
      it: 'with row level drops a record outside its filter',
      given: { mainPrincipal: workspaceMember({ role: 'rowLevel' }) },
      record: { isOutsideMainRoleFilter: true },
      grants: NO_OPERATION,
    },
  ],
});

describeRecordAccess('every kind of main principal holds its role', {
  given: {
    mainPrincipal: apiKey({ role: 'allRecords' }),
    limitingPrincipal: NO_LIMITING_PRINCIPAL,
    applicationPrincipal: CUSTOM_APPLICATION,
    isSharingEnabled: false,
  },
  cases: [
    { it: 'an API key', grants: EVERY_OPERATION },
    {
      it: 'an API key with no access',
      given: { mainPrincipal: apiKey({ role: 'none' }) },
      grants: NO_OPERATION,
    },
    {
      it: 'an application',
      given: {
        mainPrincipal: application({ role: 'allRecords' }),
        applicationPrincipal: SAME_APPLICATION_AS_MAIN,
      },
      grants: EVERY_OPERATION,
    },
    {
      it: 'an agent inside an application',
      given: {
        mainPrincipal: agent({ role: 'allRecords' }),
        applicationPrincipal: application({ role: 'allRecords' }),
      },
      grants: EVERY_OPERATION,
    },
    {
      it: 'a webhook',
      given: { mainPrincipal: webhook({ role: 'allRecords' }) },
      grants: EVERY_OPERATION,
    },
    {
      it: 'a bare role',
      given: { mainPrincipal: bareRole({ role: 'allRecords' }) },
      grants: EVERY_OPERATION,
    },
  ],
});
