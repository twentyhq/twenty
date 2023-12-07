/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { FileModule } from 'src/core/file/file.module';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { User } from 'src/core/user/user.entity';
import { RefreshToken } from 'src/core/refresh-token/refresh-token.entity';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { UserModule } from 'src/core/user/user.module';
import { WorkspaceManagerModule } from 'src/workspace/workspace-manager/workspace-manager.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';

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
    DataSourceModule,
    UserModule,
    WorkspaceManagerModule,
    TypeORMModule,
    TypeOrmModule.forFeature([Workspace, User, RefreshToken], 'core'),
  ],
  controllers: [GoogleAuthController, VerifyAuthController],
  providers: [AuthService, TokenService, JwtAuthStrategy, AuthResolver],
  exports: [jwtModule, TokenService],
})
export class AuthModule {}
