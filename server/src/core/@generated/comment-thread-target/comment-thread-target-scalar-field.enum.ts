import { registerEnumType } from '@nestjs/graphql';

export enum CommentThreadTargetScalarFieldEnum {
    id = "id",
    commentThreadId = "commentThreadId",
    commentableType = "commentableType",
    commentableId = "commentableId",
    deletedAt = "deletedAt",
    createdAt = "createdAt",
    updatedAt = "updatedAt"
}


registerEnumType(CommentThreadTargetScalarFieldEnum, { name: 'CommentThreadTargetScalarFieldEnum', description: undefined })
