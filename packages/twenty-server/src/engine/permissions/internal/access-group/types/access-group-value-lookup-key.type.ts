/* @license Enterprise */

import { type AccessGroupValueLookupRelationHop } from 'src/engine/permissions/internal/access-group/types/access-group-value-lookup-relation-hop.type';

export type AccessGroupValueLookupKey = {
  memberFieldKey: string | null;
  columnName: string;
  relationHop: AccessGroupValueLookupRelationHop | null;
};
