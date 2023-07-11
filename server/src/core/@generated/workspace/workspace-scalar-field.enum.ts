import { registerEnumType } from '@nestjs/graphql';

export enum WorkspaceScalarFieldEnum {
    id = "id",
    domainName = "domainName",
    displayName = "displayName",
    logo = "logo",
    inviteHash = "inviteHash",
    deletedAt = "deletedAt",
    createdAt = "createdAt",
    updatedAt = "updatedAt"
}


registerEnumType(WorkspaceScalarFieldEnum, { name: 'WorkspaceScalarFieldEnum', description: undefined })
