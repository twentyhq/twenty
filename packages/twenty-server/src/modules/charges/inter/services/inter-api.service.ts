import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';
import https from 'https';
import { URLSearchParams } from 'url';

import axios, { AxiosResponse, isAxiosError } from 'axios';
import { Repository } from 'typeorm';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import { InterGetChargePDFResponse } from 'src/engine/core-modules/inter/interfaces/charge.interface';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { ChargeData, ChargeResponse } from 'src/modules/charges/types/inter';

@Injectable()
export class InterApiService {
  private readonly logger = new Logger(InterApiService.name);

  private readonly TOKEN_CACHE_TTL = 55 * 60 * 1000; // 55 minutes in ms

  private readonly baseUrl: string;

  private readonly SCOPES = {
    READ: 'boleto-cobranca.read',
    WRITE: 'boleto-cobranca.write',
  } as const;

  constructor(
    @InjectRepository(InterIntegration, 'core')
    private interIntegrationRepository: Repository<InterIntegration>,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly fileUploadService: FileUploadService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleCharge)
    private readonly cacheStorage: CacheStorageService,
  ) {
    this.baseUrl = this.twentyConfigService.get('INTER_BASE_URL');
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

    // TODO: This shouldn't be stored as plain text on to the database
    const cert = this.formatCertificate(integration.certificate);
    const key = this.formatCertificate(integration.privateKey);

    return new https.Agent({
      cert,
      key,
      rejectUnauthorized: true,
    });
  }

  private async getAccessToken({
    scope,
    workspaceId,
    integrationId,
  }: {
    workspaceId: string;
    integrationId: string;
    scope: string;
  }): Promise<string> {
    const now = Date.now();
    const cacheKey = `inter-api-token:${workspaceId}:${integrationId}:${scope}`;

    // Try to get from Redis-backed cache
    const cached = await this.cacheStorage.get<{
      token: string;
      expiresAt: number;
    }>(cacheKey);

    if (cached && now < cached.expiresAt) {
      this.logger.log('Returning cached token from Redis');

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

      const tokenData = {
        token: response.data.access_token,
        expiresAt: now + this.TOKEN_CACHE_TTL,
      };

      await this.cacheStorage.set(cacheKey, tokenData, this.TOKEN_CACHE_TTL);

      this.logger.log(
        `Access token for scope ${scope} retrieved successfully and cached in Redis`,
      );

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

  private formatCertificate(input: string): string {
    return input.replace(/\\n/g, '\n');
  }

  private extractFullPathFromFilePath(path: string) {
    /**
     * Gets the path with a generated token and removes the token from it
     * Expected input: "/charge-bill/0b954839-fda6-43ca-8120-9a9e5f3f4878.pdf?token=eyJhbGciOiJ..."
     * output: /charge-bill/0b954839-fda6-43ca-8120-9a9e5f3f4878.pdf
     */
    const matchRegex = /([^?]+)/;

    return path.match(matchRegex)?.[1];
  }

  // TODO: Not beeing used, either useit or remove.
  async issueCharge(
    workspaceId: string,
    integrationId: string,
    data: ChargeData,
  ): Promise<ChargeResponse> {
    const integration = await this.getIntegration(workspaceId);
    const token = await this.getAccessToken({
      workspaceId,
      integrationId,
      scope: this.SCOPES.WRITE,
    });

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

      await this.getChargePdf({
        integration,
        workspaceId,
        seuNumero: requestCode,
      });

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
  ): Promise<void> {
    const integration = await this.getIntegration(workspaceId);

    const token = await this.getAccessToken({
      workspaceId,
      integrationId: integration.id,
      scope: this.SCOPES.WRITE,
    });
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

  async getChargePdf({
    integration,
    workspaceId,
    seuNumero,
  }: {
    integration: InterIntegration;
    workspaceId: string;
    seuNumero: string;
  }): Promise<string> {
    const token = await this.getAccessToken({
      workspaceId,
      scope: this.SCOPES.READ,
      integrationId: integration.id,
    });

    const httpsAgent = await this.getHttpsAgentFromIntegration(integration);

    try {
      const response = await axios.get<InterGetChargePDFResponse>(
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
    attachmentRepository: Repository<AttachmentWorkspaceEntity>,
    data: ChargeData,
  ): Promise<ChargeResponse> {
    this.logger.log(
      `Iniciando emissão de charge para workspace ${workspaceId}`,
    );

    const integration = await this.getIntegration(workspaceId);
    const token = await this.getAccessToken({
      workspaceId,
      integrationId: integration.id,
      scope: this.SCOPES.WRITE,
    });
    const httpsAgent = await this.getHttpsAgentFromIntegration(integration);

    const body = {
      seuNumero: data.seuNumero,
      valorNominal: data.valorNominal,
      dataVencimento: data.dataVencimento,
      numDiasAgenda: data.numDiasAgenda,
      pagador: data.pagador,
      // mensagem: { linha1: data.mensagem?.linha1 ?? '-' },
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
      const pdfBuffer = await this.getChargePdf({
        workspaceId,
        integration,
        seuNumero: requestCode,
      });

      const filename = `${randomUUID()}_boleto.pdf`;
      const folder = 'attachment';

      const fileFolder = FileFolder.ChargeBill;

      const { files } = await this.fileUploadService.uploadFile({
        file: Buffer.from(pdfBuffer, 'base64'),
        fileFolder,
        workspaceId,
        filename: `bolepix-${requestCode}-${workspaceId}.pdf`,
        mimeType: 'application/pdf',
      });

      const path = files[0].path;

      const fullPath = this.extractFullPathFromFilePath(path);

      if (!fullPath)
        throw new Error(`Failed to extract full path from file path: ${path}`);

      await attachmentRepository.save({
        name: filename,
        fullPath: this.extractFullPathFromFilePath(path), // <--- caminho relativo para acesso posterior
        type: 'TextDocument',
        chargeId: data.id,
      });

      this.logger.log(`Attachment salvo com sucesso: ${folder}/${filename}`);

      return response.data;
    } catch (error) {
      const isInterApiError = isAxiosError(error);

      const message = isInterApiError
        ? error.response?.data
        : error.message || 'Unknown error';

      if (isInterApiError) {
        throw new Error(
          `Failed to issue charge and store attachment for workspace ${workspaceId} using: ${JSON.stringify(body, null, '\t')}\nError: ${JSON.stringify(message, null, '\t')}`,
        );
      }

      throw new InternalServerErrorException(message, {
        cause: error,
        description: `Failed to issue charge and store attachment for workspace ${workspaceId} using: ${JSON.stringify(body)}`,
      });
    }
  }
}
