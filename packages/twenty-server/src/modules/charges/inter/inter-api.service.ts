import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import https from 'https';
import { URLSearchParams } from 'url';

import axios, { AxiosResponse } from 'axios';
import { Repository } from 'typeorm';

import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ChargeData, ChargeResponse } from 'src/modules/charges/types/inter';

@Injectable()
export class InterApiService {
  private readonly logger = new Logger(InterApiService.name);
  private readonly baseUrl = process.env.BASE_URL_INTER_SANDBOX;

  private cachedToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor(
    @InjectRepository(InterIntegration, 'core')
    private interIntegrationRepository: Repository<InterIntegration>,
    @InjectRepository(Workspace, 'core')
    private workspaceRepository: Repository<Workspace>,
  ) {}

  private formatCertificate(input: string): string {
    return input.replace(/\\n/g, '\n');
  }

  private async getIntegration(workspaceId: string): Promise<InterIntegration> {
    const integration = await this.interIntegrationRepository.findOne({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace'],
    });

    if (!integration) {
      throw new Error(
        `Inter integration not configured for workspace ${workspaceId}`,
      );
    }

    return integration;
  }

  private async getHttpsAgentFromIntegration(
    integration: InterIntegration,
  ): Promise<https.Agent> {
    if (!integration.certificate || !integration.privateKey) {
      throw new Error(
        'Certificate or private key not configured in integration',
      );
    }

    const cert = this.formatCertificate(integration.certificate);
    const key = this.formatCertificate(integration.privateKey);

    return new https.Agent({
      cert,
      key,
      rejectUnauthorized: true,
    });
  }

  private async getAccessToken(workspaceId: string): Promise<string> {
    const now = Date.now();

    if (this.cachedToken && this.tokenExpiresAt && now < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const integration = await this.getIntegration(workspaceId);

    const params = new URLSearchParams({
      client_id: integration.clientId,
      client_secret: integration.clientSecret,
      grant_type: 'client_credentials',
      scope: 'boleto-cobranca.write',
    });

    try {
      const httpsAgent = await this.getHttpsAgentFromIntegration(integration);

      const response: AxiosResponse<{ access_token: string }> =
        await axios.post(`${this.baseUrl}/oauth/v2/token`, params, {
          httpsAgent,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

      this.cachedToken = response.data.access_token;
      this.tokenExpiresAt = now + 55 * 60 * 1000;

      this.logger.log('Access token retrieved successfully');

      return this.cachedToken;
    } catch (error) {
      this.logger.error('Failed to obtain access token:', error);
      throw new Error('Authentication failed with Banco Inter');
    }
  }

  async issueCharge(
    workspaceId: string,
    data: ChargeData,
  ): Promise<ChargeResponse> {
    const integration = await this.getIntegration(workspaceId);
    const token = await this.getAccessToken(workspaceId);

    const httpsAgent = await this.getHttpsAgentFromIntegration(integration);

    const body = {
      seuNumero: data.seuNumero,
      valorNominal: data.valorNominal,
      dataVencimento: data.dataVencimento,
      numDiasAgenda: data.numDiasAgenda,
      pagador: data.pagador,
      mensagem: {
        linha1: data.mensagem?.linha1 ?? '',
      },
    };

    try {
      const response: AxiosResponse<ChargeResponse> = await axios.post(
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
        `Charge issued successfully: ${JSON.stringify(response.data)}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to issue charge: ${error.response?.data || error.message}`,
      );
      throw error;
    }
  }

  async cancelCharge(
    workspaceId: string,
    seuNumero: string,
    cancelReason: string,
  ): Promise<any> {
    const integration = await this.getIntegration(workspaceId);
    const token = await this.getAccessToken(workspaceId);
    const httpsAgent = await this.getHttpsAgentFromIntegration(integration);

    try {
      const response = await axios.post(
        `${this.baseUrl}/cobranca/v3/cobrancas/${seuNumero}/cancelar`,
        { motivoCancelamento: cancelReason },
        {
          httpsAgent,
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
    } catch (error) {
      this.logger.error(
        `Failed to cancel charge: ${error.response?.data || error.message}`,
      );
      throw error;
    }
  }
}
