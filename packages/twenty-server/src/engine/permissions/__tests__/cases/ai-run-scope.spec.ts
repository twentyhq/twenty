import { RecordShareAccessLevel } from 'twenty-shared/types';

import { describeRecordAccess } from 'src/engine/permissions/__tests__/framework/describe-record-access.util';
import {
  CUSTOM_APPLICATION,
  NO_LIMITING_PRINCIPAL,
  workspaceMember,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  EVERY_OPERATION,
  NO_OPERATION,
} from 'src/engine/permissions/__tests__/framework/record-operations.constant';
import { MEMBER_ID } from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';

describeRecordAccess({
  name: 'an AI run scope',
  mainPrincipal: workspaceMember({ role: 'allRecords' }),
  limitingPrincipal: NO_LIMITING_PRINCIPAL,
  applicationPrincipal: CUSTOM_APPLICATION,
  isSharingEnabled: true,
  aiRunScope: 'allRecords',
  cases: [
    {
      it: 'keeps what both the role and the scope grant',
      grants: EVERY_OPERATION,
    },
    {
      it: 'takes away what the role grants when it grants nothing',
      aiRunScope: 'none',
      grants: NO_OPERATION,
    },
    {
      it: 'never reaches beyond the role through a share',
      mainPrincipal: workspaceMember({ role: 'none' }),
      record: {
        share: {
          principalId: MEMBER_ID,
          accessLevel: RecordShareAccessLevel.READ,
        },
      },
      grants: NO_OPERATION,
    },
    {
      it: 'never reaches beyond the role for a creator',
      mainPrincipal: workspaceMember({ role: 'none' }),
      record: { isPrivate: true, createdBy: MEMBER_ID },
      grants: NO_OPERATION,
    },
  ],
});
