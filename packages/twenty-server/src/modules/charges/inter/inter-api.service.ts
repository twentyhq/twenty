/* eslint-disable import/order */
import { Injectable, Logger } from '@nestjs/common';

import fs from 'fs';
import https from 'https';
import { URLSearchParams } from 'url';

import axios from 'axios';
import { join } from 'path';

@Injectable()
export class InterApiService {
  private readonly logger = new Logger('InterApiService');

  private readonly clientId = '8c3de798-88c0-4c63-9869-f8602770b8ff';
  private readonly clientSecret = '8a5f4d3e-26ea-4dbf-8333-dcf1de2039da';
  private readonly baseUrl = 'https://cdpj-sandbox.partners.uatinter.co';

  private readonly certPath = join(
    process.cwd(),
    'ssl_certs/charges/inter_certificado.crt',
  );
  private readonly keyPath = join(
    process.cwd(),
    'ssl_certs/charges/inter_chave.key',
  );

  private cachedToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  private async getHttpsAgent() {
    try {
      if (!fs.existsSync(this.certPath)) {
        throw new Error(`Certificado não encontrado em: ${this.certPath}`);
      }
      if (!fs.existsSync(this.keyPath)) {
        throw new Error(`Chave não encontrada em: ${this.keyPath}`);
      }

      const cert = fs.readFileSync(this.certPath);
      const key = fs.readFileSync(this.keyPath);

      return new https.Agent({
        cert,
        key,
        rejectUnauthorized: true,
      });
    } catch (error) {
      this.logger.error('Erro detalhado ao carregar certificados:', {
        error: error.message,
        certPath: this.certPath,
        keyPath: this.keyPath,
        currentDir: __dirname,
      });
      throw new Error('Falha ao configurar certificados SSL: ' + error.message);
    }
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now();

    if (this.cachedToken && this.tokenExpiresAt && now < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const params = new URLSearchParams();

    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'boleto-cobranca.write');

    try {
      const httpsAgent = await this.getHttpsAgent();

      const response = await axios.post(
        `${this.baseUrl}/oauth/v2/token`,
        params,
        {
          httpsAgent,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      this.cachedToken = response.data.access_token;
      this.tokenExpiresAt = now + 55 * 60 * 1000;

      return this.cachedToken || '';
    } catch (error) {
      this.logger.error('Erro ao obter token de acesso:', error);
      throw new Error('Falha na autenticação com o Banco Inter');
    }
  }

  async issueCharge(data: {
    seuNumero: string;
    valorNominal: number;
    dataVencimento: string;
    numDiasAgenda: number;
    pagador: {
      cpfCnpj: string;
      tipoPessoa: string;
      nome: string;
      cidade: string;
      telefone: string;
      uf: string;
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
    try {
      const token = await this.getAccessToken();
      const httpsAgent = await this.getHttpsAgent();

      const body = {
        seuNumero: data.seuNumero,
        valorNominal: data.valorNominal,
        dataVencimento: data.dataVencimento,
        numDiasAgenda: data.numDiasAgenda,
        pagador: {
          email: data.pagador.email,
          ddd: data.pagador.ddd,
          telefone: data.pagador.telefone,
          numero: data.pagador.numero,
          complemento: data.pagador.complemento,
          cpfCnpj: data.pagador.cpfCnpj,
          tipoPessoa: data.pagador.tipoPessoa,
          nome: data.pagador.nome,
          cidade: data.pagador.cidade,
          uf: data.pagador.uf,
          cep: data.pagador.cep,
          bairro: data.pagador.bairro,
          endereco: data.pagador.endereco,
        },
        mensagem: {
          linha1: data.mensagem?.linha1 || '',
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/cobranca/v3/cobrancas`,
        body,
        {
          httpsAgent,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(
        `Cobrança emitida com sucesso: ${JSON.stringify(response.data)}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Erro ao emitir cobrança: ${error.response?.data || error.message}`,
      );
      throw error;
    }
  }

  async cancelCharge(seuNumero: string, motivoCancelamento: string) {
    try {
      const token = await this.getAccessToken();
      const httpsAgent = await this.getHttpsAgent();

      this.logger.log(
        `Cobrança cancelada com id: ${JSON.stringify(seuNumero)}`,
      );

      const response = await axios.post(
        `${this.baseUrl}/cobranca/v3/cobrancas/${seuNumero}/cancelar`,
        { motivoCancelamento },
        {
          httpsAgent,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(
        `Cobrança cancelada com sucesso: ${JSON.stringify(response.data)}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Erro ao cancelar cobrança: ${error.response?.data || error.message}`,
      );
      throw error;
    }
  }
}
