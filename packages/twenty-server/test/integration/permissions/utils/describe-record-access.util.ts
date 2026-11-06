import { buildRecordAccessAuthContext } from 'test/integration/permissions/utils/build-record-access-auth-context.util';
import {
  type ExpectedRecordAccess,
  type RecordAccessPrincipals,
  type RecordAccessRecordName,
  type RecordAccessWorkspace,
} from 'test/integration/permissions/utils/record-access-workspace.type';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { type RecordPermissionsService } from 'src/engine/permissions/record-permissions.service';

type RecordAccessCase = Partial<RecordAccessPrincipals> & {
  it: string;
  record: RecordAccessRecordName;
  expected: ExpectedRecordAccess;
};

export const describeRecordAccess = ({
  name,
  findWorkspace,
  cases,
  ...sharedPrincipals
}: RecordAccessPrincipals & {
  name: string;
  findWorkspace: () => RecordAccessWorkspace;
  cases: RecordAccessCase[];
}) =>
  describe(name, () => {
    for (const { it: title, record, expected, ...casePrincipals } of cases) {
      it(title, async () => {
        const workspace = findWorkspace();
        const recordId = workspace.recordIds[record];
        const authContext = await buildRecordAccessAuthContext({
          principals: { ...sharedPrincipals, ...casePrincipals },
          workspace,
        });
        const recordPermissionsService =
          getAppProviderByClassName<RecordPermissionsService>(
            'RecordPermissionsService',
          );
        const recordsQuestion = {
          principals:
            await getAppProviderByClassName<PrincipalPermissionsService>(
              'PrincipalPermissionsService',
            ).buildPermissionsPrincipals({ authContext }),
          objectMetadataId: workspace.objectMetadataId,
          recordIds: [recordId],
        };

        expect({
          findRecordsPermissions: (
            await recordPermissionsService.findRecordsPermissions({
              authContext,
              objectNameSingular: workspace.objectNameSingular,
              recordIds: [recordId],
            })
          ).get(recordId),
          canReadRecords:
            await recordPermissionsService.canReadRecords(recordsQuestion),
          canUpdateRecords:
            await recordPermissionsService.canUpdateRecords(recordsQuestion),
        }).toEqual(expected);
      });
    }
  });
