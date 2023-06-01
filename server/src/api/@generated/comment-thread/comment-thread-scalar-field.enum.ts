import { registerEnumType } from '@nestjs/graphql';

export enum CommentThreadScalarFieldEnum {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  deletedAt = 'deletedAt',
  workspaceId = 'workspaceId',
}

registerEnumType(CommentThreadScalarFieldEnum, {
  name: 'CommentThreadScalarFieldEnum',
  description: undefined,
});
