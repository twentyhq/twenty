import * as TypeGraphQL from '@nestjs/graphql';

export enum PersonScalarFieldEnum {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  deletedAt = 'deletedAt',
  firstname = 'firstname',
  lastname = 'lastname',
  email = 'email',
  phone = 'phone',
  city = 'city',
  companyId = 'companyId',
  workspaceId = 'workspaceId',
}
TypeGraphQL.registerEnumType(PersonScalarFieldEnum, {
  name: 'PersonScalarFieldEnum',
  description: undefined,
});
