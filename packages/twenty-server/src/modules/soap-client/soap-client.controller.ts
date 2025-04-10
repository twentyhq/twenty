import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ClienteEstrutura } from 'src/modules/soap-client/interfaces/cliente.interface';

import { SoapClientService } from './soap-client.service';

import { InsereContaVoipDto } from './dtos/insere-conta-voip.dto';
import { IpDeOrigemEstrutura } from './interfaces/ip-de-origem.interface';
import { RetornoEstrutura } from './interfaces/return.interface';

@Controller('api/soap-client')
@UseGuards(AuthGuard('jwt'))
export class SoapClientController {
  constructor(private readonly soapClientService: SoapClientService) {}

  @Get('call-method')
  async callMethodGet(
    @Query('method') method: string,
    @Query('params') paramsString?: string,
  ) {
    const params = paramsString ? JSON.parse(paramsString) : {};

    params.auth = this.soapClientService.createAuthStruct();

    return this.soapClientService.callMethod(method, params);
  }

  @Post('call-method')
  async callMethodPost(
    @Body('method') method: string,
    @Body('params') params: Record<string, any> = {},
  ) {
    const auth = this.soapClientService.createAuthStruct();

    params.usuario = auth.usuario;
    params.senha = auth.senha;

    return this.soapClientService.callMethod(method, params);
  }

  /**
   * Endpoint specifically for inserting IP de Origem
   */
  @Post('insere-ip-de-origem')
  async insereIpDeOrigem(
    @Body() ipData: IpDeOrigemEstrutura,
  ): Promise<RetornoEstrutura> {
    return this.soapClientService.insereIpDeOrigem(ipData);
  }

  /**
   * Endpoint specifically for inserting a new client
   */
  @Post('insere-cliente')
  async insereCliente(
    @Body() clienteData: ClienteEstrutura,
  ): Promise<RetornoEstrutura> {
    return this.soapClientService.insereCliente(clienteData);
  }

  /**
   * Endpoint specifically for inserting a VoIP account
   */
  @Post('insere-conta-voip')
  async insereContaVoip(
    @Body() dto: InsereContaVoipDto,
  ): Promise<RetornoEstrutura> {
    const {
      tabela_roteamento_id,
      tabela_preco_id,
      ddd_local,
      ...contaVoipData
    } = dto;

    return this.soapClientService.insereContaVoip(
      contaVoipData,
      tabela_roteamento_id,
      tabela_preco_id,
      ddd_local,
    );
  }
}
