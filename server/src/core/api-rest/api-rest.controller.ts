import { Controller, Get, Req } from '@nestjs/common';

import { Request } from 'express';

import { ApiRestService } from 'src/core/api-rest/api-rest.service';

@Controller('rest/*')
export class ApiRestController {
  constructor(private readonly apiRestService: ApiRestService) {}
  @Get()
  async handleApiGet(@Req() request: Request): Promise<object> {
    const result = await this.apiRestService.callGraphql(request);
    return result.data;
  }
}
