import { registerEnumType } from '@nestjs/graphql';

export enum MetadataEventAction {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
}

registerEnumType(MetadataEventAction, {
  name: 'MetadataEventAction',
  description: 'Metadata Event Action',
});
