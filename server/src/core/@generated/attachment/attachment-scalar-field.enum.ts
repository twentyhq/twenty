import { registerEnumType } from '@nestjs/graphql';

export enum AttachmentScalarFieldEnum {
    id = "id",
    fullPath = "fullPath",
    type = "type",
    name = "name",
    authorId = "authorId",
    activityId = "activityId",
    workspaceId = "workspaceId",
    deletedAt = "deletedAt",
    createdAt = "createdAt",
    updatedAt = "updatedAt"
}


registerEnumType(AttachmentScalarFieldEnum, { name: 'AttachmentScalarFieldEnum', description: undefined })
