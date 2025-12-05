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
import { HTTPMethod } from 'twenty-shared/types';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { RouteTriggerRestApiExceptionFilter } from 'src/engine/metadata-modules/route-trigger/exceptions/route-trigger-rest-api-exception-filter';
import { RouteTriggerService } from 'src/engine/metadata-modules/route-trigger/route-trigger.service';

@Controller('s')
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
@UseFilters(RouteTriggerRestApiExceptionFilter)
export class RouteTriggerController {
  constructor(private readonly routeTriggerService: RouteTriggerService) {}

  @Get('*path')
  async get(@Req() request: Request) {
    return await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.GET,
    });
  }

  @Post('*path')
  async post(@Req() request: Request) {
    return await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.POST,
    });
  }

  @Put('*path')
  async put(@Req() request: Request) {
    return await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.PUT,
    });
  }

  @Patch('*path')
  async patch(@Req() request: Request) {
    return await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.PATCH,
    });
  }

  @Delete('*path')
  async delete(@Req() request: Request) {
    return await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.DELETE,
    });
  }
}
