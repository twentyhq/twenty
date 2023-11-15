import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

// eslint-disable-next-line no-restricted-imports
import config from '../../../ormconfig';

import { RefreshToken } from './refresh-token.entity';
import { refreshTokenAutoResolverOpts } from './refresh-token.auto-resolver-opts';

import { RefreshTokenService } from './services/refresh-token.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([RefreshToken])],
      services: [RefreshTokenService],
      resolvers: refreshTokenAutoResolverOpts,
    }),
  ],
})
export class RefreshTokenModule {}
