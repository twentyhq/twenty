/* @license Enterprise */

import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type AccessGroupRow } from 'src/engine/permissions/internal/record-permission-repository/types/access-group-row.type';

export const fromAccessGroupRowToAccessGroup = ({
  compactId,
  groupHash,
  objectMetadataId,
  type,
  ruleShapeHash,
  unreadableFieldIds,
  memberFieldValues,
  valuePredicateKey,
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
    case 'MEMBER_VALUE':
      return {
        ...groupShape,
        type,
        memberFieldValues: memberFieldValues ?? {},
      };
    case 'LITERAL_VALUE':
      return {
        ...groupShape,
        type,
        valuePredicateKey: valuePredicateKey ?? '',
        value: value ?? '',
      };
    default:
      return { ...groupShape, type };
  }
};
