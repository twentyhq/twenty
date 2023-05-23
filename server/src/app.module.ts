import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
@Module({
  imports: [
    UserModule,
    TerminusModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, UserService],
})
export class AppModule {}
