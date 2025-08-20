import {
  type ConnectObject,
  type DisconnectObject,
} from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-nested-relation-fields.type';

export type RelationConnectQueryFieldsByEntityIndex = {
  [entityIndex: string]: { [key: string]: ConnectObject };
};

export type RelationDisconnectQueryFieldsByEntityIndex = {
  [entityIndex: string]: {
    [key: string]: DisconnectObject;
  };
};
