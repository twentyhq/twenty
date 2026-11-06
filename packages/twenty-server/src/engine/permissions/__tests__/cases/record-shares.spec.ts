import { RecordShareAccessLevel } from 'twenty-shared/types';

import { describeRecordAccess } from 'src/engine/permissions/__tests__/framework/describe-record-access.util';
import {
  apiKey,
  CUSTOM_APPLICATION,
  EVERY_OPERATION,
  NO_LIMITING_PRINCIPAL,
  NO_OPERATION,
  workspaceMember,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  MAIN_ROLE_ID,
  MEMBER_ID,
  OTHER_MEMBER_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import {
  fullAccess,
  noAccess,
  read,
  readWrite,
} from 'src/engine/permissions/__tests__/framework/stored-records.util';

describeRecordAccess({
  name: 'a share beyond the role',
  given: {
    mainPrincipal: workspaceMember({ role: 'none' }),
    limitingPrincipal: NO_LIMITING_PRINCIPAL,
    applicationPrincipal: CUSTOM_APPLICATION,
    isSharingEnabled: true,
  },
  cases: [
    {
      it: 'of read lets the member read',
      record: { share: read(MEMBER_ID) },
      grants: ['select'],
    },
    {
      it: 'of write lets the member read and update',
      record: { share: readWrite(MEMBER_ID) },
      grants: ['select', 'update'],
    },
    {
      it: 'of full access never deletes',
      record: { share: fullAccess(MEMBER_ID) },
      grants: ['select', 'update'],
    },
    {
      it: 'of no access grants nothing',
      record: { share: noAccess(MEMBER_ID) },
      grants: NO_OPERATION,
    },
    {
      it: 'to another member grants nothing',
      record: { share: read(OTHER_MEMBER_ID) },
      grants: NO_OPERATION,
    },
    {
      it: 'to the main role reaches the member',
      record: { share: read(MAIN_ROLE_ID) },
      grants: ['select'],
    },
    {
      it: 'to the main role reaches an API key',
      given: { mainPrincipal: apiKey({ role: 'none' }) },
      record: { share: read(MAIN_ROLE_ID) },
      grants: ['select'],
    },
    {
      it: 'is ignored on a public record while sharing is off',
      given: { isSharingEnabled: false },
      record: { share: read(MEMBER_ID) },
      grants: NO_OPERATION,
    },
  ],
});

describeRecordAccess({
  name: 'a share on a private record the role reaches',
  given: {
    mainPrincipal: workspaceMember({ role: 'allRecords' }),
    limitingPrincipal: NO_LIMITING_PRINCIPAL,
    applicationPrincipal: CUSTOM_APPLICATION,
    isSharingEnabled: true,
  },
  cases: [
    {
      it: 'of read opens it to reading, even with sharing off',
      given: { isSharingEnabled: false },
      record: { isPrivate: true, share: read(MEMBER_ID) },
      grants: ['select'],
    },
    {
      it: 'of write does not delete',
      record: { isPrivate: true, share: readWrite(MEMBER_ID) },
      grants: ['select', 'update'],
    },
    {
      it: 'of full access reaches every operation',
      record: { isPrivate: true, share: fullAccess(MEMBER_ID) },
      grants: EVERY_OPERATION,
    },
  ],
});

describeRecordAccess({
  name: 'a share against a row level filter',
  given: {
    mainPrincipal: workspaceMember({ role: 'rowLevel' }),
    limitingPrincipal: NO_LIMITING_PRINCIPAL,
    applicationPrincipal: CUSTOM_APPLICATION,
    isSharingEnabled: true,
  },
  cases: [
    {
      it: 'passes the filter for what is granted beyond the role',
      record: { isOutsideMainRoleFilter: true, share: read(MEMBER_ID) },
      grants: ['select'],
    },
    {
      it: 'stays held to the filter for deletes on a private record',
      record: {
        isPrivate: true,
        isOutsideMainRoleFilter: true,
        share: fullAccess(MEMBER_ID),
      },
      grants: ['select', 'update'],
    },
  ],
});

describeRecordAccess({
  name: 'a hypothetical share on a private record',
  given: {
    mainPrincipal: workspaceMember({ role: 'allRecords' }),
    limitingPrincipal: NO_LIMITING_PRINCIPAL,
    applicationPrincipal: CUSTOM_APPLICATION,
    isSharingEnabled: true,
  },
  cases: [
    {
      it: 'of read',
      record: { isPrivate: true },
      hypotheticalShareAccessLevel: RecordShareAccessLevel.READ,
      grants: ['select'],
    },
    {
      it: 'of write',
      record: { isPrivate: true },
      hypotheticalShareAccessLevel: RecordShareAccessLevel.READ_WRITE,
      grants: ['select', 'update'],
    },
    {
      it: 'of full access',
      record: { isPrivate: true },
      hypotheticalShareAccessLevel: RecordShareAccessLevel.FULL,
      grants: EVERY_OPERATION,
    },
  ],
});
