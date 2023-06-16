import { registerEnumType } from '@nestjs/graphql';

export enum WorkspaceMemberScalarFieldEnum {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  deletedAt = 'deletedAt',
  userId = 'userId',
  workspaceId = 'workspaceId',
}

registerEnumType(WorkspaceMemberScalarFieldEnum, {
  name: 'WorkspaceMemberScalarFieldEnum',
  description: undefined,
});
