import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { HTTPMethod } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { RouteTriggerService } from 'src/engine/metadata-modules/route-trigger/route-trigger.service';
import { formatServerlessControllerResponse } from 'src/engine/metadata-modules/route-trigger/utils/format-serverless-controller-response';

@Controller('s')
@UseGuards(PublicEndpointGuard)
export class RouteTriggerController {
  constructor(private readonly routeTriggerService: RouteTriggerService) {}

  @Get('*')
  async get(@Req() request: Request) {
    const result = await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.GET,
    });

    return formatServerlessControllerResponse(result);
  }

  @Post('*')
  async post(@Req() request: Request) {
    const result = await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.POST,
    });

    return formatServerlessControllerResponse(result);
  }

  @Put('*')
  async put(@Req() request: Request) {
    const result = await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.PUT,
    });

    return formatServerlessControllerResponse(result);
  }

  @Patch('*')
  async patch(@Req() request: Request) {
    const result = await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.PATCH,
    });

    return formatServerlessControllerResponse(result);
  }

  @Delete('*')
  async delete(@Req() request: Request) {
    const result = await this.routeTriggerService.handle({
      request,
      httpMethod: HTTPMethod.DELETE,
    });

    return formatServerlessControllerResponse(result);
  }
}
