import { buildRecordAccessAuthContext } from 'test/integration/permissions/utils/build-record-access-auth-context.util';
import {
  type RecordAccessRecordName,
  type RecordAccessWorkspace,
} from 'test/integration/permissions/utils/record-access-workspace.type';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type GivenPrincipals } from 'src/engine/permissions/__tests__/framework/given-principals.util';
import { type RoleGrant } from 'src/engine/permissions/__tests__/framework/record-access-scenario.type';
import { type PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { type RecordPermissionsDTO } from 'src/engine/permissions/record-permissions/dtos/record-permissions.dto';
import { type RecordPermissionsService } from 'src/engine/permissions/record-permissions.service';

export type ExpectedRecordAccess = {
  findRecordsPermissions: RecordPermissionsDTO;
  canReadRecords: boolean;
  canUpdateRecords: boolean;
};

type RecordAccessCase = Partial<GivenPrincipals<RoleGrant>> & {
  it: string;
  record: RecordAccessRecordName;
  expected: ExpectedRecordAccess;
};

export const describeRecordAccessInWorkspace = ({
  name,
  findWorkspace,
  mainPrincipal,
  limitingPrincipal,
  applicationPrincipal,
  cases,
}: GivenPrincipals<RoleGrant> & {
  name: string;
  findWorkspace: () => RecordAccessWorkspace;
  cases: RecordAccessCase[];
}) =>
  describe(name, () => {
    for (const { it: title, record, expected, ...caseGiven } of cases) {
      it(title, async () => {
        const workspace = findWorkspace();
        const recordId = workspace.recordIds[record];
        const authContext = await buildRecordAccessAuthContext({
          given: {
            mainPrincipal,
            limitingPrincipal,
            applicationPrincipal,
            ...caseGiven,
          },
          workspace,
        });
        const principals =
          await getAppProviderByClassName<PrincipalPermissionsService>(
            'PrincipalPermissionsService',
          ).buildPermissionsPrincipals({ authContext });

        expect(isDefined(principals)).toBe(true);

        const recordPermissionsService =
          getAppProviderByClassName<RecordPermissionsService>(
            'RecordPermissionsService',
          );
        const recordsQuestion = {
          principals,
          objectMetadataId: workspace.objectMetadataId,
          recordIds: [recordId],
        };

        expect({
          findRecordsPermissions: (
            await recordPermissionsService.findRecordsPermissions({
              authContext: authContext as WorkspaceAuthContext,
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
