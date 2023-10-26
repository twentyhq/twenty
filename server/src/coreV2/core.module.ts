import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';

import { YogaDriverConfig, YogaDriver } from '@graphql-yoga/nestjs';
import GraphQLJSON from 'graphql-type-json';

// eslint-disable-next-line no-restricted-imports
import config from '../../ormconfig';

import { UserModule } from './userv2/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    GraphQLModule.forRoot<YogaDriverConfig>({
      context: ({ req }) => ({ req }),
      driver: YogaDriver,
      autoSchemaFile: true,
      include: [CoreV2Module],
      resolvers: { JSON: GraphQLJSON },
      plugins: [],
      path: '/graphqlv2',
    }),
    UserModule,
  ],
  exports: [UserModule],
})
export class CoreV2Module {}
