import { Module } from '@nestjs/common';
import { CustomersModule } from './libs/customers/customers.module';
@Module({
  imports: [
    CustomersModule
  ],
  controllers: [],
  providers: [],
  exports: [
    CustomersModule
  ],
})
export class MKTCoreModule {}