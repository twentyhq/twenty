import { isDefined } from 'twenty-shared/utils';

import { parseConditionalDisplayRoleIds } from 'src/engine/metadata-modules/flat-conditional-display/utils/parse-conditional-display-role-ids.util';

export const mapConditionalDisplayRoleIdsValue = ({
  value,
  mapRoleId,
}: {
  value: string | null | undefined;
  mapRoleId: (roleId: string) => string;
}): string | null | undefined => {
  const roleIds = parseConditionalDisplayRoleIds(value);

  if (!isDefined(roleIds)) {
    return value;
  }

  return JSON.stringify(roleIds.map(mapRoleId));
};
