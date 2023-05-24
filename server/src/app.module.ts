import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';

import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from './api/api.module';
@Module({
  imports: [
    ConfigModule.forRoot({}),
    TerminusModule,
    AuthModule,
    ApiModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
