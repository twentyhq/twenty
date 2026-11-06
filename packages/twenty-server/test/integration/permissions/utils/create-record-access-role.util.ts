import { upsertRowLevelPermissionPredicatesQueryFactory } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates-query-factory.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RoleGrant } from 'src/engine/permissions/__tests__/framework/record-access-scenario.type';

export const createRecordAccessRole = async ({
  label,
  grant,
  rowLevelFilter,
  objectMetadataId,
  accessToken,
}: {
  label: string;
  grant: RoleGrant;
  rowLevelFilter?: { fieldMetadataId: string; value: string };
  objectMetadataId: string;
  accessToken: string;
}) => {
  const isGranted = grant !== 'none';
  const { data } = await createOneRole({
    input: {
      label,
      canUpdateAllSettings: false,
      canAccessAllTools: false,
      canReadAllObjectRecords: isGranted,
      canUpdateAllObjectRecords: isGranted,
      canSoftDeleteAllObjectRecords: isGranted,
      canDestroyAllObjectRecords: isGranted,
      canBeAssignedToUsers: true,
      canBeAssignedToAgents: true,
      canBeAssignedToApiKeys: true,
    },
    gqlFields: 'id',
    expectToFail: false,
    token: accessToken,
  });
  const roleId: string = data.createOneRole.id;

  if (grant === 'rowLevel' && isDefined(rowLevelFilter)) {
    const response = await makeMetadataApiRequest(
      upsertRowLevelPermissionPredicatesQueryFactory({
        input: {
          roleId,
          objectMetadataId,
          predicates: [
            {
              fieldMetadataId: rowLevelFilter.fieldMetadataId,
              operand: RowLevelPermissionPredicateOperand.IS,
              value: rowLevelFilter.value,
            },
          ],
          predicateGroups: [],
        },
      }),
      accessToken,
    );

    expect(response.body.errors).toBeUndefined();
  }

  return roleId;
};
