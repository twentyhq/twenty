import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { SoapClientService } from './soap-client.service';

@Controller('api/soap-client')
@UseGuards(AuthGuard('jwt'))
export class SoapClientController {
  constructor(private readonly soapClientService: SoapClientService) {}

  @Get('call-method')
  async callMethodGet(
    @Query('method') method: string,
    @Query('params') paramsString?: string,
  ) {
    console.log('callMethodGet', method, paramsString);

    const params = paramsString ? JSON.parse(paramsString) : {};

    // Add auth structure for all requests
    params.auth = this.soapClientService.createAuthStruct();

    return this.soapClientService.callMethod(method, params);
  }

  @Post('call-method')
  async callMethodPost(
    @Body('method') bodyMethod: string,
    @Body('params') bodyParams: Record<string, any> = {},
    @Query('method') queryMethod?: string,
    @Query('params') queryParamsString?: string,
  ) {
    console.log('callMethodPost body:', bodyMethod, bodyParams);
    console.log('callMethodPost query:', queryMethod, queryParamsString);

    // Use body params if available, otherwise use query params
    let method = bodyMethod;
    let params = bodyParams;

    // If method is not in body but is in query, use query parameters
    if (!method && queryMethod) {
      method = queryMethod;
      params = queryParamsString ? JSON.parse(queryParamsString) : {};
    }

    console.log('callMethodPost final:', method, params);

    // Add auth structure for all requests
    params.auth = this.soapClientService.createAuthStruct();

    return this.soapClientService.callMethod(method, params);
  }
}
