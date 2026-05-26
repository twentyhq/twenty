import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  type OpenNetworkPersonPayload,
  OpenNetworkService,
} from 'src/modules/open-network/open-network.service';

@Controller('api/open-network')
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class OpenNetworkController {
  constructor(
    private readonly openNetworkService: OpenNetworkService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @Post('people')
  async upsertPerson(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: OpenNetworkPersonPayload,
  ) {
    const token = this.twentyConfigService.get('OPEN_NETWORK_API_TOKEN');

    if (!token || authorization !== `Bearer ${token}`) {
      throw new UnauthorizedException();
    }

    return this.openNetworkService.upsertPerson(body);
  }
}
