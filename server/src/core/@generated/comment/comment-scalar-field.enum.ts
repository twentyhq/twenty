import { registerEnumType } from '@nestjs/graphql';

export enum CommentScalarFieldEnum {
    id = "id",
    createdAt = "createdAt",
    updatedAt = "updatedAt",
    deletedAt = "deletedAt",
    body = "body",
    authorId = "authorId",
    commentThreadId = "commentThreadId",
    workspaceId = "workspaceId"
}


registerEnumType(CommentScalarFieldEnum, { name: 'CommentScalarFieldEnum', description: undefined })
