import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { ApiModule } from './api/api.module';
@Module({
  imports: [TerminusModule, ApiModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
