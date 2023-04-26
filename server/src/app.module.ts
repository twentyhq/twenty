import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HasuraModule } from '@golevelup/nestjs-hasura';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
@Module({
  imports: [
    UserModule,
    TerminusModule,
    HasuraModule.forRoot(HasuraModule, {
      webhookConfig: {
        secretFactory: process.env.HASURA_EVENT_HANDLER_SECRET_HEADER || '',
        secretHeader: 'secret-header',
      },
    }),
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, UserService],
})
export class AppModule {}
