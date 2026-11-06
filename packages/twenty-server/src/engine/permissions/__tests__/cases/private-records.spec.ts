import { describeRecordAccess } from 'src/engine/permissions/__tests__/framework/describe-record-access.util';
import {
  apiKey,
  application,
  CUSTOM_APPLICATION,
  EVERY_OPERATION,
  NO_LIMITING_PRINCIPAL,
  NO_OPERATION,
  SAME_APPLICATION_AS_MAIN,
  workspaceMember,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  MEMBER_ID,
  OTHER_MEMBER_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';

describeRecordAccess({
  name: 'a private record, with a role reaching it',
  given: {
    mainPrincipal: workspaceMember({ role: 'allRecords' }),
    limitingPrincipal: NO_LIMITING_PRINCIPAL,
    applicationPrincipal: CUSTOM_APPLICATION,
    isSharingEnabled: false,
  },
  cases: [
    {
      it: 'is hidden from a role with all records',
      record: { isPrivate: true },
      grants: NO_OPERATION,
    },
    {
      it: 'stays with its creator',
      record: { isPrivate: true, createdBy: MEMBER_ID },
      grants: EVERY_OPERATION,
    },
    {
      it: 'is hidden from someone else than its creator',
      record: { isPrivate: true, createdBy: OTHER_MEMBER_ID },
      grants: NO_OPERATION,
    },
  ],
});

describeRecordAccess({
  name: 'a private record, with no role reaching it',
  given: {
    mainPrincipal: workspaceMember({ role: 'none' }),
    limitingPrincipal: NO_LIMITING_PRINCIPAL,
    applicationPrincipal: CUSTOM_APPLICATION,
    isSharingEnabled: true,
  },
  cases: [
    {
      it: 'gives its creator nothing while sharing is off',
      given: { isSharingEnabled: false },
      record: { isPrivate: true, createdBy: MEMBER_ID },
      grants: NO_OPERATION,
    },
    {
      it: 'lets its creator read and update through sharing, and no more',
      record: { isPrivate: true, createdBy: MEMBER_ID },
      grants: ['select', 'update'],
    },
  ],
});

describeRecordAccess({
  name: 'only a workspace member can be a creator',
  given: {
    mainPrincipal: apiKey({ role: 'allRecords' }),
    limitingPrincipal: NO_LIMITING_PRINCIPAL,
    applicationPrincipal: CUSTOM_APPLICATION,
    isSharingEnabled: true,
  },
  cases: [
    {
      it: 'not an API key',
      record: { isPrivate: true, createdBy: MEMBER_ID },
      grants: NO_OPERATION,
    },
    {
      it: 'not an application',
      given: {
        mainPrincipal: application({ role: 'allRecords' }),
        applicationPrincipal: SAME_APPLICATION_AS_MAIN,
      },
      record: { isPrivate: true, createdBy: MEMBER_ID },
      grants: NO_OPERATION,
    },
  ],
});
