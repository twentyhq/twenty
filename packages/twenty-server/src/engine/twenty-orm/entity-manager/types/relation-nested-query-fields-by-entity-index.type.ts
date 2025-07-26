import {
  ConnectObject,
  DisconnectObject,
} from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-relation-connect.type';

export type RelationConnectQueryFieldsByEntityIndex = {
  [entityIndex: string]: { [key: string]: ConnectObject };
};

export type RelationDisconnectQueryFieldsByEntityIndex = {
  [entityIndex: string]: {
    [key: string]: DisconnectObject;
  };
};
