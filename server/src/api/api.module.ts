import { Module } from '@nestjs/common';
import { TypeGraphQLModule } from 'typegraphql-nestjs';
import { ApolloDriver } from '@nestjs/apollo';
import { PrismaClient } from '@prisma/client';

import {
  CompanyCrudResolver,
  UserCrudResolver,
  PersonCrudResolver,
  WorkspaceCrudResolver,
} from '@generated/type-graphql';

interface Context {
  prisma: PrismaClient;
}

const prisma = new PrismaClient();

@Module({
  imports: [
    TypeGraphQLModule.forRoot({
      driver: ApolloDriver,
      path: '/',
      validate: false,
      context: (): Context => ({ prisma }),
    }),
  ],
  providers: [
    CompanyCrudResolver,
    UserCrudResolver,
    PersonCrudResolver,
    WorkspaceCrudResolver,
  ],
})
export class ApiModule {}
