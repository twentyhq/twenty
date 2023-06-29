import { registerEnumType } from '@nestjs/graphql';

export enum UserScalarFieldEnum {
    id = "id",
    displayName = "displayName",
    email = "email",
    emailVerified = "emailVerified",
    avatarUrl = "avatarUrl",
    locale = "locale",
    phoneNumber = "phoneNumber",
    lastSeen = "lastSeen",
    disabled = "disabled",
    passwordHash = "passwordHash",
    metadata = "metadata",
    deletedAt = "deletedAt",
    createdAt = "createdAt",
    updatedAt = "updatedAt"
}


registerEnumType(UserScalarFieldEnum, { name: 'UserScalarFieldEnum', description: undefined })
