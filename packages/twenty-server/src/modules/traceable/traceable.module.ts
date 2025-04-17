import { Module } from '@nestjs/common';

import { TraceableEventListener } from 'src/modules/traceable/traceable.listener';

@Module({
  providers: [TraceableEventListener],
})
export class TraceableModule {}
