import { Module } from '@nestjs/common';

import { OmnichannelService } from 'src/modules/omnichannel/services/omnichannel.service';

@Module({
  providers: [OmnichannelService],
  exports: [OmnichannelService],
})
export class OmnichannelModule {}
