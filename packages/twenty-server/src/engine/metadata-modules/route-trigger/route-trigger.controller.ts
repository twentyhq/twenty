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

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { HTTPMethod } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { RouteTriggerService } from 'src/engine/metadata-modules/route-trigger/route-trigger.service';

@Controller('s')
@UseGuards(PublicEndpointGuard)
@UseFilters(RestApiExceptionFilter)
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
