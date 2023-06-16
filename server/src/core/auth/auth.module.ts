import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthStrategy } from './strategies/jwt.auth.strategy';
import { AuthService } from './services/auth.service';
import { GoogleAuthController } from './google.auth.controller';
import { GoogleStrategy } from './strategies/google.auth.strategy';
import { TokenController } from './token.controller';
import { PrismaService } from 'src/database/prisma.service';
import { UserModule } from '../user/user.module';

const jwtModule = JwtModule.registerAsync({
  useFactory: async (configService: ConfigService) => {
    return {
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: {
        expiresIn: configService.get<string>('JWT_EXPIRES_IN') + 's',
      },
    };
  },
  imports: [ConfigModule.forRoot({})],
  inject: [ConfigService],
});

@Module({
  imports: [jwtModule, ConfigModule.forRoot({}), UserModule],
  controllers: [GoogleAuthController, TokenController],
  providers: [AuthService, JwtAuthStrategy, GoogleStrategy, PrismaService],
  exports: [jwtModule],
})
export class AuthModule {}
