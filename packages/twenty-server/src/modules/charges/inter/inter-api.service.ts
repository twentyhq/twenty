/* eslint-disable import/order */
import { Injectable, Logger } from '@nestjs/common';

import https from 'https';
import { URLSearchParams } from 'url';

import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InterApiService {
  constructor(
    @InjectRepository(InterIntegration, 'core')
    private interIntegrationRepository: Repository<InterIntegration>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  private readonly logger = new Logger('InterApiService');
  private readonly baseUrl = 'https://cdpj-sandbox.partners.uatinter.co';

  private cachedToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  private async getHttpsAgentFromIntegration(integration: InterIntegration) {
    try {
      if (!integration.certificate || !integration.privateKey) {
        throw new Error(
          'Certificado ou chave privada não configurados na integração',
        );
      }

      const cert = integration.certificate.replace(/\\n/g, '\n');
      const key = integration.privateKey.replace(/\\n/g, '\n');

      return new https.Agent({
        cert,
        key,
        rejectUnauthorized: true,
      });
    } catch (error) {
      this.logger.error(
        'Erro ao configurar certificados da integração:',
        error.message,
      );
      throw new Error('Falha ao configurar certificados SSL: ' + error.message);
    }
  }

  private async getAccessToken(workspaceId: string): Promise<string> {
    const now = Date.now();

    if (this.cachedToken && this.tokenExpiresAt && now < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const integration = await this.interIntegrationRepository.findOne({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace'],
    });

    if (!integration) {
      throw new Error(
        `Integração Inter não configurada para o workspace ${workspaceId}`,
      );
    }

    const params = new URLSearchParams();

    params.append('client_id', integration.clientId);
    params.append('client_secret', integration.clientSecret);
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'boleto-cobranca.write');

    try {
      const httpsAgent = await this.getHttpsAgentFromIntegration(integration);

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

  async issueCharge(
    workspaceId: string,
    data: {
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
    },
  ): Promise<{ codigoSolicitacao: string }> {
    try {
      const token = await this.getAccessToken(workspaceId);
      const integration = await this.interIntegrationRepository.findOne({
        where: { workspace: { id: workspaceId } },
        relations: ['workspace'],
      });

      if (!integration) {
        throw new Error(
          `Integração Inter não configurada para o workspace ${workspaceId}`,
        );
      }

      if (!token) {
        throw new Error(`Token de autenticação não emitido ${workspaceId}`);
      }

      const httpsAgent = await this.getHttpsAgentFromIntegration(integration);

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

  async cancelCharge(
    workspaceId: string,
    seuNumero: string,
    motivoCancelamento: string,
  ) {
    try {
      const token = await this.getAccessToken(workspaceId);
      const integration = await this.interIntegrationRepository.findOne({
        where: { workspace: { id: workspaceId } },
        relations: ['workspace'],
      });

      if (!integration) {
        throw new Error(
          `Integração Inter não configurada para o workspace ${workspaceId}`,
        );
      }

      const httpsAgent = await this.getHttpsAgentFromIntegration(integration);

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
