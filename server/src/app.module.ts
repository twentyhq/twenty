import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { UserModule } from './entities/user/user.module';

@Module({
  imports: [
    UserModule,
    TerminusModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
