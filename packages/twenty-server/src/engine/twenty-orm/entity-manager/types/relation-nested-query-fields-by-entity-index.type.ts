import { RELATION_NESTED_QUERY_KEYWORDS } from 'twenty-shared/constants';

import {
  ConnectObject,
  DisconnectObject,
} from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-relation-connect.type';

export type RelationNestedQueryFieldsByEntityIndex = {
  [entityIndex: string]: {
    [RELATION_NESTED_QUERY_KEYWORDS.CONNECT]?: { [key: string]: ConnectObject };
    [RELATION_NESTED_QUERY_KEYWORDS.DISCONNECT]?: {
      [key: string]: DisconnectObject;
    };
  };
};
