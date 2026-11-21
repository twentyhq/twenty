/* @license Enterprise */

import { type AccessGroupTypeHandler } from 'src/engine/permissions/internal/access-group/types/access-group-type-handler.type';
import { findAccessGroupColumnOrThrow } from 'src/engine/permissions/internal/access-group/utils/find-access-group-column-or-throw.util';

export const RLS_MEMBER_VALUE_ACCESS_GROUP_TYPE_HANDLER: AccessGroupTypeHandler<'RLS_MEMBER_VALUE'> =
  {
    findSplitValue: ({ memberFieldValues }) => memberFieldValues,
    toRowColumns: ({ memberFieldValues }) => ({
      memberFieldValues,
      value: null,
    }),
    fromRow: ({ compactId, memberFieldValues }) => ({
      type: 'RLS_MEMBER_VALUE',
      memberFieldValues: findAccessGroupColumnOrThrow({
        compactId,
        value: memberFieldValues,
      }),
    }),
    buildRecordRule: ({ accessGroup, ruleShape }) => ({
      rowLevelPermissionRule: ruleShape.rowLevelPermissionRule,
      memberFieldValues: accessGroup.memberFieldValues,
    }),
    buildValueLookupCondition: ({
      accessGroupAlias,
      valueExpressions,
      buildKeyParameterName,
    }) =>
      `${accessGroupAlias}."memberFieldValues" = jsonb_build_object(${valueExpressions
        .map(
          (valueExpression, keyIndex) =>
            `CAST(:${buildKeyParameterName(keyIndex)} AS text), ${valueExpression}`,
        )
        .join(', ')})`,
  };
