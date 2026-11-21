/* @license Enterprise */

import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { isDefined } from 'twenty-shared/utils';

import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { type AccessGroupRow } from 'src/engine/permissions/internal/record-permission-repository/types/access-group-row.type';

const findAccessGroupColumnOrThrow = <TValue>({
  compactId,
  value,
}: {
  compactId: number;
  value: TValue | null;
}): TValue => {
  if (!isDefined(value)) {
    throw new PermissionsException(
      `Access group ${compactId} does not have the columns of its type`,
      PermissionsExceptionCode.RECORD_PERMISSION_QUERY_FAILED,
    );
  }

  return value;
};

export const fromAccessGroupRowToAccessGroup = ({
  compactId,
  groupHash,
  objectMetadataId,
  type,
  ruleShapeHash,
  unreadableFieldIds,
  memberFieldValues,
  value,
}: AccessGroupRow): AccessGroup => {
  const groupShape = {
    compactId,
    groupHash,
    objectMetadataId,
    ruleShapeHash,
    unreadableFieldIds,
  };

  switch (type) {
    case 'RLS_MEMBER_VALUE':
      return {
        ...groupShape,
        type,
        memberFieldValues: findAccessGroupColumnOrThrow({
          compactId,
          value: memberFieldValues,
        }),
      };
    case 'RLS_LITERAL_VALUE':
      return {
        ...groupShape,
        type,
        value: findAccessGroupColumnOrThrow({ compactId, value }),
      };
    default:
      return { ...groupShape, type };
  }
};
