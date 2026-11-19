import { registerEnumType } from '@nestjs/graphql';

export enum DatabaseEventAction {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  DESTROYED = 'destroyed',
  RESTORED = 'restored',
  UPSERTED = 'upserted',
}

registerEnumType(DatabaseEventAction, {
  name: 'DatabaseEventAction',
  description: 'Database Event Action',
});
