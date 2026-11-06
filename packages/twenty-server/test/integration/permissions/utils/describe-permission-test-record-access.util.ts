import { buildPermissionTestAuthContext } from 'test/integration/permissions/utils/build-permission-test-auth-context.util';
import {
  type PermissionTestExpectedAnswers,
  type PermissionTestPrincipals,
  type PermissionTestRecordName,
  type PermissionTestWorkspace,
} from 'test/integration/permissions/utils/permission-test-workspace.type';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { type RecordPermissionsService } from 'src/engine/permissions/record-permissions.service';

type PermissionTestRecordAccessCase = Partial<PermissionTestPrincipals> & {
  it: string;
  record: PermissionTestRecordName;
  expected: PermissionTestExpectedAnswers;
};

export const describePermissionTestRecordAccess = ({
  name,
  findWorkspace,
  cases,
  ...sharedPrincipals
}: PermissionTestPrincipals & {
  name: string;
  findWorkspace: () => PermissionTestWorkspace;
  cases: PermissionTestRecordAccessCase[];
}) =>
  describe(name, () => {
    for (const { it: title, record, expected, ...casePrincipals } of cases) {
      it(title, async () => {
        const workspace = findWorkspace();
        const recordId = workspace.recordIds[record];
        const authContext = await buildPermissionTestAuthContext({
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
            ).resolvePermissionsPrincipals({ authContext }),
          objectMetadataId: workspace.objectMetadataId,
          recordIds: [recordId],
        };

        expect({
          findRecordsActions: (
            await recordPermissionsService.findRecordsActions({
              authContext,
              objectNameSingular: workspace.objectNameSingular,
              recordIds: [recordId],
            })
          ).get(recordId),
          canReadRecords: await recordPermissionsService.canAccessRecords({
            ...recordsQuestion,
            operationType: 'read',
          }),
          canUpdateRecords: await recordPermissionsService.canAccessRecords({
            ...recordsQuestion,
            operationType: 'update',
          }),
        }).toEqual(expected);
      });
    }
  });
