import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { join } from 'path';

import { FileUpload } from 'graphql-upload';
import { Repository } from 'typeorm';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { CodeEngineService } from 'src/engine/core-modules/code-engine/code-engine.service';
import {
  FunctionMetadataEntity,
  FunctionSyncStatus,
} from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';
import {
  FunctionMetadataException,
  FunctionMetadataExceptionCode,
} from 'src/engine/metadata-modules/function-metadata/function-metadata.exception';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';

@Injectable()
export class FunctionMetadataService {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly codeEngineService: CodeEngineService,
    @InjectRepository(FunctionMetadataEntity, 'metadata')
    private readonly functionMetadataRepository: Repository<FunctionMetadataEntity>,
  ) {}

  async executeOne(
    name: string,
    workspaceId: string,
    payload: object | undefined = undefined,
  ) {
    const functionToExecute = await this.functionMetadataRepository.findOne({
      where: {
        name,
        workspaceId,
      },
    });

    if (!functionToExecute) {
      throw new FunctionMetadataException(
        `Function does not exist`,
        FunctionMetadataExceptionCode.FUNCTION_NOT_FOUND,
      );
    }

    if (functionToExecute.syncStatus === FunctionSyncStatus.NOT_READY) {
      throw new FunctionMetadataException(
        `Function is not ready to be executed`,
        FunctionMetadataExceptionCode.FUNCTION_NOT_FOUND,
      );
    }

    return this.codeEngineService.execute(functionToExecute, payload);
  }

  async createOne(
    name: string,
    workspaceId: string,
    { createReadStream, mimetype }: FileUpload,
  ) {
    const existingFunctionMetadata =
      await this.functionMetadataRepository.findOne({
        where: { name, workspaceId },
      });

    if (existingFunctionMetadata) {
      throw new FunctionMetadataException(
        `Function already exists`,
        FunctionMetadataExceptionCode.FUNCTION_ALREADY_EXIST,
      );
    }

    const functionMetadata = await this.functionMetadataRepository.save({
      name,
      workspaceId,
    });

    const typescriptCode = await readFileContent(createReadStream());

    const fileFolder = join(
      FileFolder.Function,
      workspaceId,
      functionMetadata.id,
    );

    await this.fileUploadService.uploadFile({
      file: typescriptCode,
      filename: 'source.ts',
      mimeType: mimetype,
      fileFolder,
      forceName: true,
    });

    return functionMetadata;
  }
}
