import { registerEnumType } from '@nestjs/graphql';

export enum UserScalarFieldEnum {
    id = "id",
    firstName = "firstName",
    lastName = "lastName",
    email = "email",
    emailVerified = "emailVerified",
    avatarUrl = "avatarUrl",
    phoneNumber = "phoneNumber",
    lastSeen = "lastSeen",
    disabled = "disabled",
    passwordHash = "passwordHash",
    metadata = "metadata",
    settingsId = "settingsId",
    deletedAt = "deletedAt",
    createdAt = "createdAt",
    updatedAt = "updatedAt"
}


registerEnumType(UserScalarFieldEnum, { name: 'UserScalarFieldEnum', description: undefined })
