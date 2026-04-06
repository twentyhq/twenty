import { Module } from '@nestjs/common';

import { VoIPService } from 'src/modules/voip/services/voip.service';

@Module({
  providers: [VoIPService],
  exports: [VoIPService],
})
export class VoIPModule {}
