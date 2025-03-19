import { Module } from '@nestjs/common';

import { ChargeEventListener } from 'src/modules/charges/charge.listener';

@Module({
  providers: [ChargeEventListener],
})
export class ChargeModule {}
