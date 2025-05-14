import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';
import https from 'https';
import { URLSearchParams } from 'url';

import axios, { AxiosResponse } from 'axios';
import { Repository } from 'typeorm';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ChargeData, ChargeResponse } from 'src/modules/charges/types/inter';

@Injectable()
export class InterApiService {
  private readonly logger = new Logger(InterApiService.name);
  private readonly baseUrl = process.env.BASE_URL_INTER_SANDBOX;

  private tokenCache: Map<string, { token: string; expiresAt: number }> =
    new Map();

  private readonly SCOPES = {
    READ: 'boleto-cobranca.read',
    WRITE: 'boleto-cobranca.write',
  } as const;

  constructor(
    @InjectRepository(InterIntegration, 'core')
    private interIntegrationRepository: Repository<InterIntegration>,
    @InjectRepository(Workspace, 'core')
    private workspaceRepository: Repository<Workspace>,
    private readonly fileStorageService: FileStorageService,
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

  private async getAccessToken(
    workspaceId: string,
    scope: string,
  ): Promise<string> {
    const now = Date.now();
    const cacheKey = `${workspaceId}_${scope}`;

    const cached = this.tokenCache.get(cacheKey);

    if (cached && now < cached.expiresAt) {
      return cached.token;
    }

    const integration = await this.getIntegration(workspaceId);

    const params = new URLSearchParams({
      client_id: integration.clientId,
      client_secret: integration.clientSecret,
      grant_type: 'client_credentials',
      scope,
    });

    try {
      const httpsAgent = await this.getHttpsAgentFromIntegration(integration);

      const response: AxiosResponse<{ access_token: string }> =
        await axios.post(`${this.baseUrl}/oauth/v2/token`, params, {
          httpsAgent,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

      this.tokenCache.set(cacheKey, {
        token: response.data.access_token,
        expiresAt: now + 55 * 60 * 1000, // 55 minutos
      });

      this.logger.log(`Access token for scope ${scope} retrieved successfully`);

      return response.data.access_token;
    } catch (error) {
      this.logger.error(
        `Failed to obtain access token for scope ${scope}:`,
        error,
      );
      throw new Error(
        `Authentication failed with Banco Inter for scope ${scope}`,
      );
    }
  }

  async issueCharge(
    workspaceId: string,
    data: ChargeData,
  ): Promise<ChargeResponse> {
    const integration = await this.getIntegration(workspaceId);
    const token = await this.getAccessToken(workspaceId, this.SCOPES.WRITE);

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

      const requestCode = response?.data?.codigoSolicitacao || '';

      await this.getChargePdf(workspaceId, requestCode);

      return response?.data;
    } catch (error) {
      this.logger.error(
        `Failed to issue charge: ${error.response?.data || error.message}`,
        error.stack,
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
    const token = await this.getAccessToken(workspaceId, this.SCOPES.WRITE);
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
        error.stack,
      );
      throw error;
    }
  }

  async getChargePdf(
    workspaceId: string,
    seuNumero: string,
  ): Promise<ArrayBuffer> {
    if (!seuNumero) {
      throw new Error('seuNumero is required to retrieve charge PDF');
    }

    const integration = await this.getIntegration(workspaceId);
    const token = await this.getAccessToken(workspaceId, this.SCOPES.READ);
    const httpsAgent = await this.getHttpsAgentFromIntegration(integration);

    this.logger.log('PDF - TOKENN INTER', token);
    this.logger.log('PDF -SEU NUMERO INTER', seuNumero);

    try {
      const response = await axios.get(
        `${this.baseUrl}/cobranca/v3/cobrancas/${seuNumero}/pdf`,
        {
          httpsAgent,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response?.data?.pdf;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve charge PDF for seuNumero=${seuNumero}: ${error.response?.data || error.message}`,
        error.stack,
      );

      if (error.response) {
        this.logger.error(`Error details:`, {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      }

      throw new Error(`Failed to retrieve PDF: ${error.message}`);
    }
  }

  async issueChargeAndStoreAttachment(
    workspaceId: string,
    attachmentRepository: Repository<any>,
    data: ChargeData,
  ): Promise<ChargeResponse> {
    this.logger.log(
      `Iniciando emissão de charge para workspace ${workspaceId}`,
    );
    this.logger.log('Dados da charge:', data);

    const integration = await this.getIntegration(workspaceId);
    const token = await this.getAccessToken(workspaceId, this.SCOPES.WRITE);
    const httpsAgent = await this.getHttpsAgentFromIntegration(integration);

    const body = {
      seuNumero: data.seuNumero,
      valorNominal: data.valorNominal,
      dataVencimento: data.dataVencimento,
      numDiasAgenda: data.numDiasAgenda,
      pagador: data.pagador,
      mensagem: { linha1: data.mensagem?.linha1 ?? '-' },
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

      const requestCode = response?.data?.codigoSolicitacao || '';
      const pdfBuffer = await this.getChargePdf(workspaceId, requestCode);

      const filename = `${randomUUID()}_boleto.pdf`;
      const folder = 'attachment';

      // ✅ Salva o arquivo no storage
      await this.fileStorageService.write({
        file: Buffer.from(pdfBuffer),
        name: filename,
        folder,
        mimeType: 'application/pdf',
      });

      await attachmentRepository.save({
        name: filename,
        fullPath: `${folder}/${filename}`, // <--- caminho relativo para acesso posterior
        type: 'TextDocument',
        authorId: data.authorId,
        chargeId: data.id,
      });

      this.logger.log(`Attachment salvo com sucesso: ${folder}/${filename}`);

      return response.data;
    } catch (error) {
      this.logger.error('Erro na emissão da cobrança e armazenamento do PDF:', {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
