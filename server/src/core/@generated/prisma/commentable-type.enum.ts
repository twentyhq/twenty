import { registerEnumType } from '@nestjs/graphql';

export enum CommentableType {
  Person = 'Person',
  Company = 'Company',
}

registerEnumType(CommentableType, {
  name: 'CommentableType',
  description: undefined,
});
