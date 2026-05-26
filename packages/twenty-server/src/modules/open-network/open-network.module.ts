import { Module } from '@nestjs/common';

import { OpenNetworkController } from 'src/modules/open-network/open-network.controller';
import { OpenNetworkService } from 'src/modules/open-network/open-network.service';

@Module({
  controllers: [OpenNetworkController],
  providers: [OpenNetworkService],
})
export class OpenNetworkModule {}
