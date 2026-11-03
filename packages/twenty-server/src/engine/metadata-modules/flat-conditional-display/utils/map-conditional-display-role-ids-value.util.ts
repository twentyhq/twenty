import { isNonEmptyArray } from 'twenty-shared/utils';

import { parseSelectFilterValues } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-invalid-select-filter-option-values.util';

export const mapConditionalDisplayRoleIdsValue = ({
  value,
  mapRoleId,
}: {
  value: string | null | undefined;
  mapRoleId: (roleId: string) => string;
}): string | null | undefined => {
  const roleIds = parseSelectFilterValues(value ?? null);

  if (!isNonEmptyArray(roleIds)) {
    return value;
  }

  return JSON.stringify(roleIds.map(mapRoleId));
};
