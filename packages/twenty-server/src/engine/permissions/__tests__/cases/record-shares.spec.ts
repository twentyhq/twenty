import { RecordShareAccessLevel } from 'twenty-shared/types';

import { describeRecordAccess } from 'src/engine/permissions/__tests__/framework/describe-record-access.util';
import {
  apiKey,
  CUSTOM_APPLICATION,
  NO_LIMITING_PRINCIPAL,
  workspaceMember,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  EVERY_OPERATION,
  NO_OPERATION,
} from 'src/engine/permissions/__tests__/framework/record-operations.constant';
import {
  MAIN_ROLE_ID,
  MEMBER_ID,
  OTHER_MEMBER_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';

describeRecordAccess({
  name: 'a share beyond the role',
  mainPrincipal: workspaceMember({ role: 'none' }),
  limitingPrincipal: NO_LIMITING_PRINCIPAL,
  applicationPrincipal: CUSTOM_APPLICATION,
  isSharingEnabled: true,
  cases: [
    {
      it: 'of read lets the member read',
      record: {
        share: {
          principalId: MEMBER_ID,
          accessLevel: RecordShareAccessLevel.READ,
        },
      },
      grants: ['select'],
    },
    {
      it: 'of write lets the member read and update',
      record: {
        share: {
          principalId: MEMBER_ID,
          accessLevel: RecordShareAccessLevel.READ_WRITE,
        },
      },
      grants: ['select', 'update'],
    },
    {
      it: 'of full access never deletes',
      record: {
        share: {
          principalId: MEMBER_ID,
          accessLevel: RecordShareAccessLevel.FULL,
        },
      },
      grants: ['select', 'update'],
    },
    {
      it: 'of no access grants nothing',
      record: {
        share: {
          principalId: MEMBER_ID,
          accessLevel: RecordShareAccessLevel.NONE,
        },
      },
      grants: NO_OPERATION,
    },
    {
      it: 'to another member grants nothing',
      record: {
        share: {
          principalId: OTHER_MEMBER_ID,
          accessLevel: RecordShareAccessLevel.READ,
        },
      },
      grants: NO_OPERATION,
    },
    {
      it: 'to the main role reaches the member',
      record: {
        share: {
          principalId: MAIN_ROLE_ID,
          accessLevel: RecordShareAccessLevel.READ,
        },
      },
      grants: ['select'],
    },
    {
      it: 'to the main role reaches an API key',
      mainPrincipal: apiKey({ role: 'none' }),
      record: {
        share: {
          principalId: MAIN_ROLE_ID,
          accessLevel: RecordShareAccessLevel.READ,
        },
      },
      grants: ['select'],
    },
    {
      it: 'is ignored on a public record while sharing is off',
      isSharingEnabled: false,
      record: {
        share: {
          principalId: MEMBER_ID,
          accessLevel: RecordShareAccessLevel.READ,
        },
      },
      grants: NO_OPERATION,
    },
  ],
});

describeRecordAccess({
  name: 'a share on a private record the role reaches',
  mainPrincipal: workspaceMember({ role: 'allRecords' }),
  limitingPrincipal: NO_LIMITING_PRINCIPAL,
  applicationPrincipal: CUSTOM_APPLICATION,
  isSharingEnabled: true,
  cases: [
    {
      it: 'of read opens it to reading, even with sharing off',
      isSharingEnabled: false,
      record: {
        isPrivate: true,
        share: {
          principalId: MEMBER_ID,
          accessLevel: RecordShareAccessLevel.READ,
        },
      },
      grants: ['select'],
    },
    {
      it: 'of write does not delete',
      record: {
        isPrivate: true,
        share: {
          principalId: MEMBER_ID,
          accessLevel: RecordShareAccessLevel.READ_WRITE,
        },
      },
      grants: ['select', 'update'],
    },
    {
      it: 'of full access reaches every operation',
      record: {
        isPrivate: true,
        share: {
          principalId: MEMBER_ID,
          accessLevel: RecordShareAccessLevel.FULL,
        },
      },
      grants: EVERY_OPERATION,
    },
  ],
});

describeRecordAccess({
  name: 'a share against a row level filter',
  mainPrincipal: workspaceMember({ role: 'rowLevel' }),
  limitingPrincipal: NO_LIMITING_PRINCIPAL,
  applicationPrincipal: CUSTOM_APPLICATION,
  isSharingEnabled: true,
  cases: [
    {
      it: 'passes the filter for what is granted beyond the role',
      record: {
        outsideFilterOf: ['mainPrincipal'],
        share: {
          principalId: MEMBER_ID,
          accessLevel: RecordShareAccessLevel.READ,
        },
      },
      grants: ['select'],
    },
    {
      it: 'stays held to the filter for deletes on a private record',
      record: {
        isPrivate: true,
        outsideFilterOf: ['mainPrincipal'],
        share: {
          principalId: MEMBER_ID,
          accessLevel: RecordShareAccessLevel.FULL,
        },
      },
      grants: ['select', 'update'],
    },
  ],
});

describeRecordAccess({
  name: 'a hypothetical share on a private record',
  mainPrincipal: workspaceMember({ role: 'allRecords' }),
  limitingPrincipal: NO_LIMITING_PRINCIPAL,
  applicationPrincipal: CUSTOM_APPLICATION,
  isSharingEnabled: true,
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
