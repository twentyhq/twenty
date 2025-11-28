import { findRoles } from 'test/integration/metadata/suites/role/utils/find-roles.util';

import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';

export const findOneRoleByLabel = async ({
  label,
  gqlFields,
  token,
}: {
  label: string;
  gqlFields?: string;
  token?: string;
}): Promise<RoleDTO> => {
  const { data, errors } = await findRoles({
    gqlFields,
    expectToFail: false,
    token,
  });

  if (errors || !data?.getRoles) {
    throw new Error(
      `Failed to get roles: ${JSON.stringify(errors || 'No data returned')}`,
    );
  }

  const role = data.getRoles.find((r) => r.label === label);

  if (!role) {
    throw new Error(`Role with label "${label}" not found`);
  }

  return role;
};
