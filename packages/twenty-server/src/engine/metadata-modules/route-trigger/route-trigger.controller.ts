import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { HTTPMethod } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { RouteTriggerRestApiExceptionFilter } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/exceptions/route-trigger-rest-api-exception-filter';
import {
  RouteTriggerResponse,
  RouteTriggerService,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/route-trigger.service';

const ALLOWED_RESPONSE_HEADERS = new Set([
  'content-type',
  'content-language',
  'content-disposition',
  'cache-control',
  'retry-after',
]);

@Controller('s')
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
@UseFilters(RouteTriggerRestApiExceptionFilter)
export class RouteTriggerController {
  constructor(private readonly routeTriggerService: RouteTriggerService) {}

  @Get('*path')
  async get(@Req() request: Request, @Res() response: Response) {
    this.sendResponse(
      response,
      await this.routeTriggerService.handle({
        request,
        httpMethod: HTTPMethod.GET,
      }),
    );
  }

  @Post('*path')
  async post(@Req() request: Request, @Res() response: Response) {
    this.sendResponse(
      response,
      await this.routeTriggerService.handle({
        request,
        httpMethod: HTTPMethod.POST,
      }),
    );
  }

  @Put('*path')
  async put(@Req() request: Request, @Res() response: Response) {
    this.sendResponse(
      response,
      await this.routeTriggerService.handle({
        request,
        httpMethod: HTTPMethod.PUT,
      }),
    );
  }

  @Patch('*path')
  async patch(@Req() request: Request, @Res() response: Response) {
    this.sendResponse(
      response,
      await this.routeTriggerService.handle({
        request,
        httpMethod: HTTPMethod.PATCH,
      }),
    );
  }

  @Delete('*path')
  async delete(@Req() request: Request, @Res() response: Response) {
    this.sendResponse(
      response,
      await this.routeTriggerService.handle({
        request,
        httpMethod: HTTPMethod.DELETE,
      }),
    );
  }

  private sendResponse(
    response: Response,
    { statusCode, headers, body }: RouteTriggerResponse,
  ) {
    response.status(statusCode);

    for (const [key, value] of Object.entries(headers)) {
      if (ALLOWED_RESPONSE_HEADERS.has(key.toLowerCase())) {
        response.setHeader(key, value);
      }
    }

    if (!isDefined(body)) {
      response.send();

      return;
    }

    const hasContentType = isDefined(response.getHeader('content-type'));

    if (typeof body === 'string') {
      if (!hasContentType) {
        response.setHeader('content-type', 'text/plain');
      }

      response.send(body);

      return;
    }

    if (hasContentType) {
      response.send(JSON.stringify(body));

      return;
    }

    response.json(body);
  }
}
