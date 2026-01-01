import { Injectable } from '@nestjs/common';

import crypto from 'node:crypto';

import axios from 'axios';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { getFileExtension } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/utils/get-file-extension.util';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';

@Injectable()
export class DownloadFileService {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async whatsappDownloadFile(
    fileCategory: string,
    mimeType: string | undefined,
    sha256: string | undefined,
    timestamp: string,
    url: string | undefined,
    bearerToken: string,
    workspaceId: string,
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {},
    );
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      url: url,
    };
    const response = await axios.request(options);
    const responseData: string = response.data; // is it really a string???
    const file: Buffer<ArrayBufferLike> = Buffer.from(responseData); // TODO: check if it's correct

    const checkIfDataIsCorrect =
      crypto.createHash('sha256').update(responseData).digest('hex') === sha256;

    if (!checkIfDataIsCorrect) {
      throw new Error(); // TODO: fix
    }
    const fileFolder = FileFolder.Attachment;
    const fileExtension = getFileExtension(mimeType?.split(';', 2)[0] ?? '');
    const filename = 'whatsapp_'.concat(timestamp, '_', fileExtension);

    return await this.fileUploadService.uploadFile({
      file,
      filename,
      mimeType,
      fileFolder,
      workspaceId,
    });
  }
}
