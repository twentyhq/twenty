import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CompanyResolvers } from './company.resolvers';
import { PrismaClient } from '@prisma/client';
import { CompanyRelationsResolver } from './local-graphql';
import { PeopleResolvers } from './people.resolver';
import { PersonRelationsResolver } from './people-relations.resolver';
import { UserResolvers } from './user.resolver';
import { UserRelationsResolver } from './user-relations.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
  ],
  providers: [
    PrismaClient,
    CompanyResolvers,
    CompanyRelationsResolver,
    PeopleResolvers,
    PersonRelationsResolver,
    UserResolvers,
    UserRelationsResolver,
  ],
})
export class ApiModule {}
