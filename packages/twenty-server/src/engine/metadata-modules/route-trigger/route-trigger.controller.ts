import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { HTTPMethod } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { RouteTriggerService } from 'src/engine/metadata-modules/route-trigger/route-trigger.service';
import { RouteTriggerExceptionFilter } from 'src/engine/metadata-modules/route-trigger/exceptions/route-trigger-exception-filter';

@Controller('s')
@UseGuards(PublicEndpointGuard)
@UseFilters(RouteTriggerExceptionFilter)
export class RouteTriggerController {
  constructor(private readonly routeTriggerService: RouteTriggerService) {}

  @Get('*')
  async get(@Req() request: Request) {
    return await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.GET,
    });
  }

  @Post('*')
  async post(@Req() request: Request) {
    return await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.POST,
    });
  }

  @Put('*')
  async put(@Req() request: Request) {
    return await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.PUT,
    });
  }

  @Patch('*')
  async patch(@Req() request: Request) {
    return await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.PATCH,
    });
  }

  @Delete('*')
  async delete(@Req() request: Request) {
    return await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.DELETE,
    });
  }
}
