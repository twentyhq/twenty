import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CompanyResolvers } from './company.resolvers';
import { PrismaClient } from '@prisma/client';
import { CompanyRelationsResolver } from './local-graphql';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
  ],
  providers: [PrismaClient, CompanyResolvers, CompanyRelationsResolver],
})
export class ApiModule {}
