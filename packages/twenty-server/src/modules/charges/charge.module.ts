// module/charge/charge.module.ts
import { Module } from '@nestjs/common';

import { ChargeEventListener } from './charge.listener';

import { InterApiService } from './inter/inter-api.service';

@Module({
  providers: [ChargeEventListener, InterApiService],
})
export class ChargeModule {}
