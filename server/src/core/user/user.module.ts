import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { FileModule } from 'src/core/file/file.module';
import { User } from 'src/core/user/user.entity';
import { UserResolver } from 'src/core/user/user.resolver';

// eslint-disable-next-line no-restricted-imports
import config from '../../../ormconfig';

import { userAutoResolverOpts } from './user.auto-resolver-opts';

import { UserService } from './services/user.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([User])],
      services: [UserService],
      resolvers: userAutoResolverOpts,
    }),
    FileModule,
  ],
  providers: [UserService, UserResolver],
})
export class UserModule {}
