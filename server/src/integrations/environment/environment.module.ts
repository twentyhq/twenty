import { Global, Module } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { ConfigurableModuleClass } from './environment.module-definition';
import { ConfigModule } from '@nestjs/config';
import { validate } from './environment.validation';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      validate,
    }),
  ],
  providers: [EnvironmentService],
  exports: [EnvironmentService],
})
export class EnvironmentModule extends ConfigurableModuleClass {}
