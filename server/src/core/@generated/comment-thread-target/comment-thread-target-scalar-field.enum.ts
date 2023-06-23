import { registerEnumType } from '@nestjs/graphql';

export enum CommentThreadTargetScalarFieldEnum {
    id = "id",
    createdAt = "createdAt",
    updatedAt = "updatedAt",
    deletedAt = "deletedAt",
    commentThreadId = "commentThreadId",
    commentableType = "commentableType",
    commentableId = "commentableId"
}


registerEnumType(CommentThreadTargetScalarFieldEnum, { name: 'CommentThreadTargetScalarFieldEnum', description: undefined })
