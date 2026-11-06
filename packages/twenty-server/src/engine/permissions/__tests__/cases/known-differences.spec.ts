import { describeKnownRecordAccessDifferences } from 'src/engine/permissions/__tests__/framework/describe-record-access.util';
import {
  agent,
  application,
  CUSTOM_APPLICATION,
  NO_LIMITING_PRINCIPAL,
  NO_OPERATION,
  workspaceMember,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  APPLICATION_ROLE_ID,
  LIMITING_ROLE_ID,
  MEMBER_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import {
  EVERYONE,
  read,
} from 'src/engine/permissions/__tests__/framework/stored-records.util';

describeKnownRecordAccessDifferences({
  name: 'an everyone share',
  given: {
    mainPrincipal: workspaceMember({ role: 'none' }),
    limitingPrincipal: NO_LIMITING_PRINCIPAL,
    applicationPrincipal: CUSTOM_APPLICATION,
    isSharingEnabled: true,
  },
  cases: [
    {
      it: 'should grant what it shares',
      record: { share: read(EVERYONE) },
      grants: ['select'],
    },
  ],
});

describeKnownRecordAccessDifferences({
  name: 'a limiting role with no access',
  given: {
    mainPrincipal: workspaceMember({ role: 'none' }),
    limitingPrincipal: agent({ role: 'none' }),
    applicationPrincipal: CUSTOM_APPLICATION,
    isSharingEnabled: true,
  },
  cases: [
    {
      it: 'should stop a share to the member',
      record: { share: read(MEMBER_ID) },
      grants: NO_OPERATION,
    },
    {
      it: 'should stop the creator',
      record: { isPrivate: true, createdBy: MEMBER_ID },
      grants: NO_OPERATION,
    },
    {
      it: 'as an application role, should stop a share to the member',
      given: {
        limitingPrincipal: NO_LIMITING_PRINCIPAL,
        applicationPrincipal: application({ role: 'none' }),
      },
      record: { share: read(MEMBER_ID) },
      grants: NO_OPERATION,
    },
  ],
});

describeKnownRecordAccessDifferences({
  name: 'a share to an intersecting role',
  given: {
    mainPrincipal: workspaceMember({ role: 'allRecords' }),
    limitingPrincipal: agent({ role: 'allRecords' }),
    applicationPrincipal: application({ role: 'allRecords' }),
    isSharingEnabled: true,
  },
  cases: [
    {
      it: 'should not reach the caller through the limiting role',
      record: { isPrivate: true, share: read(LIMITING_ROLE_ID) },
      grants: NO_OPERATION,
    },
    {
      it: 'should not reach the caller through the application role',
      record: { isPrivate: true, share: read(APPLICATION_ROLE_ID) },
      grants: NO_OPERATION,
    },
  ],
});
