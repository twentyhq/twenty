import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { AbilityModule } from 'src/ability/ability.module';
import { FileModule } from 'src/core/file/file.module';

import { User } from './user.entity';
import { UserResolver } from './user.resolver';
import { userAutoResolverOpts } from './user.auto-resolver-opts';

import { UserService } from './services/user.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([User])],
      services: [UserService],
      resolvers: userAutoResolverOpts,
    }),
    AbilityModule,
    FileModule,
  ],
  providers: [UserService, UserResolver],
})
export class UserModule {}
