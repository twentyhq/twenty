import { Module, DynamicModule } from '@nestjs/common';
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

@Module({})
export class AuthModule {
  static forRoot(loginProviders: string[]): DynamicModule {
    const controllers: any[] = [VerifyAuthController];
    const providers: any[] = [
      AuthService,
      TokenService,
      JwtAuthStrategy,
      PrismaService,
      AuthResolver,
    ];

    if (loginProviders.includes('google')) {
      controllers.push(GoogleAuthController);
      providers.push(GoogleStrategy);
    }

    return {
      module: AuthModule,
      imports: [jwtModule, ConfigModule.forRoot({}), UserModule],
      controllers: controllers,
      providers: providers,
      exports: [jwtModule],
    };
  }
}
