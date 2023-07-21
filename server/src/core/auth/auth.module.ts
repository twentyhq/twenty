import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaService } from 'src/database/prisma.service';
import { UserModule } from 'src/core/user/user.module';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { WorkspaceModule } from 'src/core/workspace/workspace.module';

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
  imports: [jwtModule, UserModule, WorkspaceModule],
  controllers: [GoogleAuthController, VerifyAuthController],
  providers: [
    AuthService,
    TokenService,
    JwtAuthStrategy,
    PrismaService,
    AuthResolver,
  ],
  exports: [jwtModule],
})
export class AuthModule {}
