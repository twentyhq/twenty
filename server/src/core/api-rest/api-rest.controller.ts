import { Controller, Delete, Get, Post, Put, Req, Res } from '@nestjs/common';

import { Request, Response } from 'express';

import { ApiRestService } from 'src/core/api-rest/api-rest.service';
import { ApiRestResponse } from 'src/core/api-rest/types/api-rest-response.type';

const handleResult = (res: Response, result: ApiRestResponse) => {
  if (result.data.error) {
    res
      .status(result.data.status || 400)
      .send({ error: `${result.data.error}` });
  } else {
    res.send(result.data);
  }
};

@Controller('rest/*')
export class ApiRestController {
  constructor(private readonly apiRestService: ApiRestService) {}

  @Get()
  async handleApiGet(@Req() request: Request, @Res() res: Response) {
    handleResult(res, await this.apiRestService.get(request));
  }

  @Delete()
  async handleApiDelete(@Req() request: Request, @Res() res: Response) {
    handleResult(res, await this.apiRestService.delete(request));
  }

  @Post()
  async handleApiPost(@Req() request: Request, @Res() res: Response) {
    handleResult(res, await this.apiRestService.create(request));
  }

  @Put()
  async handleApiPut(@Req() request: Request, @Res() res: Response) {
    handleResult(res, await this.apiRestService.update(request));
  }
}
