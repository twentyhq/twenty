import { Injectable, Logger } from '@nestjs/common';

import { createHmac } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import axios from 'axios';

import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  GetInvoiceFileResponse,
  SINVOICE_FILE_STATUS,
  SINVOICE_FILE_TYPE,
} from 'src/mkt-core/invoice/invoice.constants';
import { MktSInvoiceFileWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice-file.workspace-entity';

@Injectable()
@WorkspaceQueryHook('mktSInvoiceFile.updateOne')
export class MktSInvoiceFileUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  private readonly logger = new Logger(
    MktSInvoiceFileUpdateOnePreQueryHook.name,
  );

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async execute(
    _authContext: AuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<MktSInvoiceFileWorkspaceEntity>,
  ): Promise<UpdateOneResolverArgs<MktSInvoiceFileWorkspaceEntity>> {
    const input = payload?.data;
    const fileId = payload?.id;
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    this.logger.log(`Updating SInvoiceFile: ${fileId}`);

    if (!fileId || !workspaceId || !input?.status) {
      return payload;
    }

    // Only process when status is being changed to GETTING
    if (input.status !== SINVOICE_FILE_STATUS.GETTING) {
      return payload;
    }

    try {
      // Get current file data to check if we have required information
      const fileRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktSInvoiceFileWorkspaceEntity>(
          workspaceId,
          'mktSInvoiceFile',
          { shouldBypassPermissionChecks: true },
        );

      const currentFile = await fileRepository.findOne({
        where: { id: fileId },
      });

      if (!currentFile) {
        this.logger.warn(`SInvoiceFile not found with ID: ${fileId}`);

        return payload;
      }

      // Check if we have the required information for API call
      if (
        !currentFile.supplierTaxCode ||
        !currentFile.invoiceNo ||
        !currentFile.templateCode
      ) {
        this.logger.warn(
          `SInvoiceFile missing required fields for API call: ${fileId}`,
        );

        // Update with error status
        const errorInput = {
          ...input,
          status: SINVOICE_FILE_STATUS.ERROR,
          errorMessage:
            'Missing required fields: supplierTaxCode, invoiceNo, or templateCode',
        };

        return {
          ...payload,
          data: errorInput,
        };
      }

      // Call Viettel API to get invoice file
      const apiResponse = await this.callViettelInvoiceAPI({
        supplierTaxCode: currentFile.supplierTaxCode,
        invoiceNo: currentFile.invoiceNo,
        templateCode: currentFile.templateCode,
        fileType: currentFile.fileType || SINVOICE_FILE_TYPE.PDF,
      });

      if (apiResponse.errorCode === 200 && apiResponse.fileToBytes) {
        // Save file to server filesystem
        const savedFileInfo = await this.saveFileToServer(
          apiResponse,
          currentFile,
        );

        if (savedFileInfo) {
          // Success - update with file information
          const updatedInput = {
            ...input,
            status: SINVOICE_FILE_STATUS.SUCCESS,
            fileName: savedFileInfo.fileName,
            fileSize: savedFileInfo.fileSize,
            filePath: savedFileInfo.filePath,
            downloadUrl: savedFileInfo.downloadUrl,
            errorMessage: undefined,
          };

          this.logger.log(
            `[S-INVOICE FILE HOOK] Successfully retrieved and saved file for SInvoiceFile: ${fileId}`,
          );

          return {
            ...payload,
            data: updatedInput,
          };
        } else {
          // Failed to save file
          const errorInput = {
            ...input,
            status: SINVOICE_FILE_STATUS.ERROR,
            errorMessage: 'Failed to save file to server',
          };

          return {
            ...payload,
            data: errorInput,
          };
        }
      } else {
        // API returned error
        const errorInput = {
          ...input,
          status: SINVOICE_FILE_STATUS.FAILED,
          errorMessage:
            apiResponse.description ||
            'Failed to retrieve invoice file from Viettel API',
        };

        this.logger.error(
          `[S-INVOICE FILE HOOK] API error for SInvoiceFile: ${fileId}`,
          apiResponse,
        );

        return {
          ...payload,
          data: errorInput,
        };
      }
    } catch (error) {
      this.logger.error(
        `[S-INVOICE FILE HOOK] Failed to process SInvoiceFile: ${fileId}`,
        error,
      );

      // Update with error status
      const errorInput = {
        ...input,
        status: SINVOICE_FILE_STATUS.ERROR,
        errorMessage: `Failed to retrieve invoice file: ${error.message}`,
      };

      return {
        ...payload,
        data: errorInput,
      };
    }
  }

  private async callViettelInvoiceAPI(request: {
    supplierTaxCode: string;
    invoiceNo: string;
    templateCode: string;
    fileType: string;
  }): Promise<GetInvoiceFileResponse> {
    const baseUrl =
      process.env.S_INVOICE_BASE_URL || 'https://api-vinvoice.viettel.vn';
    const apiUrl = `${baseUrl}/services/einvoiceapplication/api/InvoiceAPI/InvoiceUtilsWS/getInvoiceRepresentationFile`;
    const authorization =
      process.env.S_INVOICE_AUTHORIZATION || 'Basic 123456abcdeg123456abcdeg';

    const requestData = {
      supplierTaxCode: request.supplierTaxCode,
      invoiceNo: request.invoiceNo,
      templateCode: request.templateCode,
      fileType: request.fileType,
    };

    this.logger.log(
      `[VIETTEL API] Calling API with data: ${JSON.stringify(requestData)}`,
    );

    try {
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization,
        },
        timeout: 30000, // 30 seconds timeout
      });

      this.logger.log(`[VIETTEL API] Response status: ${response.status}`);

      return response.data;
    } catch (error) {
      this.logger.error(`[VIETTEL API] API call failed:`, error);

      // Return error response in expected format
      return {
        errorCode: error.response?.status || 500,
        description: error.response?.data?.description || error.message,
        fileToBytes: '',
      };
    }
  }

  private async saveFileToServer(
    apiResponse: GetInvoiceFileResponse,
    currentFile: MktSInvoiceFileWorkspaceEntity,
  ): Promise<{
    fileName: string;
    fileSize: number;
    filePath: string;
    downloadUrl: string;
  } | null> {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir =
        process.env.FILE_UPLOAD_PATH ||
        path.join(process.cwd(), 'uploads', 'invoice-files');

      this.logger.log(`[FILE SAVE] Upload directory: ${uploadsDir}`);

      if (!fs.existsSync(uploadsDir)) {
        this.logger.log(`[FILE SAVE] Creating directory: ${uploadsDir}`);
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate file name with timestamp to avoid conflicts
      const fileExtension = currentFile.fileType?.toLowerCase() || 'pdf';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${currentFile.invoiceNo}.${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      this.logger.log(`[FILE SAVE] Saving file to: ${filePath}`);

      // Decode base64 content and save to file
      const fileBuffer = Buffer.from(apiResponse.fileToBytes, 'base64');

      fs.writeFileSync(filePath, fileBuffer);

      // Verify file was created
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);

        this.logger.log(
          `[FILE SAVE] File created successfully. Size: ${stats.size} bytes`,
        );
      } else {
        this.logger.error(`[FILE SAVE] File was not created at: ${filePath}`);

        return null;
      }

      // Generate time-limited download URL
      const secretKey =
        process.env.FILE_DOWNLOAD_SECRET || 'default-secret-key';
      const expiresIn = parseInt(process.env.FILE_DOWNLOAD_EXPIRES || '30'); // 30 seconds for testing
      const expires = Math.floor(Date.now() / 1000) + expiresIn;
      const signature = this.generateSignature(
        fileName,
        expires.toString(),
        secretKey,
      );
      const downloadUrl =
        process.env.SERVER_URL +
        `/api/files/invoice-files/${fileName}?expires=${expires}&signature=${signature}`;

      this.logger.log(`[FILE SAVE] Successfully saved file: ${filePath}`);

      return {
        fileName,
        fileSize: fileBuffer.length,
        filePath,
        downloadUrl,
      };
    } catch (error) {
      this.logger.error(`[FILE SAVE] Failed to save file:`, error);

      return null;
    }
  }

  private generateSignature(
    fileName: string,
    expires: string,
    secretKey: string,
  ): string {
    const data = `${fileName}:${expires}`;

    return createHmac('sha256', secretKey).update(data).digest('hex');
  }
}
