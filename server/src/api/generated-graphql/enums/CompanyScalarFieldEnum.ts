import * as TypeGraphQL from '@nestjs/graphql';

export enum CompanyScalarFieldEnum {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  deletedAt = 'deletedAt',
  name = 'name',
  domainName = 'domainName',
  address = 'address',
  employees = 'employees',
  accountOwnerId = 'accountOwnerId',
  workspaceId = 'workspaceId',
}
TypeGraphQL.registerEnumType(CompanyScalarFieldEnum, {
  name: 'CompanyScalarFieldEnum',
  description: undefined,
});
