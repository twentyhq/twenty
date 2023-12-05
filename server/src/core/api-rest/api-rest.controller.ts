import { Controller, Delete, Get, Post, Put, Req } from '@nestjs/common';

import { Request } from 'express';

import { ApiRestService } from 'src/core/api-rest/api-rest.service';

@Controller('rest/*')
export class ApiRestController {
  constructor(private readonly apiRestService: ApiRestService) {}

  @Get()
  async handleApiGet(@Req() request: Request): Promise<object> {
    const result = await this.apiRestService.get(request);

    return result.data;
  }

  @Delete()
  async handleApiDelete(@Req() request: Request): Promise<object> {
    const result = await this.apiRestService.delete(request);

    return result.data;
  }

  @Post()
  async handleApiPost(@Req() request: Request): Promise<object> {
    const result = await this.apiRestService.create(request);

    return result.data;
  }

  @Put()
  async handleApiPut(@Req() request: Request): Promise<object> {
    const result = await this.apiRestService.update(request);

    return result.data;
  }
}
