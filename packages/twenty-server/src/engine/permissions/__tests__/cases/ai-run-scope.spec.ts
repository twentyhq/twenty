import { describeRecordAccess } from 'src/engine/permissions/__tests__/framework/describe-record-access.util';
import {
  CUSTOM_APPLICATION,
  EVERY_OPERATION,
  NO_LIMITING_PRINCIPAL,
  NO_OPERATION,
  workspaceMember,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import { MEMBER_ID } from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { read } from 'src/engine/permissions/__tests__/framework/stored-records.util';

describeRecordAccess({
  name: 'an AI run scope',
  given: {
    mainPrincipal: workspaceMember({ role: 'allRecords' }),
    limitingPrincipal: NO_LIMITING_PRINCIPAL,
    applicationPrincipal: CUSTOM_APPLICATION,
    isSharingEnabled: true,
    aiRunScope: 'allRecords',
  },
  cases: [
    {
      it: 'keeps what both the role and the scope grant',
      grants: EVERY_OPERATION,
    },
    {
      it: 'takes away what the role grants when it grants nothing',
      given: { aiRunScope: 'none' },
      grants: NO_OPERATION,
    },
    {
      it: 'never reaches beyond the role through a share',
      given: { mainPrincipal: workspaceMember({ role: 'none' }) },
      record: { share: read(MEMBER_ID) },
      grants: NO_OPERATION,
    },
    {
      it: 'never reaches beyond the role for a creator',
      given: { mainPrincipal: workspaceMember({ role: 'none' }) },
      record: { isPrivate: true, createdBy: MEMBER_ID },
      grants: NO_OPERATION,
    },
  ],
});
