import { registerEnumType } from '@nestjs/graphql';

export enum RefreshTokenScalarFieldEnum {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  deletedAt = 'deletedAt',
  refreshToken = 'refreshToken',
  userId = 'userId',
}

registerEnumType(RefreshTokenScalarFieldEnum, {
  name: 'RefreshTokenScalarFieldEnum',
  description: undefined,
});
