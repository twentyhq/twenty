import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { RouteService } from 'src/engine/metadata-modules/route/route.service';
import { HTTPMethod } from 'src/engine/metadata-modules/route/route.entity';
import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';

@Controller('s/:workspaceId')
@UseGuards(PublicEndpointGuard)
@UseFilters(RestApiExceptionFilter)
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get('*')
  async get(
    @Param('workspaceId') workspaceId: string,
    @Req() request: Request,
  ) {
    return await this.routeService.handle({
      workspaceId,
      request,
      httpMethod: HTTPMethod.GET,
    });
  }

  @Post('*')
  async post(
    @Param('workspaceId') workspaceId: string,
    @Req() request: Request,
  ) {
    return await this.routeService.handle({
      workspaceId,
      request,
      httpMethod: HTTPMethod.POST,
    });
  }

  @Put('*')
  async put(
    @Param('workspaceId') workspaceId: string,
    @Req() request: Request,
  ) {
    return await this.routeService.handle({
      workspaceId,
      request,
      httpMethod: HTTPMethod.PUT,
    });
  }

  @Patch('*')
  async patch(
    @Param('workspaceId') workspaceId: string,
    @Req() request: Request,
  ) {
    return await this.routeService.handle({
      workspaceId,
      request,
      httpMethod: HTTPMethod.PATCH,
    });
  }

  @Delete('*')
  async delete(
    @Param('workspaceId') workspaceId: string,
    @Req() request: Request,
  ) {
    return await this.routeService.handle({
      workspaceId,
      request,
      httpMethod: HTTPMethod.DELETE,
    });
  }
}
