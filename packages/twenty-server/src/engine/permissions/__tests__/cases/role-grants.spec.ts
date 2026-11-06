import { describeRecordAccess } from 'src/engine/permissions/__tests__/framework/describe-record-access.util';
import {
  agent,
  apiKey,
  application,
  bareRole,
  CUSTOM_APPLICATION,
  NO_LIMITING_PRINCIPAL,
  SAME_APPLICATION_AS_MAIN,
  webhook,
  workspaceMember,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  EVERY_OPERATION,
  NO_OPERATION,
} from 'src/engine/permissions/__tests__/framework/record-operations.constant';

describeRecordAccess({
  name: 'a main role',
  mainPrincipal: workspaceMember({ role: 'allRecords' }),
  limitingPrincipal: NO_LIMITING_PRINCIPAL,
  applicationPrincipal: CUSTOM_APPLICATION,
  cases: [
    { it: 'with all records reaches a public record', grants: EVERY_OPERATION },
    {
      it: 'with no access reaches nothing',
      mainPrincipal: workspaceMember({ role: 'none' }),
      grants: NO_OPERATION,
    },
    {
      it: 'with row level keeps a matching record',
      mainPrincipal: workspaceMember({ role: 'rowLevel' }),
      grants: EVERY_OPERATION,
    },
    {
      it: 'with row level drops a record outside its filter',
      mainPrincipal: workspaceMember({ role: 'rowLevel' }),
      record: { outsideFilterOf: ['mainPrincipal'] },
      grants: NO_OPERATION,
    },
  ],
});

describeRecordAccess({
  name: 'every kind of main principal holds its role',
  mainPrincipal: apiKey({ role: 'allRecords' }),
  limitingPrincipal: NO_LIMITING_PRINCIPAL,
  applicationPrincipal: CUSTOM_APPLICATION,
  cases: [
    { it: 'an API key', grants: EVERY_OPERATION },
    {
      it: 'an API key with no access',
      mainPrincipal: apiKey({ role: 'none' }),
      grants: NO_OPERATION,
    },
    {
      it: 'an application',
      mainPrincipal: application({ role: 'allRecords' }),
      applicationPrincipal: SAME_APPLICATION_AS_MAIN,
      grants: EVERY_OPERATION,
    },
    {
      it: 'an agent inside an application',
      mainPrincipal: agent({ role: 'allRecords' }),
      applicationPrincipal: application({ role: 'allRecords' }),
      grants: EVERY_OPERATION,
    },
    {
      it: 'a webhook',
      mainPrincipal: webhook({ role: 'allRecords' }),
      grants: EVERY_OPERATION,
    },
    {
      it: 'a bare role',
      mainPrincipal: bareRole({ role: 'allRecords' }),
      grants: EVERY_OPERATION,
    },
  ],
});
