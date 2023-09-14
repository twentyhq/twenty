import { Module } from '@nestjs/common';

import { CustomService } from './custom.service';
import { CustomResolver } from './custom.resolver';

@Module({
  providers: [CustomService, CustomResolver],
})
export class CustomModule {}
