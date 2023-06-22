import { registerEnumType } from '@nestjs/graphql';

export enum RefreshTokenScalarFieldEnum {
    id = "id",
    createdAt = "createdAt",
    updatedAt = "updatedAt",
    isRevoked = "isRevoked",
    expiresAt = "expiresAt",
    deletedAt = "deletedAt",
    userId = "userId"
}


registerEnumType(RefreshTokenScalarFieldEnum, { name: 'RefreshTokenScalarFieldEnum', description: undefined })
