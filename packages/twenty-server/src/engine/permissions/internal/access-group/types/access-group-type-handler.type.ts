/* @license Enterprise */

import { type AccessGroupOfType } from 'src/engine/permissions/internal/access-group/types/access-group-of-type.type';
import { type AccessGroupType } from 'src/engine/permissions/internal/access-group/types/access-group-type.type';
import { type AccessGroupValueLookup } from 'src/engine/permissions/internal/access-group/value-lookup/types/access-group-value-lookup.type';
import { type AccessGroupRow } from 'src/engine/permissions/internal/record-permission-repository/types/access-group-row.type';
import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';
import { type RlsRuleShape } from 'src/engine/permissions/internal/rls/types/rls-rule-shape.type';
import { type RlsRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';

export type AccessGroupTypeHandler<TType extends AccessGroupType> = {
  findSplitValue: (
    accessGroup: AccessGroupOfType<TType>,
  ) => RlsMemberFieldValues | string | null;
  toRowColumns: (
    accessGroup: AccessGroupOfType<TType>,
  ) => Pick<AccessGroupRow, 'memberFieldValues' | 'value'>;
  fromRow: (row: AccessGroupRow) => AccessGroupOfType<TType>;
  // null when the group reaches every record of the object
  buildRecordRule:
    | ((args: {
        accessGroup: AccessGroupOfType<TType>;
        ruleShape: RlsRuleShape;
      }) => {
        rowLevelPermissionRule: RlsRule;
        memberFieldValues: RlsMemberFieldValues;
      })
    | null;
  buildValueLookupCondition: TType extends AccessGroupValueLookup['type']
    ? (args: {
        accessGroupAlias: string;
        valueExpressions: string[];
        buildKeyParameterName: (keyIndex: number) => string;
      }) => string
    : null;
};
