import { registerEnumType } from '@nestjs/graphql';

export enum CommentThreadScalarFieldEnum {
    id = "id",
    workspaceId = "workspaceId",
    authorId = "authorId",
    body = "body",
    title = "title",
    type = "type",
    reminderAt = "reminderAt",
    dueAt = "dueAt",
    completedAt = "completedAt",
    assigneeId = "assigneeId",
    deletedAt = "deletedAt",
    createdAt = "createdAt",
    updatedAt = "updatedAt"
}


registerEnumType(CommentThreadScalarFieldEnum, { name: 'CommentThreadScalarFieldEnum', description: undefined })
