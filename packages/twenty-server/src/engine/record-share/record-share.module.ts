import { Module } from '@nestjs/common';

import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { TwentyOrmModule } from 'src/engine/twenty-orm/twenty-orm.module';

@Module({
  imports: [TwentyOrmModule],
  providers: [RecordShareService],
  exports: [RecordShareService],
})
export class RecordShareModule {}
