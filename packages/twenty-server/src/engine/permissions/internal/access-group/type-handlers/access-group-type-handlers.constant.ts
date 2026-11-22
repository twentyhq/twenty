/* @license Enterprise */

import { ALL_RECORDS_ACCESS_GROUP_TYPE_HANDLER } from 'src/engine/permissions/internal/access-group/type-handlers/all-records-access-group-type-handler.constant';
import { RLS_LITERAL_VALUE_ACCESS_GROUP_TYPE_HANDLER } from 'src/engine/permissions/internal/access-group/type-handlers/rls-literal-value-access-group-type-handler.constant';
import { RLS_MEMBER_VALUE_ACCESS_GROUP_TYPE_HANDLER } from 'src/engine/permissions/internal/access-group/type-handlers/rls-member-value-access-group-type-handler.constant';
import { RLS_RULE_ACCESS_GROUP_TYPE_HANDLER } from 'src/engine/permissions/internal/access-group/type-handlers/rls-rule-access-group-type-handler.constant';
import { type AccessGroupType } from 'src/engine/permissions/internal/access-group/types/access-group-type.type';
import { type AccessGroupTypeHandler } from 'src/engine/permissions/internal/access-group/types/access-group-type-handler.type';

export const ACCESS_GROUP_TYPE_HANDLERS: {
  [TType in AccessGroupType]: AccessGroupTypeHandler<TType>;
} = {
  ALL_RECORDS: ALL_RECORDS_ACCESS_GROUP_TYPE_HANDLER,
  RLS_RULE: RLS_RULE_ACCESS_GROUP_TYPE_HANDLER,
  RLS_MEMBER_VALUE: RLS_MEMBER_VALUE_ACCESS_GROUP_TYPE_HANDLER,
  RLS_LITERAL_VALUE: RLS_LITERAL_VALUE_ACCESS_GROUP_TYPE_HANDLER,
};
