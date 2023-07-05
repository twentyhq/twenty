import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthStrategy } from './strategies/jwt.auth.strategy';
import { AuthService } from './services/auth.service';
import { GoogleAuthController } from './controllers/google-auth.controller';
import { PrismaService } from 'src/database/prisma.service';
import { UserModule } from '../user/user.module';
import { VerifyAuthController } from './controllers/verify-auth.controller';
import { TokenService } from './services/token.service';
import { AuthResolver } from './auth.resolver';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

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
  imports: [jwtModule, UserModule],
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
