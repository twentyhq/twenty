import { Module } from '@nestjs/common';
import { ClientConfigResolver } from './client-config.resolver';

@Module({
  providers: [ClientConfigResolver],
})
export class ClientConfigModule {}
