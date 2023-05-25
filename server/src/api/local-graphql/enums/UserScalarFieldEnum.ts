import * as TypeGraphQL from '@nestjs/graphql';

export enum UserScalarFieldEnum {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  deletedAt = 'deletedAt',
  lastSeen = 'lastSeen',
  disabled = 'disabled',
  displayName = 'displayName',
  email = 'email',
  avatarUrl = 'avatarUrl',
  locale = 'locale',
  phoneNumber = 'phoneNumber',
  passwordHash = 'passwordHash',
  emailVerified = 'emailVerified',
  metadata = 'metadata',
}
TypeGraphQL.registerEnumType(UserScalarFieldEnum, {
  name: 'UserScalarFieldEnum',
  description: undefined,
});
