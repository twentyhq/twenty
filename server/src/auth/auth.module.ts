import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthStrategy } from './strategies/jwt.auth.strategy';
import { AuthService } from './services/auth.service';
import { GoogleAuthController } from './google.auth.controller';
import { GoogleStrategy } from './strategies/google.auth.strategy';
import { AuthController } from './auth.controller';
import { UserRepository } from 'src/entities/user/user.repository';
import { WorkspaceRepository } from 'src/entities/workspace/workspace.repository';
import { RefreshTokenRepository } from 'src/entities/refresh-token/refresh-token.repository';
import { PrismaService } from 'src/database/prisma.service';

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
  imports: [jwtModule, ConfigModule.forRoot({})],
  controllers: [GoogleAuthController, AuthController],
  providers: [
    AuthService,
    JwtAuthStrategy,
    GoogleStrategy,
    UserRepository,
    WorkspaceRepository,
    RefreshTokenRepository,
    PrismaService,
  ],
  exports: [jwtModule],
})
export class AuthModule {}
