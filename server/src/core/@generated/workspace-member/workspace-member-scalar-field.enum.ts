import { registerEnumType } from '@nestjs/graphql';

export enum WorkspaceMemberScalarFieldEnum {
    id = "id",
    userId = "userId",
    workspaceId = "workspaceId",
    deletedAt = "deletedAt",
    createdAt = "createdAt",
    updatedAt = "updatedAt"
}


registerEnumType(WorkspaceMemberScalarFieldEnum, { name: 'WorkspaceMemberScalarFieldEnum', description: undefined })
