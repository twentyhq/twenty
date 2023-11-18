import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { FileModule } from 'src/core/file/file.module';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { User } from 'src/core/user/user.entity';
import { RefreshToken } from 'src/core/refresh-token/refresh-token.entity';

// eslint-disable-next-line no-restricted-imports
import config from '../../../ormconfig';

import { AuthResolver } from './auth.resolver';

import { JwtAuthStrategy } from './strategies/jwt.auth.strategy';
import { AuthService } from './services/auth.service';
import { GoogleAuthController } from './controllers/google-auth.controller';
import { VerifyAuthController } from './controllers/verify-auth.controller';
import { TokenService } from './services/token.service';

const jwtModule = JwtModule.registerAsync({
  useFactory: async (environmentService: EnvironmentService) => {
    return {
      secret: environmentService.getAccessTokenSecret(),
      signOptions: {
        expiresIn: environmentService.getAccessTokenExpiresIn(),
      },
    };
  },
  inject: [EnvironmentService],
});

@Module({
  imports: [
    jwtModule,
    FileModule,
    TypeOrmModule.forRoot(config),
    NestjsQueryGraphQLModule.forFeature({
      imports: [TypeOrmModule.forFeature([Workspace, User, RefreshToken])],
    }),
  ],
  controllers: [GoogleAuthController, VerifyAuthController],
  providers: [AuthService, TokenService, JwtAuthStrategy, AuthResolver],
  exports: [jwtModule],
})
export class AuthModule {}
