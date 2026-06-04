import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { RouteTriggerRestApiExceptionFilter } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/exceptions/route-trigger-rest-api-exception-filter';
import { RouteTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/route-trigger.service';

@Controller('s')
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
@UseFilters(RouteTriggerRestApiExceptionFilter)
export class RouteTriggerController {
  constructor(private readonly routeTriggerService: RouteTriggerService) {}

  @Get('*path')
  @HttpCode(HttpStatus.OK)
  async get(@Req() request: Request) {
    return await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.GET,
    });
  }

  @Post('*path')
  @HttpCode(HttpStatus.OK)
  async post(@Req() request: Request) {
    return await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.POST,
    });
  }

  @Put('*path')
  @HttpCode(HttpStatus.OK)
  async put(@Req() request: Request) {
    return await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.PUT,
    });
  }

  @Patch('*path')
  @HttpCode(HttpStatus.OK)
  async patch(@Req() request: Request) {
    return await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.PATCH,
    });
  }

  @Delete('*path')
  @HttpCode(HttpStatus.OK)
  async delete(@Req() request: Request) {
    return await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.DELETE,
    });
  }
}
