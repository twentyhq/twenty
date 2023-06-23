import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthStrategy } from './strategies/jwt.auth.strategy';
import { AuthService } from './services/auth.service';
import { GoogleAuthController } from './controllers/google-auth.controller';
import { GoogleStrategy } from './strategies/google.auth.strategy';
import { PrismaService } from 'src/database/prisma.service';
import { UserModule } from '../user/user.module';
import { VerifyAuthController } from './controllers/verify-auth.controller';

import { TokenService } from './services/token.service';
import { AuthResolver } from './auth.resolver';

const jwtModule = JwtModule.registerAsync({
  useFactory: async (configService: ConfigService) => {
    return {
      secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
      signOptions: {
        expiresIn: configService.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
      },
    };
  },
  imports: [ConfigModule.forRoot({})],
  inject: [ConfigService],
});

@Module({
  imports: [jwtModule, ConfigModule.forRoot({}), UserModule],
  controllers: [GoogleAuthController, VerifyAuthController],
  providers: [
    AuthService,
    TokenService,
    JwtAuthStrategy,
    GoogleStrategy,
    PrismaService,
    AuthResolver,
  ],
  exports: [jwtModule],
})
export class AuthModule {}
