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
import { Args } from '@nestjs/graphql';

import { Request } from 'express';

import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { RouteService } from 'src/engine/metadata-modules/route/route.service';
import { HTTPMethod } from 'src/engine/metadata-modules/route/route.entity';

@Controller('s')
@UseGuards(PublicEndpointGuard)
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get('*')
  async get(@Args('origin') origin: string, @Req() request: Request) {
    return await this.routeService.handle({
      origin,
      request,
      httpMethod: HTTPMethod.Get,
    });
  }

  @Post('*')
  async post(@Args('origin') origin: string, @Req() request: Request) {
    return await this.routeService.handle({
      origin,
      request,
      httpMethod: HTTPMethod.Get,
    });
  }

  @Put('*')
  async put(@Args('origin') origin: string, @Req() request: Request) {
    return await this.routeService.handle({
      origin,
      request,
      httpMethod: HTTPMethod.Get,
    });
  }

  @Patch('*')
  async patch(@Args('origin') origin: string, @Req() request: Request) {
    return await this.routeService.handle({
      origin,
      request,
      httpMethod: HTTPMethod.Get,
    });
  }

  @Delete('*')
  async delete(@Args('origin') origin: string, @Req() request: Request) {
    return await this.routeService.handle({
      origin,
      request,
      httpMethod: HTTPMethod.Get,
    });
  }
}
