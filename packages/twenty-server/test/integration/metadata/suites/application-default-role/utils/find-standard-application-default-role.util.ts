import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { findRoles } from 'test/integration/metadata/suites/role/utils/find-roles.util';

import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export const findStandardApplicationDefaultRole = async (token?: string) => {
  const { data: applicationData } = await findOneApplication({
    input: {
      universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
    },
    gqlFields: 'id defaultRoleId',
    expectToFail: false,
    token,
  });
  const { data: rolesData } = await findRoles({
    gqlFields: 'id label universalIdentifier isEditable',
    expectToFail: false,
    token,
  });

  return rolesData.getRoles.find(
    ({ id }) => id === applicationData.findOneApplication.defaultRoleId,
  );
};
