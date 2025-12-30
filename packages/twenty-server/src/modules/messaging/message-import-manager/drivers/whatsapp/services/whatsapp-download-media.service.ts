import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as crypto from 'node:crypto';

import axios from 'axios';
import { FieldActorSource } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { getFileExtension } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/utils/get-file-extension.util';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';

@Injectable()
export class WhatsappDownloadMediaService {
  constructor(
    @InjectRepository(AttachmentWorkspaceEntity)
    private readonly attachmentRepository: Repository<AttachmentWorkspaceEntity>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  // 1st POC: download a file, upload them somewhere on server and store them as attachment (or maybe file?) to People records
  async downloadFile(
    fileCategory: string,
    filenamePrefix: string,
    mimeType: string | undefined,
    personId: string,
    sha256: string | undefined,
    timestamp: string,
    url: string | undefined,
  ) {
    const options = {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ', // TODO: bearer token stored somewhere?
      },
      url: url,
    };

    const response = await axios.request(options);
    const responseData: string = response.data; // is it really a string???
    const file: Buffer<ArrayBufferLike> = Buffer.from(responseData); // TODO: check if it's correct

    const checkIfDataIsCorrect =
      crypto.createHash('sha256').update(responseData).digest('hex') === sha256;

    if (!checkIfDataIsCorrect) {
      return null;
    }
    const fileFolder = FileFolder.Attachment;
    const fileExtension = getFileExtension(mimeType?.split(';', 2)[0] ?? '');
    const filename = filenamePrefix.concat(timestamp, '_', fileExtension);
    const workspaceId = '???'; // TODO: find a way how to retrieve a current workspace id
    const uploadedFile = await this.fileUploadService.uploadFile({
      file,
      filename,
      mimeType,
      fileFolder,
      workspaceId,
    });

    this.attachmentRepository.create({
      name: uploadedFile.name,
      fullPath: uploadedFile.files[0].path,
      fileCategory: fileCategory,
      createdBy: {
        name: 'WhatsApp',
        source: FieldActorSource.IMPORT,
        workspaceMemberId: null,
      },
      personId: '', // TODO: person or personId?
    });

    return filename;
  }
}
