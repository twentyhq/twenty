import { Injectable, Logger } from '@nestjs/common';

import axios from 'axios';

@Injectable()
export class InterApiService {
  private readonly logger = new Logger('InterApiService');

  private readonly clientId = '8c3de798-88c0-4c63-9869-f8602770b8ff';
  private readonly clientSecret = '8a5f4d3e-26ea-4dbf-8333-dcf1de2039da';
  private readonly baseUrl = 'https://cdpj-sandbox.partners.uatinter.co';

  private cachedToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  private async getAccessToken(): Promise<string> {
    const now = Date.now();

    if (this.cachedToken && this.tokenExpiresAt && now < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const params = new URLSearchParams();

    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'pagamento-boleto.write');

    const response = await axios.post(
      `${this.baseUrl}/oauth/v2/token`,
      params,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    this.cachedToken = response.data.access_token;
    this.tokenExpiresAt = now + 55 * 60 * 1000;

    return this.cachedToken || '';
  }

  async issueCharge(data: {
    seuNumero: string;
    valorNominal: number;
    dataVencimento: string;
    numDiasAgenda: number;
    pagador: {
      cpfCnpj: string;
      tipoPessoa: 'FISICA' | 'JURIDICA';
      nome: string;
      cidade: string;
      telefone: string;
      uf:
        | 'AC'
        | 'AL'
        | 'AP'
        | 'AM'
        | 'BA'
        | 'CE'
        | 'DF'
        | 'ES'
        | 'GO'
        | 'MA'
        | 'MT'
        | 'MS'
        | 'MG'
        | 'PA'
        | 'PB'
        | 'PR'
        | 'PE'
        | 'PI'
        | 'RJ'
        | 'RN'
        | 'RS'
        | 'RO'
        | 'RR'
        | 'SC'
        | 'SP'
        | 'SE'
        | 'TO';
      cep: string;
      email: string;
      ddd: string;
      numero: string;
      complemento: string;
      endereco: string;
      bairro: string;
    };
    mensagem?: {
      linha1?: string;
    };
  }): Promise<{ codigoSolicitacao: string }> {
    const token = await this.getAccessToken();
    //const token = 'bc09997e-9f65-49cd-a648-ec6112793480';
    const body = {
      seuNumero: data.seuNumero,
      valorNominal: data.valorNominal,
      dataVencimento: data.dataVencimento,
      numDiasAgenda: 60,
      pagador: {
        cpfCnpj: data.pagador.cpfCnpj,
        tipoPessoa: data.pagador.tipoPessoa,
        nome: data.pagador.nome,
        cidade: data.pagador.cidade,
        uf: data.pagador.uf,
        cep: data.pagador.cep,
        telefone: data.pagador.telefone,
        ddd: data.pagador.ddd,
        bairro: data.pagador.bairro,
        endereco: data.pagador.endereco,
        email: data.pagador.email,
        complemento: data.pagador.complemento,
        numero: data.pagador.numero,
      },
      mensagem: {
        linha1: data.mensagem?.linha1 || '',
      },
    };

    const response = await axios.post(
      `${this.baseUrl}/cobranca/v3/cobrancas`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    this.logger.log(
      `Charge issued successfully: ${JSON.stringify(response.data)}`,
    );

    return response.data;
  }

  async cancelCharge(seuNumero: string, motivoCancelamento: string) {
    const token = await this.getAccessToken();

    const response = await axios.post(
      `${this.baseUrl}/cobranca/v3/cobrancas/${seuNumero}`,
      { motivoCancelamento },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    this.logger.log(
      `Charge cancelled successfully: ${JSON.stringify(response.data)}`,
    );

    return response.data;
  }
}
