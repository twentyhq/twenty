import { Module } from '@nestjs/common';

import { RecordInputTransformerService } from './record-input-transformer.service';

@Module({
  providers: [RecordInputTransformerService],
  exports: [RecordInputTransformerService],
})
export class RecordTransformerModule {}
