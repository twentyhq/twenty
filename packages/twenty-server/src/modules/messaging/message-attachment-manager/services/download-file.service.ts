import { Injectable } from '@nestjs/common';

import crypto from 'node:crypto';

import axios from 'axios';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { getFileExtension } from 'src/modules/messaging/message-attachment-manager/utils/get-file-extension.util';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { MicrosoftFile } from 'src/modules/messaging/message-attachment-manager/types/microsoft-file.type';

const fileFolder = FileFolder.Attachment;

@Injectable()
export class DownloadFileService {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async microsoftDownloadFile(
    messageId: string,
    attachmentId: string,
    workspaceId: string,
    folderId?: string | string[],
  ) {
    const url =
      folderId === undefined
        ? `/me/messages/${messageId}/attachments/${attachmentId}`
        : typeof folderId === 'string'
          ? `/me/mailFolders/${folderId}/messages/${messageId}/attachments/${attachmentId}`
          : this.microsoftChildFoldersUrl(folderId, messageId, attachmentId);
    const fileFolder = FileFolder.Attachment;
    const options = {
      method: 'GET',
      url: url,
    };

    try {
      const response = await axios.request(options);
      const fileData = response.data as MicrosoftFile;
      const filename = 'microsoft_'.concat(fileData.name);
      const mimeType = fileData.contentType.split(';', 2)[0];
      const options2 = {
        method: 'GET',
        url: url.concat('/$value'),
      };
      const response2 = await axios.request(options2);
      const fileBinary = response2.data as string;

      return await this.fileUploadService.uploadFile({
        file: fileBinary,
        filename,
        mimeType,
        fileFolder,
        workspaceId,
      });
    } catch (e) {
      throw new Error(e); // TODO: probably different kind of error I guess?
    }
  }

  private microsoftChildFoldersUrl(
    folderId: string[],
    messageId: string,
    attachmentId: string,
  ) {
    let base = `/me/mailFolders/${folderId[0]}`;

    for (const folder of folderId.splice(0, 1)) {
      base.concat(`/childFolders/`, folder);
    }

    return base.concat(`/messages`, messageId, '/attachments', attachmentId);
  }

  async whatsappDownloadFile(
    messageId: string,
    mimeType: string | undefined,
    sha256: string | undefined,
    timestamp: string,
    url: string | undefined,
    bearerToken: string,
    workspaceId: string,
  ) {
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      url: url,
    };

    try {
      const response = await axios.request(options);
      const responseData: string = response.data; // is it really a string???
      const file: Buffer<ArrayBufferLike> = Buffer.from(responseData); // TODO: check if it's correct

      const checkIfDataIsCorrect =
        crypto.createHash('sha256').update(responseData).digest('hex') ===
        sha256;

      if (!checkIfDataIsCorrect) {
        throw new Error(); // TODO: fix
      }

      const fileExtension = getFileExtension(mimeType?.split(';', 2)[0] ?? '');
      const filename = 'whatsapp_'.concat(
        timestamp,
        '_',
        messageId,
        fileExtension,
      );

      return await this.fileUploadService.uploadFile({
        file,
        filename,
        mimeType,
        fileFolder,
        workspaceId,
      });
    } catch (e) {
      throw new Error(e); // TODO: different kind of error?
    }
  }

  async googleDownloadFile() {
    // TODO: understand how to download a file https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages.attachments
  }
}
