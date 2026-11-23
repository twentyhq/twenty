import { buildPermissionTestAuthContext } from 'test/integration/permissions/utils/build-permission-test-auth-context.util';
import {
  type PermissionTestExpectedAnswers,
  type PermissionTestPrincipals,
  type PermissionTestRecordName,
  type PermissionTestWorkspace,
} from 'test/integration/permissions/utils/permission-test-workspace.type';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { type RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';

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
        const recordPermissionsReadService =
          getAppProviderByClassName<RecordPermissionsReadService>(
            'RecordPermissionsReadService',
          );
        const recordsQuestion = {
          principals:
            await getAppProviderByClassName<PrincipalPermissionsReadService>(
              'PrincipalPermissionsReadService',
            ).resolvePermissionsPrincipals({ authContext }),
          objectMetadataId: workspace.objectMetadataId,
          recordIds: [recordId],
        };

        expect({
          findRecordsActions: (
            await recordPermissionsReadService.findRecordsActions({
              authContext,
              objectNameSingular: workspace.objectNameSingular,
              recordIds: [recordId],
            })
          ).get(recordId),
          canReadRecords: await recordPermissionsReadService.canAccessRecords({
            ...recordsQuestion,
            operationType: 'read',
          }),
          canUpdateRecords: await recordPermissionsReadService.canAccessRecords(
            {
              ...recordsQuestion,
              operationType: 'update',
            },
          ),
        }).toEqual(expected);
      });
    }
  });
