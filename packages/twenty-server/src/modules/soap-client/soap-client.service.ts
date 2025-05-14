import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as soap from 'soap';

import { AuthEstrutura } from './interfaces/auth.interface';
import { ClienteEstrutura } from './interfaces/cliente.interface';
import { ContaVoipEstrutura } from './interfaces/conta-voip.interface';
import { IpDeOrigemEstrutura } from './interfaces/ip-de-origem.interface';
import { RetornoEstrutura } from './interfaces/return.interface';

@Injectable()
export class SoapClientService {
  private readonly wsdlUrl =
    'https://log.kvoip.com.br/webservice/index.php?WSDL';
  private readonly logger = new Logger(SoapClientService.name);

  constructor(private readonly configService: ConfigService) {}

  async callMethod(methodName: string, params: any): Promise<any> {
    try {
      const client = await soap.createClientAsync(this.wsdlUrl);

      const result = await client[methodName + 'Async'](params);

      this.logger.log('result', result[0].return);

      return result[0];
    } catch (error) {
      this.logger.error(`Error calling SOAP method ${methodName}:`, error);
      throw error;
    }
  }

  createAuthStruct(): AuthEstrutura {
    return {
      usuario: this.configService.get('SOAP_USERNAME') || '',
      senha: this.configService.get('SOAP_PASSWORD') || '',
    };
  }

  async insereIpDeOrigem(
    ipData: IpDeOrigemEstrutura,
  ): Promise<RetornoEstrutura> {
    const auth = this.createAuthStruct();

    const params = {
      auth,
      obj: ipData,
    };

    try {
      const result = await this.callMethod('InsereIpDeOrigem', params);

      return result.return as RetornoEstrutura;
    } catch (error) {
      this.logger.error('Error inserting IP de origem:', error);
      throw error;
    }
  }

  async insereCliente(
    clienteData: ClienteEstrutura,
  ): Promise<RetornoEstrutura> {
    const auth = this.createAuthStruct();

    const params = {
      auth,
      obj: clienteData,
    };

    try {
      const result = await this.callMethod('InsereCliente', params);

      return result.return as RetornoEstrutura;
    } catch (error) {
      this.logger.error('Error inserting cliente:', error);
      throw error;
    }
  }

  async insereContaVoip(
    contaVoipData: ContaVoipEstrutura,
    tabela_roteamento_id: number,
    tabela_preco_id: number,
    ddd_local: number,
  ): Promise<RetornoEstrutura> {
    const auth = this.createAuthStruct();

    const params = {
      auth,
      obj: contaVoipData,
      tabela_roteamento_id,
      tabela_preco_id,
      ddd_local,
    };

    try {
      const result = await this.callMethod('InsereContaVoip', params);

      return result.return as RetornoEstrutura;
    } catch (error) {
      this.logger.error('Error inserting conta voip:', error);
      throw error;
    }
  }

  /**
   * Create a complete client setup with client, VoIP account, and IP origin
   */
  async createCompleteClient(
    clienteData: ClienteEstrutura,
    contaVoipData: Omit<ContaVoipEstrutura, 'cliente_id'>,
    ipData: Omit<IpDeOrigemEstrutura, 'cliente_id'>,
    tabela_roteamento_id: number,
    tabela_preco_id: number,
    ddd_local: number,
  ): Promise<{
    cliente: RetornoEstrutura & { id?: number };
    contaVoip: RetornoEstrutura;
    ipDeOrigem: RetornoEstrutura;
  }> {
    try {
      // Step 1: Create client
      const clienteResult = await this.insereCliente(clienteData);

      if (!clienteResult.status) {
        throw new Error(`Failed to create client: ${clienteResult.erro}`);
      }

      // Extract client ID from result
      const clienteId = clienteResult['id'] as number;

      this.logger.log(`Client created with ID: ${clienteId}`);

      // Step 2: Create VoIP account
      const fullContaVoipData = {
        ...contaVoipData,
        cliente_id: clienteId,
      };

      const contaVoipResult = await this.insereContaVoip(
        fullContaVoipData,
        tabela_roteamento_id,
        tabela_preco_id,
        ddd_local,
      );

      if (!contaVoipResult.status) {
        throw new Error(
          `Failed to create VoIP account: ${contaVoipResult.erro}`,
        );
      }

      // Step 3: Create IP origin
      const fullIpData = {
        ...ipData,
        cliente_id: clienteId,
      };

      const ipResult = await this.insereIpDeOrigem(fullIpData);

      if (!ipResult.status) {
        throw new Error(`Failed to create IP origin: ${ipResult.erro}`);
      }

      return {
        cliente: { ...clienteResult, id: clienteId },
        contaVoip: contaVoipResult,
        ipDeOrigem: ipResult,
      };
    } catch (error) {
      this.logger.error('Error in createCompleteClient:', error);
      throw error;
    }
  }
}
