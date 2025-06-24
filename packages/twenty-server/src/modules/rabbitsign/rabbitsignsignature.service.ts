import { Injectable } from '@nestjs/common';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import axios from 'axios';
import { createHash } from 'crypto';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { RabbitSignKeyService } from 'src/modules/rabbitsign/rabbitsignkey.service';
import { RabbitSignSignatureWorkspaceEntity } from './standard-objects/rabbitsignsignature.workplace-entity';

interface RabbitSignSignatureRequest {
  title: string;
  pdfBuffer: Buffer;
  signers: Array<{
    email: string;
    name: string;
    signaturePosition: {
      x: number;
      y: number;
      width: number;
      height: number;
      pageIndex: number;
    };
  }>;
}

@Injectable()
export class RabbitSignSignatureService extends TypeOrmQueryService<RabbitSignSignatureWorkspaceEntity> {
  private readonly RABBITSIGN_API_BASE_URL = 'https://www.rabbitsign.com/api/v1';

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly rabbitSignKeyService: RabbitSignKeyService,
  ) {
    super(null as any);
  }

  private getCurrentUtcTime(): string {
    return new Date().toISOString().split('.')[0] + 'Z';
  }

  private getTodayInLocalTimezone(): string {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  private sha512(input: string): string {
    return createHash('sha512').update(input, 'utf8').digest('hex').toUpperCase();
  }

  private createSignatureHeaders(
    httpMethod: string,
    path: string,
    apiKeyId: string,
    apiKeySecret: string,
  ) {
    const utcTime = this.getCurrentUtcTime();
    const signature = this.sha512(`${httpMethod} ${path} ${utcTime} ${apiKeySecret}`);

    return {
      'x-rabbitsign-api-key-id': apiKeyId,
      'x-rabbitsign-api-signature': signature,
      'x-rabbitsign-api-time-utc': utcTime,
    };
  }

  async createSignature(
    workspaceId: string,
    workspaceMemberId: string,
    signatureRequest: RabbitSignSignatureRequest,
  ) {
    const rabbitSignSignatureRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<RabbitSignSignatureWorkspaceEntity>(
        workspaceId,
        'rabbitSignSignature',
      );

    // Step 1: Create the signature record with initial status
    const signatureRecord = await rabbitSignSignatureRepository.save({
      title: signatureRequest.title,
      signatureStatus: 'PROCESSING',
      workspaceMemberId,
    });

    try {
      // Step 2: Call RabbitSign API
      const result = await this.createRabbitSignSignatureExternally(
        signatureRecord.id,
        workspaceMemberId,
        workspaceId,
        signatureRequest,
      );

      // Step 3: Update the record with success status and external data
      await rabbitSignSignatureRepository.update(
        { id: signatureRecord.id },
        { 
          signatureStatus: 'SENT_FOR_SIGNATURE',
          // You might want to store additional info like folder ID
        }
      );

      return {
        ...signatureRecord,
        signatureStatus: 'SENT_FOR_SIGNATURE',
        externalData: result,
      };

    } catch (error) {
      // Step 4: Update the record with failure status
      await rabbitSignSignatureRepository.update(
        { id: signatureRecord.id },
        { signatureStatus: 'FAILED' }
      );

      console.error('RabbitSign API Error:', error);
      
      throw new Error(
        `Failed to create RabbitSign signature: ${error?.response?.data?.message || error?.message || 'Unknown error'}`
      );
    }
  }

  private async createRabbitSignSignatureExternally(
    rabbitSignSignatureId: string,
    workspaceMemberId: string,
    workspaceId: string,
    signatureRequest: RabbitSignSignatureRequest,
  ) {
    // Get the rabbitSignKey for the workspace member
    const rabbitSignKey = await this.rabbitSignKeyService.getRabbitSignKeyForWorkspace(workspaceMemberId, workspaceId);

    const { keyId, keySecret } = rabbitSignKey;
    const { title, pdfBuffer, signers } = signatureRequest;

    // Step 1: Get upload URL
    const path1 = '/api/v1/upload-url';
    const headers1 = this.createSignatureHeaders('POST', path1, keyId, keySecret);
    
    const uploadUrlResp = await axios.post(
      `${this.RABBITSIGN_API_BASE_URL}/upload-url`,
      null,
      { headers: headers1 }
    );
    
    const uploadUrl = uploadUrlResp.data.uploadUrl;

    // Step 2: Upload PDF
    await axios.put(uploadUrl, pdfBuffer, {
      headers: { 'Content-Type': 'binary/octet-stream' }
    });

    // Step 3: Create folder (signing request)
    const path2 = '/api/v1/folder';
    const headers2 = {
      ...this.createSignatureHeaders('POST', path2, keyId, keySecret),
      'Content-Type': 'application/json',
    };

    // Build signer info object
    const signerInfo: Record<string, any> = {};
    signers.forEach((signer, index) => {
      signerInfo[signer.email] = {
        name: signer.name,
        fields: [
          {
            id: index + 1,
            type: 'SIGNATURE',
            currentValue: '',
            position: {
              docNumber: 0,
              pageIndex: signer.signaturePosition.pageIndex,
              x: signer.signaturePosition.x,
              y: signer.signaturePosition.y,
              width: signer.signaturePosition.width,
              height: signer.signaturePosition.height,
            },
          },
        ],
      };
    });

    const body2 = {
      folder: {
        title: title,
        summary: 'Sent via API',
        docInfo: [
          {
            url: uploadUrl,
            docTitle: title,
          },
        ],
        signerInfo,
      },
      date: this.getTodayInLocalTimezone(),
    };

    const folderResp = await axios.post(
      `${this.RABBITSIGN_API_BASE_URL}/folder`,
      body2,
      { headers: headers2 }
    );

    return {
      success: true,
      folderId: folderResp.data.folderId,
      uploadUrl,
      response: folderResp.data,
    };
  }

  async createSignatureWithExternalCall(input: {
    title: string;
    workspaceMemberId: string;
    workspaceId: string;
    attachmentId: string;
    pdfBuffer?: Buffer;
    signers?: Array<{
      email: string;
      name: string;
      signaturePosition: {
        x: number;
        y: number;
        width: number;
        height: number;
        pageIndex: number;
      };
    }>;
  }) {
    const rabbitSignSignatureRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<RabbitSignSignatureWorkspaceEntity>(
        input.workspaceId,
        'rabbitSignSignature',
      );

    // Step 1: Create the record
    const signatureRecord = await rabbitSignSignatureRepository.save({
      title: input.title,
      signatureStatus: 'PROCESSING',
      workspaceMemberId: input.workspaceMemberId,
      attachmentId: input.attachmentId,
    });

    const attachmentRepository = await this.twentyORMGlobalManager.getRepositoryForWorkspace<AttachmentWorkspaceEntity>(
      input.workspaceId,
      'attachment',
    );

    await attachmentRepository.save({
      id: input.attachmentId,
      signatureId: signatureRecord.id,
    });

    try {
      // Step 2: Call external API if we have the required data
      if (input.pdfBuffer && input.signers) {
        await this.createRabbitSignSignatureExternally(
          signatureRecord.id,
          input.workspaceMemberId,
          input.workspaceId,
          {
            title: input.title,
            pdfBuffer: input.pdfBuffer,
            signers: input.signers,
          },
        );
      }

      // Step 3: Update status
      await rabbitSignSignatureRepository.update(
        { id: signatureRecord.id },
        { signatureStatus: 'SENT_FOR_SIGNATURE' }
      );

      return signatureRecord;
    } catch (error) {
      // Step 4: Update status on failure
      await rabbitSignSignatureRepository.update(
        { id: signatureRecord.id },
        { signatureStatus: 'FAILED' }
      );
      throw error;
    }
  }
}