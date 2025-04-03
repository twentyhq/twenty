import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as soap from 'soap';

import { AuthEstrutura } from './interfaces/auth.interface';

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

      return result[0];
    } catch (error) {
      this.logger.error(`Error calling SOAP method ${methodName}:`, error);
      throw error;
    }
  }

  /**
   * Creates the authentication structure required for SOAP requests
   */
  createAuthStruct(): AuthEstrutura {
    return {
      usuario: this.configService.get('SOAP_USERNAME') || '',
      senha: this.configService.get('SOAP_PASSWORD') || '',
    };
  }
}
