/* @license Enterprise */

import { type AccessGroupTypeHandler } from 'src/engine/permissions/internal/access-group/types/access-group-type-handler.type';

export const ALL_RECORDS_ACCESS_GROUP_TYPE_HANDLER: AccessGroupTypeHandler<'ALL_RECORDS'> =
  {
    findSplitValue: () => null,
    toRowColumns: () => ({ memberFieldValues: null, value: null }),
    fromRow: () => ({ type: 'ALL_RECORDS' }),
    buildRecordRule: null,
    buildValueLookupCondition: null,
  };
